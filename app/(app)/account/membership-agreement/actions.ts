"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/app/lib/db";
import { currentUser, isManagerOf } from "@/app/lib/authz";
import { toAgreementContext } from "@/app/lib/agreement-context";
import { renderAgreementHtml } from "@/app/lib/agreement-html";
import { persistSignedAgreement } from "@/app/lib/signed-agreement";
import { loadActiveAgreement } from "@/app/lib/agreement-versions";
import { isAgreementSigningEnabled } from "@/app/lib/settings";
import { syncSignatories, userAccessIds } from "@/app/lib/agreement-signing";

export type DesignateState = { error?: string; ok?: boolean };
export type SignState = { error?: string; ok?: boolean };

/** A seated Founding Member is the only kind that signs the agreement. */
async function loadSeatedMember(memberId: string) {
  const member = await db.member.findUnique({
    where: { id: memberId },
    include: { membership: true },
  });
  if (
    !member ||
    member.membership?.track !== "founding_member" ||
    member.membership?.status !== "active"
  ) {
    return null;
  }
  return member;
}

/**
 * A manager designates which of the org's people must sign (member side); the
 * configured council signatories are added automatically. Reconciles against any
 * earlier designation for the active version.
 */
export async function designateMemberSignatories(
  memberId: string,
  emails: string[],
): Promise<DesignateState> {
  const user = await currentUser();
  if (!user?.id || !user.email) return { error: "Forbidden" };
  if (!(await isAgreementSigningEnabled())) return { error: "Agreement signing isn't enabled yet." };
  if (!(await isManagerOf(user.id, memberId))) {
    return { error: "Only an organization manager can set the signers." };
  }
  if (!(await loadSeatedMember(memberId))) {
    return { error: "Only seated Founding Members sign the Membership Agreement." };
  }

  const active = await loadActiveAgreement();
  if (!active) return { error: "No active Membership Agreement is configured." };
  if (!active.intact) {
    return { error: "The Membership Agreement is temporarily unavailable. Please try again later." };
  }

  const chosen = [...new Set(emails.map((e) => e.trim()).filter(Boolean))];
  const access = chosen.length
    ? await db.memberAccess.findMany({
        where: {
          memberId,
          status: { not: "removed" },
          email: { in: chosen, mode: "insensitive" },
        },
        select: { id: true },
      })
    : [];

  await syncSignatories({
    memberId,
    version: active.version,
    agreementUrl: active.filename,
    memberAccessIds: access.map((a) => a.id),
    designatedByUserId: user.id,
  });

  await db.adminAction.create({
    data: {
      actorUserId: user.id,
      actorEmail: user.email,
      action: "agreement.designate",
      targetType: "Member",
      targetId: memberId,
      after: { emails: chosen },
    },
  });

  revalidatePath("/account");
  return { ok: true };
}

/** Load a signatory slot and verify it belongs to the signed-in user. */
async function loadOwnSignatory(signatoryId: string) {
  const user = await currentUser();
  if (!user?.id || !user.email) return { error: "Forbidden" as const };
  const sig = await db.agreementSignatory.findUnique({
    where: { id: signatoryId },
    include: { signer: true, member: { include: { membership: true } } },
  });
  if (!sig) return { error: "Signature slot not found." as const };
  const ids = await userAccessIds(user.email);
  if (!ids.has(sig.memberAccessId)) {
    return { error: "This signature slot isn't assigned to you." as const };
  }
  return { user, sig };
}

/** Render the personalised agreement HTML for a signatory to review. */
export async function previewAgreement(
  signatoryId: string,
  signerName?: string,
  signerTitle?: string,
): Promise<{ html?: string; error?: string }> {
  const active = await loadActiveAgreement();
  if (!active) return { error: "No active Membership Agreement is configured." };
  if (!active.intact) {
    return { error: "The Membership Agreement is temporarily unavailable. Please try again later." };
  }
  const loaded = await loadOwnSignatory(signatoryId);
  if ("error" in loaded) return { error: loaded.error };
  const m = loaded.sig.member;
  if (!m.membership?.sector || !m.membership?.region) return { error: "Member is not seated." };
  const ctx = toAgreementContext({
    legalName: m.legalName,
    entityType: m.entityType,
    jurisdiction: m.jurisdiction,
    registeredAddress: m.registeredAddress,
    signerName,
    signerTitle,
    email: loaded.sig.signer.email,
    sector: m.membership.sector,
    region: m.membership.region,
    effectiveDate: new Date(),
  });
  try {
    return { html: renderAgreementHtml(ctx, active.content) };
  } catch (e) {
    console.error("[membership-agreement] preview render failed", e);
    return { error: "Could not render the agreement preview." };
  }
}

/** A designated signatory e-signs their own slot. */
export async function signAsSignatory(_prev: SignState, formData: FormData): Promise<SignState> {
  const signatoryId = String(formData.get("signatoryId") ?? "");
  const signerName = String(formData.get("signerName") ?? "").trim();
  const signerTitle = String(formData.get("signerTitle") ?? "").trim();
  if (!signerName) return { error: "Enter the signatory's name." };
  if (formData.get("accept") !== "on") return { error: "You must accept the agreement to sign." };
  if (!(await isAgreementSigningEnabled())) return { error: "Agreement signing isn't enabled yet." };

  const active = await loadActiveAgreement();
  if (!active) return { error: "No active Membership Agreement is configured." };
  if (!active.intact) {
    return { error: "The Membership Agreement is temporarily unavailable. Please try again later." };
  }

  const loaded = await loadOwnSignatory(signatoryId);
  if ("error" in loaded) return { error: loaded.error };
  const { user, sig } = loaded;
  if (sig.status === "signed") return { error: "You have already signed." };
  if (sig.agreementVersion !== active.version) {
    return { error: "The agreement version changed — reload the page and try again." };
  }
  const m = sig.member;
  if (!m.membership?.sector || !m.membership?.region) return { error: "Member is not seated." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = h.get("user-agent") || null;

  await db.agreementSignatory.update({
    where: { id: sig.id },
    data: {
      status: "signed",
      signerName,
      signerTitle: signerTitle || null,
      signedAt: new Date(),
      ip,
      userAgent,
    },
  });

  const ctx = toAgreementContext({
    legalName: m.legalName,
    entityType: m.entityType,
    jurisdiction: m.jurisdiction,
    registeredAddress: m.registeredAddress,
    signerName,
    signerTitle: signerTitle || undefined,
    email: sig.signer.email,
    sector: m.membership.sector,
    region: m.membership.region,
    effectiveDate: new Date(),
  });
  try {
    await persistSignedAgreement({ signatoryId: sig.id, ctx, template: active.content });
  } catch (e) {
    console.error("[membership-agreement] persist failed", e);
  }

  await db.adminAction.create({
    data: {
      actorUserId: user.id,
      actorEmail: user.email!,
      action: "membership_agreement.sign",
      targetType: "AgreementSignatory",
      targetId: sig.id,
      after: { version: active.version, signerName, memberId: sig.memberId },
    },
  });

  revalidatePath("/account");
  return { ok: true };
}
