"use server";

import { z } from "zod";
import { db } from "@/app/lib/db";
import { currentUser } from "@/app/lib/authz";

export type EoiState = { ok?: boolean; error?: string };

const schema = z.object({
  orgName: z.string().trim().min(1, "Organization name is required").max(200),
  sector: z.string().trim().min(1, "Sector is required").max(120),
  intendedRole: z.string().trim().min(1, "Intended role is required").max(120),
  contactName: z.string().trim().min(1, "Contact name is required").max(120),
  contactEmail: z.string().trim().email("Enter a valid email").max(200),
  message: z.string().trim().max(4000).optional(),
});

/**
 * Non-binding ECS Ecosystem Participant expression of interest (waitlist).
 * The formal selection process opens once the Council delivers the ECS-EGF.
 */
export async function submitEcsInterest(
  _prev: EoiState,
  formData: FormData,
): Promise<EoiState> {
  // Honeypot: bots fill the invisible field.
  if ((formData.get("website") as string)?.trim()) return { ok: true };

  const parsed = schema.safeParse({
    orgName: formData.get("orgName"),
    sector: formData.get("sector"),
    intendedRole: formData.get("intendedRole"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const user = await currentUser();
  await db.ecsInterest.create({
    data: { ...parsed.data, userId: user?.id ?? null },
  });
  return { ok: true };
}
