import { db } from "@/app/lib/db";

/**
 * Admin-managed app configuration (AppSetting key/value). Currently holds the
 * Membership Agreement signing toggle and the council-side signatory config.
 */

const SIGNING_ENABLED = "agreement_signing_enabled";
const COUNCIL_MEMBER = "council_signatory_member_id";
const COUNCIL_EMAILS = "council_signatory_emails";

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.appSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/** Agreement signing is off unless explicitly enabled. */
export async function isAgreementSigningEnabled(): Promise<boolean> {
  return (await getSetting(SIGNING_ENABLED)) === "true";
}

export async function setSigningEnabled(enabled: boolean): Promise<void> {
  await setSetting(SIGNING_ENABLED, enabled ? "true" : "false");
}

export type CouncilSignatoryConfig = { memberId: string | null; emails: string[] };

/** The org signing on behalf of the Council, and which of its reps must sign. */
export async function getCouncilSignatoryConfig(): Promise<CouncilSignatoryConfig> {
  const [memberId, emailsRaw] = await Promise.all([
    getSetting(COUNCIL_MEMBER),
    getSetting(COUNCIL_EMAILS),
  ]);
  let emails: string[] = [];
  if (emailsRaw) {
    try {
      const parsed = JSON.parse(emailsRaw);
      if (Array.isArray(parsed)) emails = parsed.filter((e): e is string => typeof e === "string");
    } catch {
      /* malformed — treat as none */
    }
  }
  return { memberId: memberId || null, emails };
}

export async function setCouncilSignatory(
  memberId: string | null,
  emails: string[],
): Promise<void> {
  await Promise.all([
    setSetting(COUNCIL_MEMBER, memberId ?? ""),
    setSetting(COUNCIL_EMAILS, JSON.stringify(emails)),
  ]);
}
