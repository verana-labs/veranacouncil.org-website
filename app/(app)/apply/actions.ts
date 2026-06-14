"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/app/lib/db";
import { currentUser } from "@/app/lib/authz";
import { saveMemberLogo } from "@/app/lib/logo";
import { sendExecutedAgreementEmail } from "@/app/lib/executed-agreement";
import { toAgreementContext } from "@/app/lib/agreement-context";
import { renderAgreementHtml } from "@/app/lib/agreement-html";
import { persistSignedAgreement } from "@/app/lib/signed-agreement";
import { loadActiveAgreement, type ActiveAgreement } from "@/app/lib/agreement-versions";
import { sendEmail, escapeHtml } from "@/app/lib/email";
import { emailLayout } from "@/app/lib/email-layout";
import { seatLabel } from "@/app/lib/seats";

const SITE_URL = process.env.AUTH_URL ?? "https://veranacouncil.org";

export type ApplyState = { error?: string };

/** Best-effort: never block a successful candidacy on email delivery. */
async function emailExecutedCopy(d: Parameters<typeof sendExecutedAgreementEmail>[0]) {
  try {
    await sendExecutedAgreementEmail(d);
  } catch (e) {
    console.error("[apply] executed-agreement email failed", e);
  }
}

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

/** Alert the admin allowlist that the active agreement file failed its hash check. */
async function notifyAdminsIntegrityFailure(active: ActiveAgreement) {
  try {
    const admins = await db.adminAllowlistEntry.findMany({ select: { email: true } });
    const to = admins.map((a) => a.email).join(",");
    if (!to) return;
    await sendEmail({
      to,
      subject: "⚠ Candidate Agreement integrity check failed — signing blocked",
      html: emailLayout({
        heading: "Agreement integrity check failed",
        bodyHtml: `
        <p style="margin:0 0 12px;">The active Candidate Agreement file no longer
        matches the hash it was published with, so new signatures are blocked
        until it is resolved.</p>
        <ul style="margin:0 0 12px;padding-left:18px;">
          <li>Version: ${escapeHtml(active.version)}</li>
          <li>File: ${escapeHtml(active.filename)}</li>
          <li>Expected: ${escapeHtml(active.pinnedHash)}</li>
          <li>Found: ${escapeHtml(active.currentHash ?? "(file missing)")}</li>
        </ul>
        <p style="margin:0;">Restore the original file, or publish a new version
        in Settings.</p>`,
        button: { label: "Open Settings", href: `${SITE_URL}/admin/settings` },
      }),
    });
  } catch (e) {
    console.error("[apply] admin integrity alert failed", e);
  }
}

/**
 * Render the personalised agreement to HTML for the wizard's review step, from
 * the data entered so far + the active version. Blocks if the active file failed
 * its integrity check (the signing step would block anyway).
 */
export async function previewAgreement(input: {
  seatId: string;
  legalName?: string;
  entityType?: string;
  jurisdiction?: string;
  registeredAddress?: string;
  signerName?: string;
  signerTitle?: string;
}): Promise<{ html?: string; error?: string }> {
  const active = await loadActiveAgreement();
  if (!active) return { error: "No active Candidate Agreement is configured." };
  if (!active.intact) {
    return { error: "The Candidate Agreement is temporarily unavailable. Please try again later." };
  }
  const seat = await db.seatCell.findUnique({ where: { id: input.seatId } });
  if (!seat) return { error: "Unknown seat." };
  const user = await currentUser();
  const ctx = toAgreementContext({
    legalName: input.legalName,
    entityType: input.entityType,
    jurisdiction: input.jurisdiction,
    registeredAddress: input.registeredAddress,
    signerName: input.signerName,
    signerTitle: input.signerTitle,
    email: user?.email,
    sector: seat.sector,
    region: seat.region,
    effectiveDate: new Date(),
  });
  try {
    return { html: renderAgreementHtml(ctx, active.content) };
  } catch (e) {
    console.error("[apply] preview render failed", e);
    return { error: "Could not render the agreement preview." };
  }
}

const candidacySchema = z.object({
  seatId: z.string().min(1),
  legalName: z.string().trim().min(1, "Required"),
  entityType: z.string().trim().optional(),
  jurisdiction: z.string().trim().min(1, "Select the country"),
  registeredAddress: z.string().trim().optional(),
  signerName: z.string().trim().min(1, "Required"),
  signerTitle: z.string().trim().optional(),
  socialAnnouncementConsent: z.boolean(),
  accept: z.literal(true),
});

/**
 * Open a candidacy: create (or reuse) the Member org, e-sign the Candidate
 * Agreement for the selected open seat, and put the candidacy into vetting.
 * Free — there is no payment step (Council membership is free).
 */
