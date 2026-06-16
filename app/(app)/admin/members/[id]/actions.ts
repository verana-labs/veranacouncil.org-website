"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { addRecord } from "@/app/lib/record";
import {
  membershipLabel,
  departedTitle,
  suspendedTitle,
  reinstatedTitle,
  wasNamed,
  isDepartureReason,
  type DepartureReason,
} from "@/app/lib/exits";
import { MEMBERSHIP_TRANSITIONS, type MembershipStatus } from "./transitions";

async function assertAdmin() {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) throw new Error("Forbidden");
  return user;
}

/**
 * Transition a membership to a new status (only along the allowed edges).
 * Exits of a *named* (seated) member are mirrored on the public record:
 * `member_departed` (with the reason, and any rationale published),
 * `member_suspended`, and `member_reinstated`. pending↔ended/active edges
 * are silent — proper seatings go through the candidacy/ballot flows.
 */
export async function setMembershipStatus(
  membershipId: string,
  memberId: string,
  status: MembershipStatus,
  opts?: { reason?: DepartureReason; rationale?: string },
) {
  const actor = await assertAdmin();
  const before = await db.membership.findUnique({ where: { id: membershipId } });
  if (!before) throw new Error("Membership not found");

  const allowed = MEMBERSHIP_TRANSITIONS[before.status as MembershipStatus] ?? [];
  if (!allowed.includes(status)) {
    throw new Error(`Invalid transition: ${before.status} → ${status}`);
  }

  const named = wasNamed(before.status);
  const isDeparture = status === "ended" && named;
  const isSuspension = status === "suspended" && before.status === "active";
  const isReinstatement = status === "active" && before.status === "suspended";

  // A departure must state its nature; removal for cause must publish why.
  const reason: DepartureReason =
    opts?.reason && isDepartureReason(opts.reason) ? opts.reason : "term_not_renewed";
  const rationale = opts?.rationale?.trim() || undefined;
  if (isDeparture && reason === "removal_for_cause" && !rationale) {
    throw new Error("A published rationale is required for removal for cause.");
  }

  const member = await db.member.findUnique({
    where: { id: memberId },
    select: { legalName: true },
  });
  const label = membershipLabel(before.track, before.sector, before.region);

  await db.$transaction(async (tx) => {
    await tx.membership.update({ where: { id: membershipId }, data: { status } });
    await tx.adminAction.create({
      data: {
        actorUserId: actor.id,
        actorEmail: actor.email!,
        action: "membership.status",
        targetType: "Membership",
        targetId: membershipId,
        before: { status: before.status },
        after: { status, ...(isDeparture ? { reason, rationale } : {}) },
      },
    });

    const name = member?.legalName ?? "A Council member";
    if (isDeparture) {
      await addRecord(
        {
          type: "member_departed",
          title: departedTitle(name, reason, label),
          body: rationale,
          refType: "member",
          refId: memberId,
        },
        tx,
      );
    } else if (isSuspension) {
      await addRecord(
        {
          type: "member_suspended",
          title: suspendedTitle(name, label),
          body: rationale,
          refType: "member",
          refId: memberId,
        },
        tx,
      );
    } else if (isReinstatement) {
      await addRecord(
        {
          type: "member_reinstated",
          title: reinstatedTitle(name, label),
          refType: "member",
          refId: memberId,
        },
        tx,
      );
    }
  });

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/");
  revalidatePath("/members");
}
