"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { currentUser } from "@/app/lib/authz";
import { toAgreementContext } from "@/app/lib/agreement-context";
import { renderAgreementHtml } from "@/app/lib/agreement-html";
import { persistSignedAgreement } from "@/app/lib/signed-agreement";
import { loadActiveAgreement } from "@/app/lib/agreement-versions";

/** A manager of a seated Founding Member may execute the Membership Agreement. */
async function assertSignatory(memberId: string) {
  const user = await currentUser();
  if (!user?.id || !user.email) throw new Error("Forbidden");
  const link = await db.userMember.findUnique({
    where: { userId_memberId: { userId: user.id, memberId } },
  });
  if (link?.role !== "manager") {
    throw new Error("Only an organization manager can sign the Membership Agreement.");
  }
  const member = await db.member.findUnique({
    where: { id: memberId },
    include: { membership: true },
  });
  if (
    !member ||
    member.membership?.track !== "founding_member" ||
    member.membership?.status !== "active"
  ) {
    throw new Error("Only seated Founding Members sign the Membership Agreement.");
  }
  return { user, member };
}

/** Render the personalised Membership Agreement to HTML for review. */
export async function previewMembershipAgreement(
  memberId: string,
  signerName?: string,
  signerTitle?: string,
): Promise<{ html?: string; error?: string }> {
  const active = await loadActiveAgreement();
  if (!active) return { error: "No active Membership Agreement is configured." };
  if (!active.intact) {
    return { error: "The Membership Agreement is temporarily unavailable. Please try again later." };
  }
  let ctx;
  try {
    const { user, member } = await assertSignatory(memberId);
    ctx = toAgreementContext({
      legalName: member.legalName,
      entityType: member.entityType,
      jurisdiction: member.jurisdiction,
      registeredAddress: member.registeredAddress,
      signerName,
      signerTitle,
      email: user.email,
      sector: member.membership!.sector!,
      region: member.membership!.region!,
      effectiveDate: new Date(),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Forbidden" };
  }
  try {
    return { html: renderAgreementHtml(ctx, active.content) };
  } catch (e) {
    console.error("[membership-agreement] preview render failed", e);
    return { error: "Could not render the agreement preview." };
  }
}

export type SignState = { error?: string; ok?: boolean };

/** Execute (e-sign) the binding Council Membership Agreement. */
export async function signMembershipAgreement(
  _prev: SignState,
  formData: FormData,
): Promise<SignState> {
  const memberId = String(formData.get("memberId") ?? "");
  const signerName = String(formData.get("signerName") ?? "").trim();
  const signerTitle = String(formData.get("signerTitle") ?? "").trim();
  if (!signerName) return { error: "Enter the signatory's name." };
  if (formData.get("accept") !== "on") return { error: "You must accept the agreement to sign." };

  const active = await loadActiveAgreement();
  if (!active) return { error: "No active Membership Agreement is configured." };
  if (!active.intact) {
    return { error: "The Membership Agreement is temporarily unavailable. Please try again later." };
  }

  let user, member;
  try {
    ({ user, member } = await assertSignatory(memberId));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Forbidden" };
  }

  const ctx = toAgreementContext({
    legalName: member.legalName,
    entityType: member.entityType,
    jurisdiction: member.jurisdiction,
    registeredAddress: member.registeredAddress,
    signerName,
    signerTitle: signerTitle || undefined,
    email: user.email,
    sector: member.membership!.sector!,
    region: member.membership!.region!,
    effectiveDate: new Date(),
  });

  const sig = await db.signatureRecord.create({
    data: {
      memberId,
      signerName,
      signerTitle: signerTitle || null,
      emailVerified: true,
      agreementVersion: active.version,
      agreementUrl: active.filename,
    },
  });
  try {
    await persistSignedAgreement({ memberId, signatureRecordId: sig.id, ctx, template: active.content });
  } catch (e) {
    console.error("[membership-agreement] persist failed", e);
  }
  await db.adminAction.create({
    data: {
      actorUserId: user.id,
      actorEmail: user.email!,
      action: "membership_agreement.sign",
      targetType: "Member",
      targetId: memberId,
      after: { version: active.version, signerName },
    },
  });

  revalidatePath("/account");
  return { ok: true };
}
