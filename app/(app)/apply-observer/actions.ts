"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/app/lib/db";
import { currentUser } from "@/app/lib/authz";
import { saveMemberLogo } from "@/app/lib/logo";
import { sendEmail, escapeHtml } from "@/app/lib/email";
import { emailLayout } from "@/app/lib/email-layout";
import { normalizeWebsite } from "@/app/lib/website";

const SITE_URL = process.env.AUTH_URL ?? "https://veranacouncil.org";

export type ObserverApplyState = { error?: string };

/** Best-effort: store an optional org logo from the application form. */
async function maybeSaveLogo(
  formData: FormData,
  memberId: string,
  actor: { userId?: string | null; email: string },
) {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) return;
  try {
    await saveMemberLogo({
      memberId,
      file,
      displayConsent: formData.get("logoDisplayConsent") === "on",
      actor,
    });
  } catch (e) {
    console.error("[observer-apply] logo upload failed (continuing)", e);
  }
}

const schema = z.object({
  legalName: z.string().trim().min(1, "Required"),
  entityType: z.string().trim().optional(),
  jurisdiction: z.string().trim().min(1, "Select the country"),
  registeredAddress: z.string().trim().optional(),
  website: z.string().trim().max(300).optional(),
  contactName: z.string().trim().min(1, "Required"),
  contactRole: z.string().trim().optional(),
  socialAnnouncementConsent: z.boolean(),
  // The representation binds the individual submitter, not the organization.
  represent: z.literal(true),
});

/**
 * Submit a **Public-Sector Observer application** — non-binding, no sector/region
 * (Observers take no seat) and no ballot (non-voting track). Creates a *pending*
 * observer membership; the Council admits by listing it on the admin members
 * page. Free — no payment.
 */
export async function applyObserver(
  _prev: ObserverApplyState,
  formData: FormData,
): Promise<ObserverApplyState> {
  const user = await currentUser();
  if (!user?.email || !user.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/apply-observer")}`);
  }

  const parsed = schema.safeParse({
    legalName: formData.get("legalName"),
    entityType: formData.get("entityType") || undefined,
    jurisdiction: formData.get("jurisdiction"),
    registeredAddress: formData.get("registeredAddress") || undefined,
    website: formData.get("website") || undefined,
    contactName: formData.get("contactName"),
    contactRole: formData.get("contactRole") || undefined,
    socialAnnouncementConsent: formData.get("socialAnnouncementConsent") === "on",
    represent: formData.get("represent") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;

  const web = normalizeWebsite(d.website ?? "");
  if (web.error) return { error: web.error };

  // One Council relationship per organization: block if any org the user acts
  // for already has a live membership/application (anything but `ended`) or a
  // candidacy in flight.
  const links = await db.userMember.findMany({
    where: { userId: user.id },
    include: { member: { include: { candidacies: true, membership: true } } },
  });
  if (links.some((l) => l.member.membership && l.member.membership.status !== "ended")) {
    return {
      error: "Your organization already has a membership or application with the Council.",
    };
  }
  if (
    links.some((l) =>
      l.member.candidacies.some((c) =>
        ["applied", "signed", "queued", "ballot_open"].includes(c.status),
      ),
    )
  ) {
    return { error: "Your organization already has a candidacy in progress." };
  }
  // Reuse the org the user manages for a re-application; otherwise create one.
  const existing = links.find((l) => l.role === "manager")?.member ?? null;

  const memberId = await db.$transaction(async (tx) => {
    const memberData = {
      legalName: d.legalName,
      entityType: d.entityType ?? null,
      jurisdiction: d.jurisdiction,
      registeredAddress: d.registeredAddress ?? null,
      website: web.url,
      primaryEmail: user.email!,
      socialAnnouncementConsent: d.socialAnnouncementConsent,
    };
    const member = existing
      ? await tx.member.update({ where: { id: existing.id }, data: memberData })
      : await tx.member.create({
          data: {
            ...memberData,
            access: {
              create: {
                email: user.email!,
                role: "manager",
                status: "active",
                // Observers don't vote → not a voting representative.
                votingRep: false,
                addedByUserId: user.id,
              },
            },
          },
        });
    if (!existing) {
      await tx.userMember.create({
        data: { userId: user.id!, memberId: member.id, role: "manager" },
      });
    }
    // Pending observer application — private until the Council lists it (which
    // activates + names it on the public record). No candidacy, no ballot.
    await tx.membership.upsert({
      where: { memberId: member.id },
      update: { track: "observer", status: "pending", admission: "board", listed: false },
      create: {
        memberId: member.id,
        track: "observer",
        status: "pending",
        admission: "board",
        listed: false,
      },
    });
    return member.id;
  });

  await maybeSaveLogo(formData, memberId, { userId: user.id, email: user.email! });

  // Confirm to the submitter (best-effort).
  try {
    await sendEmail({
      to: user.email!,
      subject: "Your Verana Council observer application",
      html: emailLayout({
        heading: "Observer application received",
        bodyHtml: `<p style="margin:0 0 12px;">Thank you — we've recorded
        <strong>${escapeHtml(d.legalName)}</strong>'s application to participate as a
        <strong>Public-Sector Observer</strong> (non-voting).</p>
        <p style="margin:0 0 12px;">This is non-binding. The Council will review it;
        once accepted, your organization is listed and your representatives can take
        part in the Council bodies. You can follow the status from your account.</p>`,
        button: { label: "Go to your account", href: `${SITE_URL}/account` },
      }),
    });
  } catch (e) {
    console.error("[observer-apply] confirmation email failed", e);
  }

  // Tell the steward an observer application is awaiting review.
  try {
    const admins = await db.adminAllowlistEntry.findMany({ select: { email: true } });
    const to = admins.map((a) => a.email).join(",");
    if (to) {
      await sendEmail({
        to,
        subject: `Observer application — ${d.legalName}`,
        html: emailLayout({
          heading: "New observer application",
          bodyHtml: `<p style="margin:0 0 12px;">${escapeHtml(d.legalName)} applied to
          participate as a Public-Sector Observer
          (submitted by ${escapeHtml(d.contactName)}${d.contactRole ? ", " + escapeHtml(d.contactRole) : ""}).
          Accept it by listing the member.</p>`,
          button: { label: "Open members", href: `${SITE_URL}/admin/members` },
        }),
      });
    }
  } catch (e) {
    console.error("[observer-apply] admin notification failed", e);
  }

  redirect("/account");
}
