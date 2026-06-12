import { db } from "@/app/lib/db";
import { addRecord } from "@/app/lib/record";
import { seatLabel } from "@/app/lib/seats";

/**
 * The provisional admission-ballot mechanism (pre-mainnet only — sunsets at
 * mainnet launch, when all Council voting moves on-chain).
 *
 * Rules (defs.md):
 * - one ballot per candidate, accept / refuse — never head-to-head;
 * - ⅔ supermajority of seated Founding Members (electorate snapshot at open);
 * - async window (BALLOT_WINDOW_DAYS, default 14);
 * - FIFO per seat: one ballot at a time per seat, in completedAt order;
 * - a refusal ends that candidacy; the seat stays open (a seat only closes
 *   when someone is seated).
 */

export const BALLOT_WINDOW_DAYS = Number(process.env.BALLOT_WINDOW_DAYS ?? 14);

/** Seated Founding Members = the electorate (and the ⅔ denominator). */
export async function seatedVoters() {
  return db.member.findMany({
    where: {
      membership: { track: "founding_member", status: "active" },
      seat: { isNot: null },
    },
    select: { id: true, legalName: true },
  });
}

export function acceptThreshold(electorate: number): number {
  return Math.ceil((2 * electorate) / 3);
}

/**
 * Open the ballot for the next queued candidacy on a seat (FIFO). No-op if a
 * ballot is already open for the seat or nothing is queued.
 */
export async function openNextBallotForSeat(seatId: string, actorEmail: string) {
  const open = await db.candidacy.findFirst({
    where: { seatId, status: "ballot_open" },
    select: { id: true },
  });
  if (open) return null;

  const next = await db.candidacy.findFirst({
    where: { seatId, status: "queued" },
    orderBy: { completedAt: "asc" },
    include: { member: true, seat: true },
  });
  if (!next) return null;

  const electorate = (await seatedVoters()).length;
  const closesAt = new Date(Date.now() + BALLOT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const ballot = await db.$transaction(async (tx) => {
    const b = await tx.ballot.create({
      data: { candidacyId: next.id, closesAt, electorate },
    });
    await tx.candidacy.update({ where: { id: next.id }, data: { status: "ballot_open" } });
    await addRecord(
      {
        type: "ballot_opened",
        title: `Admission ballot opened — ${next.member.legalName} for ${seatLabel(next.seat.sector, next.seat.region)}`,
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
        targetId: next.id,
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
      candidacy: { include: { member: true, seat: true } },
    },
  });
  if (!ballot || ballot.status === "closed") return ballot;

  const accepts = ballot.votes.filter((v) => v.choice === "accept").length;
  const refuses = ballot.votes.filter((v) => v.choice === "refuse").length;
  const threshold = acceptThreshold(ballot.electorate);
  const due = ballot.closesAt <= new Date();
  const unreachable = ballot.electorate - refuses < threshold;

  if (!(due || accepts >= threshold || unreachable)) return ballot;

  const accepted = accepts >= threshold;
  const { candidacy } = ballot;
  const seat = candidacy.seat;

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
      await tx.seatCell.update({
        where: { id: seat.id },
        data: { seatedMemberId: candidacy.memberId, seatedAt },
      });
      await tx.membership.upsert({
        where: { memberId: candidacy.memberId },
        update: { track: "founding_member", status: "active", admission: "ballot", seatedAt },
        create: {
          memberId: candidacy.memberId,
          track: "founding_member",
          status: "active",
          admission: "ballot",
          seatedAt,
        },
      });
      // Other candidacies for this seat lapse (they may switch seats or stand by).
      await tx.candidacy.updateMany({
        where: { seatId: seat.id, id: { not: candidacy.id }, status: { in: ["applied", "signed", "queued"] } },
        data: { status: "lapsed" },
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
          title: `${candidacy.member.legalName} seated — ${seatLabel(seat.sector, seat.region)}`,
          refType: "seat",
          refId: seat.id,
        },
        tx,
      );
    } else {
      await addRecord(
        {
          type: "ballot_result",
          title: `Admission ballot result — ${candidacy.member.legalName} refused (${accepts}/${ballot.electorate} accept, threshold ${threshold})`,
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
