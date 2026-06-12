"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { openNextBallotForSeat, seatedVoters } from "@/app/lib/ballots";
import { addRecord } from "@/app/lib/record";
import { seatLabel } from "@/app/lib/seats";

/** Seed designations end as soon as the ⅔ mechanism can function. */
const SEED_COHORT_MAX = 3;

async function assertAdmin() {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) throw new Error("Forbidden");
  return user;
}

/** Vetting passed: the candidacy joins the seat's FIFO queue. */
export async function vetCandidacy(candidacyId: string) {
  const actor = await assertAdmin();
  const c = await db.candidacy.findUnique({ where: { id: candidacyId } });
  if (!c || c.status !== "signed") throw new Error("Candidacy is not awaiting vetting.");
  const now = new Date();
  await db.$transaction([
    db.candidacy.update({
      where: { id: candidacyId },
      data: { status: "queued", vettedAt: now, completedAt: now },
    }),
    db.adminAction.create({
      data: {
        actorUserId: actor.id,
        actorEmail: actor.email!,
        action: "candidacy.vet",
        targetType: "Candidacy",
        targetId: candidacyId,
      },
    }),
  ]);
  revalidatePath("/admin/candidacies");
}

/** Open the next FIFO ballot on a seat (steward act). */
export async function openBallot(seatId: string) {
  const actor = await assertAdmin();
  const ballot = await openNextBallotForSeat(seatId, actor.email!);
  if (!ballot) throw new Error("No queued candidacy, or a ballot is already open for this seat.");
  revalidatePath("/admin/candidacies");
  revalidatePath("/account/ballots");
}

/**
 * Seed designation (bootstrap): the steward directly seats one of the first
 * SEED_COHORT_MAX members, with a published rationale. From candidate #4
 * onward this action refuses — every admission goes through the ⅔ peer vote.
 */
export async function designateSeed(candidacyId: string, rationale: string) {
  const actor = await assertAdmin();
  const seated = await seatedVoters();
  if (seated.length >= SEED_COHORT_MAX) {
    throw new Error(
      `The seed cohort is complete (${SEED_COHORT_MAX}) — admissions now require a ⅔ peer vote.`,
    );
  }
  if (!rationale.trim()) throw new Error("A published rationale is required for a seed designation.");

  const c = await db.candidacy.findUnique({
    where: { id: candidacyId },
    include: { member: true, seat: true },
  });
  if (!c || !["signed", "queued"].includes(c.status)) {
    throw new Error("Candidacy must be signed (and vetted) before designation.");
  }
  if (c.seat.seatedMemberId) throw new Error("The seat is already taken.");

  const seatedAt = new Date();
  await db.$transaction(async (tx) => {
    await tx.candidacy.update({
      where: { id: c.id },
      data: { status: "accepted", vettedAt: c.vettedAt ?? seatedAt, completedAt: c.completedAt ?? seatedAt },
    });
    await tx.seatCell.update({
      where: { id: c.seatId },
      data: { seatedMemberId: c.memberId, seatedAt },
    });
    await tx.membership.upsert({
      where: { memberId: c.memberId },
      update: { track: "founding_member", status: "active", admission: "seed", seatedAt },
      create: {
        memberId: c.memberId,
        track: "founding_member",
        status: "active",
        admission: "seed",
        seatedAt,
      },
    });
    await tx.candidacy.updateMany({
      where: { seatId: c.seatId, id: { not: c.id }, status: { in: ["applied", "signed", "queued"] } },
      data: { status: "lapsed" },
    });
    await addRecord(
      {
        type: "seed_designation",
        title: `Seed designation — ${c.member.legalName} seated as ${seatLabel(c.seat.sector, c.seat.region)} (${seated.length + 1}/${SEED_COHORT_MAX})`,
        body: rationale.trim(),
        refType: "seat",
        refId: c.seatId,
      },
      tx,
    );
    await tx.adminAction.create({
      data: {
        actorUserId: actor.id,
        actorEmail: actor.email!,
        action: "candidacy.seed_designation",
        targetType: "Candidacy",
        targetId: c.id,
        after: { rationale: rationale.trim() },
      },
    });
  });
  revalidatePath("/admin/candidacies");
  revalidatePath("/members");
}

/** Accept a Public-Sector Observer (steward pre-incorporation; Board thereafter). */
export async function makeObserver(memberId: string) {
  const actor = await assertAdmin();
  const member = await db.member.findUnique({
    where: { id: memberId },
    include: { membership: true },
  });
  if (!member) throw new Error("Member not found.");
  if (member.membership?.status === "active") throw new Error("Already an active member.");

  await db.$transaction(async (tx) => {
    await tx.membership.upsert({
      where: { memberId },
      update: { track: "observer", status: "active", admission: "board" },
      create: { memberId, track: "observer", status: "active", admission: "board" },
    });
    await addRecord(
      {
        type: "observer_accepted",
        title: `Observer accepted — ${member.legalName}`,
        refType: "member",
        refId: memberId,
      },
      tx,
    );
    await tx.adminAction.create({
      data: {
        actorUserId: actor.id,
        actorEmail: actor.email!,
        action: "observer.accept",
        targetType: "Member",
        targetId: memberId,
      },
    });
  });
  revalidatePath("/admin/members");
}

/** Track a member's testnet-validator readiness (Technical/Validator committee). */
export async function setTestnetValidator(
  memberId: string,
  status: "none" | "in_progress" | "online",
) {
  const actor = await assertAdmin();
  await db.membership.update({
    where: { memberId },
    data: { testnetValidator: status },
  });
  await db.adminAction.create({
    data: {
      actorUserId: actor.id,
      actorEmail: actor.email!,
      action: "validator.testnet_status",
      targetType: "Member",
      targetId: memberId,
      after: { status },
    },
  });
  revalidatePath(`/admin/members/${memberId}`);
}
