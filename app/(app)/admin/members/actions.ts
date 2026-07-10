"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { addRecord } from "@/app/lib/record";
import {
  convertWgInvitesForEmails,
  memberReachableEmails,
} from "@/app/lib/wg-invites";

/**
 * Toggle a membership's presence on the public /members directory. Listing a
 * *pending* application also **accepts** it (status → active) — this is the
 * Council's admit gate for self-submitted Observer applications — and names the
 * organization on the public record.
 */
export async function toggleListed(formData: FormData) {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) throw new Error("Forbidden");

  const membershipId = String(formData.get("membershipId"));
  const membership = await db.membership.findUnique({
    where: { id: membershipId },
    include: { member: { select: { legalName: true } } },
  });
  if (!membership) throw new Error("Not found");

  const willList = !membership.listed;
  // Listing a pending application is the act of accepting it.
  const accepting = willList && membership.status === "pending";

  await db.$transaction(async (tx) => {
    await tx.membership.update({
      where: { id: membershipId },
      data: { listed: willList, ...(accepting ? { status: "active" } : {}) },
    });
    if (accepting && membership.track === "observer") {
      await addRecord(
        {
          type: "observer_accepted",
          title: `Observer accepted — ${membership.member.legalName}`,
          refType: "member",
          refId: membership.memberId,
        },
        tx,
      );
    }
    await tx.adminAction.create({
      data: {
        actorUserId: user.id,
        actorEmail: user.email!,
        action: accepting
          ? "observer.accept"
          : membership.listed
            ? "membership.unlist"
            : "membership.list",
        targetType: "Membership",
        targetId: membershipId,
      },
    });
  });

  // Listing a pending application accepts it: convert any pending council-body
  // invites addressed to the member's people.
  if (accepting) {
    await convertWgInvitesForEmails(
      await memberReachableEmails(membership.memberId),
    );
  }

  revalidatePath("/admin/members");
  revalidatePath("/members");
  revalidatePath("/");
}