export async function applyCandidacy(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const user = await currentUser();
  if (!user?.email || !user.id) {
    // Fallback for a session that expired mid-form (the page is normally
    // auth-gated). Preserve the seat so sign-in returns to the right candidacy.
    const seatId = String(formData.get("seatId") ?? "");
    const target = seatId ? `/apply?seat=${seatId}` : "/apply";
    redirect(`/login?callbackUrl=${encodeURIComponent(target)}`);
  }

  const active = await loadActiveAgreement();
  if (!active) return { error: "No active Candidate Agreement is configured." };
  if (!active.intact) {
    await notifyAdminsIntegrityFailure(active);
    return { error: "The Candidate Agreement is temporarily unavailable. Please try again later." };
  }

  const parsed = candidacySchema.safeParse({
    seatId: formData.get("seatId"),
    legalName: formData.get("legalName"),
    entityType: formData.get("entityType") || undefined,
    jurisdiction: formData.get("jurisdiction"),
    registeredAddress: formData.get("registeredAddress") || undefined,
    signerName: formData.get("signerName"),
    signerTitle: formData.get("signerTitle") || undefined,
    socialAnnouncementConsent: formData.get("socialAnnouncementConsent") === "on",
    accept: formData.get("accept") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;
  const signedAt = new Date();

  const seat = await db.seatCell.findUnique({ where: { id: d.seatId } });
  if (!seat) return { error: "Unknown seat." };
  if (seat.seatedMemberId) {
    return { error: "This seat has been taken. Choose another open seat." };
  }

  // Reuse the org the user already manages (seat switch / successor candidacy);
  // otherwise create it. One live candidacy per org at a time.
  const existingLink = await db.userMember.findFirst({
    where: { userId: user.id, role: "manager" },
    include: { member: { include: { candidacies: true, membership: true } } },
  });
  const existing = existingLink?.member ?? null;
  if (existing?.membership?.status === "active") {
    return { error: "Your organization is already a Council member." };
  }
  const live = existing?.candidacies.some((c) =>
    ["applied", "signed", "queued", "ballot_open"].includes(c.status),
  );
  if (live) {
    return { error: "Your organization already has a candidacy in progress." };
  }

  const { memberId, signatureRecordId, candidacyId } = await db.$transaction(async (tx) => {
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
              create: { email: user.email!, role: "manager", status: "active", votingRep: true, addedByUserId: user.id },
            },
          },
        });
    if (!existing) {
      await tx.userMember.create({
        data: { userId: user.id!, memberId: member.id, role: "manager" },
      });
    }
    const sig = await tx.signatureRecord.create({
      data: {
        memberId: member.id,
        signerName: d.signerName,
        signerTitle: d.signerTitle ?? null,
        emailVerified: true,
        agreementVersion: active.version,
        agreementUrl: active.filename, // the version file that was signed
      },
    });
    const candidacy = await tx.candidacy.create({
      data: { memberId: member.id, seatId: seat.id, status: "signed", signatureId: sig.id },
    });
    // Applying is private: no public record entry. The org's public footprint
    // (directory, matrix name, record) appears only once an admin lists it in
    // /admin/members. The steward is notified by email + sees it in
    // /admin/candidacies; the seat shows an anonymous "candidate pending".
    return { memberId: member.id, signatureRecordId: sig.id, candidacyId: candidacy.id };
  });

  await maybeSaveLogo(formData, memberId, { userId: user.id, email: user.email! });

  const ctx = toAgreementContext({
    legalName: d.legalName,
    entityType: d.entityType,
    jurisdiction: d.jurisdiction,
    registeredAddress: d.registeredAddress,
    signerName: d.signerName,
    signerTitle: d.signerTitle,
    email: user.email,
    sector: seat.sector,
    region: seat.region,
    effectiveDate: signedAt,
  });
  let pdf: Buffer | undefined;
  let documentHash: string | undefined;
  try {
    ({ pdf, hash: documentHash } = await persistSignedAgreement({
      memberId,
      signatureRecordId,
      ctx,
      template: active.content,
    }));
  } catch (e) {
    console.error("[apply] persist signed agreement failed", e);
  }
  await emailExecutedCopy({
    to: user.email!,
    memberName: d.legalName,
    seat: seatLabel(seat.sector, seat.region),
    signerName: d.signerName,
    signedAt,
    agreementVersion: active.version,
    agreementSource: active.filename,
    versionHash: active.pinnedHash,
    documentHash: documentHash ?? null,
    agreementPdf: pdf,
  });

  // Tell the steward a candidacy is awaiting vetting.
  try {
    const admins = await db.adminAllowlistEntry.findMany({ select: { email: true } });
    const to = admins.map((a) => a.email).join(",");
    if (to) {
      await sendEmail({
        to,
        subject: `Candidacy awaiting vetting — ${d.legalName}`,
        html: emailLayout({
          heading: "New Council candidacy",
          bodyHtml: `<p style="margin:0 0 12px;">${escapeHtml(d.legalName)} signed the
          Candidate Agreement for <strong>${escapeHtml(seatLabel(seat.sector, seat.region))}</strong>
          and is awaiting vetting.</p>`,
          button: { label: "Open candidacies", href: `${SITE_URL}/admin/candidacies` },
        }),
      });
    }
  } catch (e) {
    console.error("[apply] admin notification failed", e);
  }

  void candidacyId;
  redirect("/account");
}
