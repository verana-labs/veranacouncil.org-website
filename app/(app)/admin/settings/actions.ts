"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { activateVersion } from "@/app/lib/agreement-versions";
import { setSigningEnabled, setCouncilSignatory } from "@/app/lib/settings";

export type SettingsState = { error?: string; ok?: boolean };

async function assertAdmin() {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) return null;
  return user;
}

/** Enable or disable Membership Agreement signing (off by default). */
export async function setAgreementSigningEnabled(enabled: boolean): Promise<SettingsState> {
  const user = await assertAdmin();
  if (!user) return { error: "Forbidden" };
  await setSigningEnabled(enabled);
  await db.adminAction.create({
    data: {
      actorUserId: user.id,
      actorEmail: user.email!,
      action: "agreement.signing_enabled",
      targetType: "AppSetting",
      after: { enabled },
    },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/account");
  return { ok: true };
}

/**
 * Configure the council-side signatory: the organization signing on behalf of
 * the Council and which of its representatives must sign each agreement.
 */
export async function setCouncilSignatoryConfig(
  memberId: string | null,
  emails: string[],
): Promise<SettingsState> {
  const user = await assertAdmin();
  if (!user) return { error: "Forbidden" };

  const cleanId = memberId?.trim() || null;
  if (cleanId) {
    const org = await db.member.findUnique({ where: { id: cleanId } });
    if (!org) return { error: "Unknown organization." };
    // Only keep emails that are actually on the org's (non-removed) access list.
    const access = await db.memberAccess.findMany({
      where: { memberId: cleanId, status: { not: "removed" } },
      select: { email: true },
    });
    const allowed = new Set(access.map((a) => a.email.toLowerCase()));
    emails = [...new Set(emails.map((e) => e.trim()).filter(Boolean))].filter((e) =>
      allowed.has(e.toLowerCase()),
    );
  } else {
    emails = [];
  }

  await setCouncilSignatory(cleanId, emails);
  await db.adminAction.create({
    data: {
      actorUserId: user.id,
      actorEmail: user.email!,
      action: "agreement.council_signatory",
      targetType: "AppSetting",
      after: { memberId: cleanId, emails },
    },
  });
  revalidatePath("/admin/settings");
  return { ok: true };
}

/** Make the chosen legal/ version file the active Membership Agreement. */
export async function activateAgreementVersion(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) return { error: "Forbidden" };

  const filename = String(formData.get("filename") ?? "").trim();
  if (!filename) return { error: "Choose a version." };

  const res = await activateVersion(filename);
  if (!res.ok) return { error: res.error };

  await db.adminAction.create({
    data: {
      actorUserId: user.id,
      actorEmail: user.email!,
      action: "agreement.activate",
      targetType: "AgreementDocument",
      after: { filename },
    },
  });

  revalidatePath("/admin/settings");
  return { ok: true };
}
