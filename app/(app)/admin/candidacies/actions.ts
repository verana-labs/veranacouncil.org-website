"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { openBallotForCandidacy, seatedCount } from "@/app/lib/ballots";
import { addRecord } from "@/app/lib/record";
import { seatLabel, COUNCIL_SEAT_CAP } from "@/app/lib/seats";

/** Seed designations end as soon as the ⅔ mechanism can function. */
const SEED_COHORT_MAX = 3;

async function assertAdmin() {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) throw new Error("Forbidden");
  return user;
}

/** Vetting passed: the candidacy becomes eligible for a ballot. */
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

/**
 * Withdraw a candidacy (steward act) — for abandoned (e.g. cancelled by the
 * org) or erroneous candidacies. Clears it from the seat board and pipeline;
 * closes any open ballot. Not a public-record event.
 */
export async function withdrawCandidacy(candidacyId: string) {
  const actor = await assertAdmin();
  const c = await db.candidacy.findUnique({
    where: { id: candidacyId },
    include: { ballot: true },
  });
  if (!c) throw new Error("Candidacy not found.");
  if (!["applied", "signed", "queued", "ballot_open"].includes(c.status)) {
    throw new Error("This candidacy is not live.");
  }
  await db.$transaction(async (tx) => {
    if (c.ballot && c.ballot.status === "open") {
      await tx.ballot.update({
        where: { id: c.ballot.id },
        data: { status: "closed", outcome: "refused", closedAt: new Date() },
      });
    }
    await tx.candidacy.update({ where: { id: c.id }, data: { status: "withdrawn" } });
    await tx.adminAction.create({
      data: {
        actorUserId: actor.id,
        actorEmail: actor.email!,
        action: "candidacy.withdraw",
        targetType: "Candidacy",
        targetId: c.id,
      },
    });
  });
  revalidatePath("/admin/candidacies");
  revalidatePath("/");
  revalidatePath("/members");
}

/** Open the admission ballot for a vetted candidacy (steward act). */
export async function openBallot(candidacyId: string) {
  const actor = await assertAdmin();
  const ballot = await openBallotForCandidacy(candidacyId, actor.email!);
  if (!ballot) throw new Error("Candidacy is not vetted, or a ballot is already open for it.");
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
  const seated = await seatedCount();
  if (seated >= SEED_COHORT_MAX) {
    throw new Error(
      `The seed cohort is complete (${SEED_COHORT_MAX}) — admissions now require a ⅔ peer vote.`,
    );
  }
  if (seated >= COUNCIL_SEAT_CAP) throw new Error(`The ${COUNCIL_SEAT_CAP}-seat cap is reached.`);
  if (!rationale.trim()) throw new Error("A published rationale is required for a seed designation.");

  const c = await db.candidacy.findUnique({
    where: { id: candidacyId },
    include: { member: true },
  });
  if (!c || !["signed", "queued"].includes(c.status)) {
    throw new Error("Candidacy must be signed (and vetted) before designation.");
  }

  const seatedAt = new Date();
  await db.$transaction(async (tx) => {
    await tx.candidacy.update({
      where: { id: c.id },
      data: { status: "accepted", vettedAt: c.vettedAt ?? seatedAt, completedAt: c.completedAt ?? seatedAt },
    });
    await tx.membership.upsert({
      where: { memberId: c.memberId },
      update: {
        track: "founding_member",
        status: "active",
        admission: "seed",
        sector: c.sector,
        region: c.region,
        seatedAt,
      },
      create: {
        memberId: c.memberId,
        track: "founding_member",
        status: "active",
        admission: "seed",
        sector: c.sector,
        region: c.region,
        seatedAt,
      },
    });
    await addRecord(
      {
        type: "seed_designation",
        title: `Seed designation — ${c.member.legalName} seated as ${seatLabel(c.sector, c.region)} (${seated + 1}/${SEED_COHORT_MAX})`,
        body: rationale.trim(),
        refType: "member",
        refId: c.memberId,
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
