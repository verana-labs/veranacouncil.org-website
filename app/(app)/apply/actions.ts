"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/app/lib/db";
import { currentUser } from "@/app/lib/authz";
import { saveMemberLogo } from "@/app/lib/logo";
import { sendEmail, escapeHtml } from "@/app/lib/email";
import { emailLayout } from "@/app/lib/email-layout";
import { seatLabel } from "@/app/lib/seats";
import { Sector, Region } from "@prisma/client";

const SITE_URL = process.env.AUTH_URL ?? "https://veranacouncil.org";

export type ApplyState = { error?: string };

/** Best-effort: store an optional org logo from the candidacy form. */
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
    // A bad logo never fails the candidacy; it can be re-uploaded later.
    console.error("[apply] logo upload failed (continuing)", e);
  }
}

const eoiSchema = z.object({
  sector: z.nativeEnum(Sector),
  region: z.nativeEnum(Region),
  legalName: z.string().trim().min(1, "Required"),
  entityType: z.string().trim().optional(),
  jurisdiction: z.string().trim().min(1, "Select the country"),
  registeredAddress: z.string().trim().optional(),
  contactName: z.string().trim().min(1, "Required"),
  contactRole: z.string().trim().optional(),
  socialAnnouncementConsent: z.boolean(),
  // The representation: binds the individual submitter, not the organization.
  represent: z.literal(true),
});

/**
 * Open a candidacy as a **non-binding Expression of Interest**. No document is
 * signed and the organization is not bound — any authorized representative can
 * postulate without legal review. The single binding instrument (the Council
 * Membership Agreement) is executed later, at acceptance/seating and
 * incorporation, as its own console step. Free — no payment.
 */
export async function applyCandidacy(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const user = await currentUser();
  if (!user?.email || !user.id) {
    // Fallback for a session that expired mid-form (the page is normally
    // auth-gated). Preserve the sector so sign-in returns to the right form.
    const sector = String(formData.get("sector") ?? "");
    const target = sector ? `/apply?sector=${sector}` : "/apply";
    redirect(`/login?callbackUrl=${encodeURIComponent(target)}`);
  }

  const parsed = eoiSchema.safeParse({
    sector: formData.get("sector"),
    region: formData.get("region"),
    legalName: formData.get("legalName"),
    entityType: formData.get("entityType") || undefined,
    jurisdiction: formData.get("jurisdiction"),
    registeredAddress: formData.get("registeredAddress") || undefined,
    contactName: formData.get("contactName"),
    contactRole: formData.get("contactRole") || undefined,
    socialAnnouncementConsent: formData.get("socialAnnouncementConsent") === "on",
    represent: formData.get("represent") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;

  // Consider every organization this user belongs to (manager OR
  // representative), not just one they manage: a person who already
  // represents a seated member — or an org with a candidacy in flight —
  // cannot start a separate candidacy for a new seat.
  const links = await db.userMember.findMany({
    where: { userId: user.id },
    include: { member: { include: { candidacies: true, membership: true } } },
  });
  if (links.some((l) => l.member.membership?.status === "active")) {
    return { error: "Your organization is already a Council member, so you can't apply for another seat." };
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
  // Reuse the org the user manages for a re-application (e.g. after a refusal),
  // so we update it rather than creating a duplicate; otherwise create one.
  const existing = links.find((l) => l.role === "manager")?.member ?? null;

  const memberId = await db.$transaction(async (tx) => {
    const memberData = {
      legalName: d.legalName,
      entityType: d.entityType ?? null,
      jurisdiction: d.jurisdiction,
      registeredAddress: d.registeredAddress ?? null,
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
                votingRep: true,
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
    // `signed` here means "EOI submitted, awaiting vetting" — there is no
    // signature. Applying is private: no public record entry; the org's public
    // footprint appears only once seated and admin-listed.
    await tx.candidacy.create({
      data: { memberId: member.id, sector: d.sector, region: d.region, status: "signed" },
    });
    return member.id;
  });

  await maybeSaveLogo(formData, memberId, { userId: user.id, email: user.email! });

  // Confirm to the submitter (best-effort).
  try {
    await sendEmail({
      to: user.email!,
      subject: "Your Verana Council expression of interest",
      html: emailLayout({
        heading: "Expression of interest received",
        bodyHtml: `<p style="margin:0 0 12px;">Thank you — we've recorded
        <strong>${escapeHtml(d.legalName)}</strong>'s expression of interest in a
        Founding Council seat (<strong>${escapeHtml(seatLabel(d.sector, d.region))}</strong>).</p>
        <p style="margin:0 0 12px;">This is non-binding. The Membership &amp; Seats
        Committee will review it; if it proceeds to an admission ballot and your
        organization is accepted, the binding Council Membership Agreement is
        executed later — with time for your legal team to review. You can follow
        the status from your account.</p>`,
        button: { label: "Go to your account", href: `${SITE_URL}/account` },
      }),
    });
  } catch (e) {
    console.error("[apply] confirmation email failed", e);
  }

  // Tell the steward a candidacy is awaiting vetting.
  try {
    const admins = await db.adminAllowlistEntry.findMany({ select: { email: true } });
    const to = admins.map((a) => a.email).join(",");
    if (to) {
      await sendEmail({
        to,
        subject: `Expression of interest — ${d.legalName}`,
        html: emailLayout({
          heading: "New Council candidacy",
          bodyHtml: `<p style="margin:0 0 12px;">${escapeHtml(d.legalName)} expressed
          interest in <strong>${escapeHtml(seatLabel(d.sector, d.region))}</strong>
          (submitted by ${escapeHtml(d.contactName)}${d.contactRole ? ", " + escapeHtml(d.contactRole) : ""})
          and is awaiting vetting.</p>`,
          button: { label: "Open candidacies", href: `${SITE_URL}/admin/candidacies` },
        }),
      });
    }
  } catch (e) {
    console.error("[apply] admin notification failed", e);
  }

  redirect("/account");
}
