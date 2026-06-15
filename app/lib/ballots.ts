import { db } from "@/app/lib/db";
import { addRecord } from "@/app/lib/record";
import { seatLabel, COUNCIL_SEAT_CAP } from "@/app/lib/seats";

/**
 * The provisional admission-ballot mechanism (pre-mainnet only — sunsets at
 * mainnet launch, when all Council voting moves on-chain).
 *
 * Rules (defs.md):
 * - one ballot per candidate, accept / refuse — never head-to-head;
 * - ⅔ supermajority of seated Founding Members (electorate snapshot at open);
 * - async window (BALLOT_WINDOW_DAYS, default 14);
 * - candidacies are an independent pool (no per-seat queue); admissions stop at
 *   the 25-seat cap;
 * - a candidate is named in the public record only once accepted/seated.
 */

export const BALLOT_WINDOW_DAYS = Number(process.env.BALLOT_WINDOW_DAYS ?? 14);

/** Seated Founding Members = the electorate (and the ⅔ denominator). */
export async function seatedVoters() {
  return db.member.findMany({
    where: { membership: { track: "founding_member", status: "active" } },
    select: { id: true, legalName: true },
  });
}

/** How many Founding Members are seated (against the cap). */
export async function seatedCount() {
  return db.membership.count({
    where: { track: "founding_member", status: "active" },
  });
}

export function acceptThreshold(electorate: number): number {
  return Math.ceil((2 * electorate) / 3);
}

/**
 * Open the admission ballot for a vetted (queued) candidacy. No-op if the
 * candidacy isn't queued or already has a ballot. Refuses if the seat cap is
 * already reached.
 */
export async function openBallotForCandidacy(candidacyId: string, actorEmail: string) {
  const candidacy = await db.candidacy.findUnique({
    where: { id: candidacyId },
    include: { member: true, ballot: true },
  });
  if (!candidacy || candidacy.status !== "queued" || candidacy.ballot) return null;
  if ((await seatedCount()) >= COUNCIL_SEAT_CAP) {
    throw new Error(`The ${COUNCIL_SEAT_CAP}-seat cap is reached — no new ballots until a seat frees.`);
  }

  const electorate = (await seatedVoters()).length;
  const closesAt = new Date(Date.now() + BALLOT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const ballot = await db.$transaction(async (tx) => {
    const b = await tx.ballot.create({
      data: { candidacyId: candidacy.id, closesAt, electorate },
    });
    await tx.candidacy.update({ where: { id: candidacy.id }, data: { status: "ballot_open" } });
    await addRecord(
      {
        // Anonymous: show that a seat is under vote, never the candidate's name.
        // The organization is named publicly only once accepted/seated.
        type: "ballot_opened",
        title: `Admission ballot open — ${seatLabel(candidacy.sector, candidacy.region)}`,
        refType: "ballot",
        refId: b.id,
      },
      tx,
    );
    await tx.adminAction.create({
      data: {
        actorEmail,
        action: "ballot.open",
        targetType: "candidacy",
        targetId: candidacy.id,
        after: { electorate, closesAt: closesAt.toISOString() },
      },
    });
    return b;
  });
  return ballot;
}

/**
 * Tally and, when decided or due, close a ballot. Decided early when the ⅔
 * threshold is reached or has become unreachable; otherwise closes at the
 * window end (insufficient accepts ⇒ refused).
 */
export async function settleBallot(ballotId: string) {
  const ballot = await db.ballot.findUnique({
    where: { id: ballotId },
    include: {
      votes: true,
      candidacy: { include: { member: true } },
    },
  });
  if (!ballot || ballot.status === "closed") return ballot;

  const accepts = ballot.votes.filter((v) => v.choice === "accept").length;
  const refuses = ballot.votes.filter((v) => v.choice === "refuse").length;
  const threshold = acceptThreshold(ballot.electorate);
  const due = ballot.closesAt <= new Date();
  const unreachable = ballot.electorate - refuses < threshold;

  if (!(due || accepts >= threshold || unreachable)) return ballot;

  // Honour the cap even on a passing vote (cap could have filled meanwhile).
  const accepted = accepts >= threshold && (await seatedCount()) < COUNCIL_SEAT_CAP;
  const { candidacy } = ballot;

  await db.$transaction(async (tx) => {
    await tx.ballot.update({
      where: { id: ballot.id },
      data: { status: "closed", outcome: accepted ? "accepted" : "refused", closedAt: new Date() },
    });
    await tx.candidacy.update({
      where: { id: candidacy.id },
      data: { status: accepted ? "accepted" : "refused" },
    });

    if (accepted) {
      const seatedAt = new Date();
      await tx.membership.upsert({
        where: { memberId: candidacy.memberId },
        update: {
          track: "founding_member",
          status: "active",
          admission: "ballot",
          sector: candidacy.sector,
          region: candidacy.region,
          seatedAt,
          // Seating publishes the member to the record + directory; auto-list
          // it (admins can Unlist from /admin/members if needed).
          listed: true,
        },
        create: {
          memberId: candidacy.memberId,
          track: "founding_member",
          status: "active",
          admission: "ballot",
          sector: candidacy.sector,
          region: candidacy.region,
          seatedAt,
          listed: true,
        },
      });
      await addRecord(
        {
          type: "ballot_result",
          title: `Admission ballot result — ${candidacy.member.legalName} accepted (${accepts}/${ballot.electorate}, threshold ${threshold})`,
          refType: "ballot",
          refId: ballot.id,
        },
        tx,
      );
      await addRecord(
        {
          type: "member_seated",
          title: `${candidacy.member.legalName} seated — ${seatLabel(candidacy.sector, candidacy.region)}`,
          refType: "member",
          refId: candidacy.memberId,
        },
        tx,
      );
    } else {
      await addRecord(
        {
          // Anonymous: a refused candidate is never named publicly.
          type: "ballot_result",
          title: `Admission ballot closed — ${seatLabel(candidacy.sector, candidacy.region)}: candidate not admitted (${accepts}/${ballot.electorate} accept, threshold ${threshold})`,
          refType: "ballot",
          refId: ballot.id,
        },
        tx,
      );
    }
  });

  return db.ballot.findUnique({ where: { id: ballot.id } });
}

/** Close every ballot whose window has ended (cron). */
export async function settleDueBallots() {
  const due = await db.ballot.findMany({
    where: { status: "open", closesAt: { lte: new Date() } },
    select: { id: true },
  });
  for (const b of due) await settleBallot(b.id);
  return due.length;
}
