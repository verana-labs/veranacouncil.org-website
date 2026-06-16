"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { addRecord } from "@/app/lib/record";
import { normalizeWebsite } from "@/app/lib/website";
import { sendAddedToOrgEmail } from "@/app/lib/access-emails";

export type AddObserverState = { error?: string };

const observerSchema = z.object({
  legalName: z.string().trim().min(1, "Organization name is required").max(200),
  jurisdiction: z.string().trim().optional(),
  entityType: z.string().trim().max(120).optional(),
  website: z.string().trim().max(300).optional(),
  contactEmail: z.string().trim().toLowerCase().email("Enter a valid contact email"),
});

/**
 * Onboard a Public-Sector Observer (a steward/Board decision, not self-service).
 * Creates the organization, invites the contact as its manager (so their rep can
 * sign in and act for the org), and accepts it on the observer track. Mirrors
 * makeObserver but creates the member from scratch — observers have no candidacy.
 */
export async function addObserver(
  _prev: AddObserverState,
  formData: FormData,
): Promise<AddObserverState> {
  const user = await currentUser();
  if (!user?.id || !user.email || !(await isAdmin(user.email))) return { error: "Forbidden" };

  const parsed = observerSchema.safeParse({
    legalName: formData.get("legalName"),
    jurisdiction: formData.get("jurisdiction") || undefined,
    entityType: formData.get("entityType") || undefined,
    website: formData.get("website") || undefined,
    contactEmail: formData.get("contactEmail"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;

  const web = normalizeWebsite(d.website ?? "");
  if (web.error) return { error: web.error };

  const memberId = await db.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        type: "organization",
        legalName: d.legalName,
        entityType: d.entityType ?? null,
        jurisdiction: d.jurisdiction ?? null,
        website: web.url,
        primaryEmail: d.contactEmail,
        noticeEmail: d.contactEmail,
        // Invite the contact as a manager; the link is created on their first
        // verified sign-in (lib/access.ts). Observers don't vote → not a voting rep.
        access: {
          create: {
            email: d.contactEmail,
            role: "manager",
            status: "invited",
            votingRep: false,
            addedByUserId: user.id,
          },
        },
        membership: {
          create: { track: "observer", status: "active", admission: "board", listed: true },
        },
      },
    });
    await addRecord(
      {
        type: "observer_accepted",
        title: `Observer accepted — ${member.legalName}`,
        refType: "member",
        refId: member.id,
      },
      tx,
    );
    await tx.adminAction.create({
      data: {
        actorUserId: user.id,
        actorEmail: user.email!,
        action: "observer.add",
        targetType: "Member",
        targetId: member.id,
        after: { legalName: d.legalName, contactEmail: d.contactEmail },
      },
    });
    return member.id;
  });

  // Best-effort invite so the contact can sign in and act for the organization.
  try {
    await sendAddedToOrgEmail({
      to: d.contactEmail,
      orgName: d.legalName,
      role: "manager",
      hasAccount: false,
    });
  } catch (e) {
    console.error("[admin] observer invite email failed", e);
  }

  revalidatePath("/admin/members");
  revalidatePath("/members");
  redirect(`/admin/members/${memberId}`);
}

/** Toggle whether a membership appears on the public /members directory. */
export async function toggleListed(formData: FormData) {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) throw new Error("Forbidden");

  const membershipId = String(formData.get("membershipId"));
  const membership = await db.membership.findUnique({ where: { id: membershipId } });
  if (!membership) throw new Error("Not found");

  await db.$transaction([
    db.membership.update({
      where: { id: membershipId },
      data: { listed: !membership.listed },
    }),
    db.adminAction.create({
      data: {
        actorUserId: user.id,
        actorEmail: user.email!,
        action: membership.listed ? "membership.unlist" : "membership.list",
        targetType: "Membership",
        targetId: membershipId,
      },
    }),
  ]);

  revalidatePath("/admin/members");
  revalidatePath("/members");
}
