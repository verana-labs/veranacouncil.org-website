import { db } from "@/app/lib/db";
import type { MemberRole, SignatoryStatus } from "@prisma/client";
import { getActiveVersion } from "@/app/lib/agreement-versions";
import { getCouncilSignatoryConfig } from "@/app/lib/settings";

/**
 * Orchestration for the bilateral Membership Agreement signing flow. Each
 * required signer is an `AgreementSignatory` row linked to a `MemberAccess`
 * entry; the side is derived (signer's org == the agreement's member ⇒ member
 * side, else council side). The agreement is fully executed once every row for
 * the active version is `signed`.
 */

export type SignatoryView = {
  id: string;
  email: string;
  name: string; // resolved display name (legal snapshot, else User name, else email)
  role: MemberRole;
  side: "member" | "council";
  status: SignatoryStatus;
  signedAt: string | null;
  hasPdf: boolean;
  /** True when the given viewer (by access-id set) owns this slot. */
  mine: boolean;
};

export type AgreementSigningView = {
  version: string | null;
  designated: boolean;
  total: number;
  signed: number;
  fullyExecuted: boolean;
  signatories: SignatoryView[];
};

/** The MemberAccess ids of the signed-in user (matched by verified email). */
export async function userAccessIds(email?: string | null): Promise<Set<string>> {
  if (!email) return new Set();
  const rows = await db.memberAccess.findMany({
    where: { email: { equals: email, mode: "insensitive" }, status: { not: "removed" } },
    select: { id: true },
  });
  return new Set(rows.map((r) => r.id));
}

async function resolveNames(emails: string[]): Promise<Map<string, string>> {
  const lower = [...new Set(emails.map((e) => e.toLowerCase()))];
  if (!lower.length) return new Map();
  const users = await db.user.findMany({
    where: { email: { in: lower, mode: "insensitive" } },
    select: { email: true, name: true, displayName: true },
  });
  const m = new Map<string, string>();
  for (const u of users) {
    if (u.email) m.set(u.email.toLowerCase(), u.displayName || u.name || u.email);
  }
  return m;
}

/** The member's access-list people (managers + reps), for the signer picker. */
export async function loadOrgPeople(memberId: string) {
  const rows = await db.memberAccess.findMany({
    where: { memberId, status: { not: "removed" } },
    orderBy: { addedAt: "asc" },
    select: { email: true, role: true },
  });
  const names = await resolveNames(rows.map((r) => r.email));
  return rows.map((r) => ({
    email: r.email,
    role: r.role as string,
    name: names.get(r.email.toLowerCase()) || r.email,
  }));
}

/** Load the signing state of a member's agreement for the active version. */
export async function loadAgreementSigning(
  memberId: string,
  viewerAccessIds: Set<string>,
): Promise<AgreementSigningView> {
  const active = await getActiveVersion();
  const version = active?.version ?? null;
  if (!version) {
    return { version: null, designated: false, total: 0, signed: 0, fullyExecuted: false, signatories: [] };
  }
  const rows = await db.agreementSignatory.findMany({
    where: { memberId, agreementVersion: version },
    include: { signer: true },
    orderBy: { createdAt: "asc" },
  });
  const names = await resolveNames(rows.map((r) => r.signer.email));
  const signatories: SignatoryView[] = rows.map((r) => ({
    id: r.id,
    email: r.signer.email,
    name: r.signerName || names.get(r.signer.email.toLowerCase()) || r.signer.email,
    role: r.signer.role,
    side: r.signer.memberId === memberId ? "member" : "council",
    status: r.status,
    signedAt: r.signedAt ? r.signedAt.toISOString().slice(0, 10) : null,
    hasPdf: !!r.agreementPdfPath,
    mine: viewerAccessIds.has(r.memberAccessId),
  }));
  const total = signatories.length;
  const signed = signatories.filter((s) => s.status === "signed").length;
  return {
    version,
    designated: total > 0,
    total,
    signed,
    fullyExecuted: total > 0 && signed === total,
    signatories,
  };
}

export type CountersignItem = {
  signatoryId: string;
  memberId: string;
  memberName: string;
  status: SignatoryStatus;
  signedAt: string | null;
};

/**
 * Pending/!signed council-side slots assigned to the signed-in user — agreements
 * of *other* organizations awaiting this person's council countersignature.
 */
export async function councilCountersignaturesFor(email?: string | null): Promise<CountersignItem[]> {
  const ids = await userAccessIds(email);
  if (!ids.size) return [];
  const rows = await db.agreementSignatory.findMany({
    where: { memberAccessId: { in: [...ids] } },
    include: { signer: true, member: { select: { id: true, legalName: true } } },
    orderBy: { createdAt: "desc" },
  });
  // Council side only: the signer's org differs from the agreement's member.
  return rows
    .filter((r) => r.signer.memberId !== r.memberId)
    .map((r) => ({
      signatoryId: r.id,
      memberId: r.memberId,
      memberName: r.member.legalName,
      status: r.status,
      signedAt: r.signedAt ? r.signedAt.toISOString().slice(0, 10) : null,
    }));
}

/**
 * Reconcile the signatory roster for a member's agreement at `version`:
 * - member side: exactly the chosen access ids (pending rows not chosen are
 *   removed; signed rows are always kept);
 * - council side: ensure a row exists for each configured council signatory.
 * Returns the resulting signatory rows.
 */
export async function syncSignatories(opts: {
  memberId: string;
  version: string;
  agreementUrl: string;
  memberAccessIds: string[]; // chosen member-side signers
  designatedByUserId?: string | null;
}) {
  const { memberId, version, agreementUrl, memberAccessIds, designatedByUserId } = opts;

  // Council-side access ids from config (resolve emails → council org access rows).
  const council = await getCouncilSignatoryConfig();
  let councilAccessIds: string[] = [];
  if (council.memberId && council.emails.length) {
    const rows = await db.memberAccess.findMany({
      where: {
        memberId: council.memberId,
        status: { not: "removed" },
        email: { in: council.emails, mode: "insensitive" },
      },
      select: { id: true },
    });
    councilAccessIds = rows.map((r) => r.id);
  }

  const wanted = new Set<string>([...memberAccessIds, ...councilAccessIds]);

  await db.$transaction(async (tx) => {
    // Drop pending member-side rows that are no longer chosen (keep signed ones,
    // keep council rows — those are config-driven).
    const existing = await tx.agreementSignatory.findMany({
      where: { memberId, agreementVersion: version },
      include: { signer: { select: { memberId: true } } },
    });
    const toDrop = existing.filter(
      (r) =>
        r.status === "pending" &&
        r.signer.memberId === memberId && // member side only
        !wanted.has(r.memberAccessId),
    );
    if (toDrop.length) {
      await tx.agreementSignatory.deleteMany({ where: { id: { in: toDrop.map((r) => r.id) } } });
    }
    // Create any missing wanted rows.
    const have = new Set(existing.map((r) => r.memberAccessId));
    const create = [...wanted].filter((id) => !have.has(id));
    for (const memberAccessId of create) {
      await tx.agreementSignatory.create({
        data: {
          memberId,
          memberAccessId,
          agreementVersion: version,
          agreementUrl,
          designatedByUserId: designatedByUserId ?? null,
        },
      });
    }
  });
}
