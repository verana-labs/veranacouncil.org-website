import { sendEmail, escapeHtml } from "@/app/lib/email";
import { emailLayout } from "@/app/lib/email-layout";

/**
 * Notifications for council-body email invites (companion to
 * access-emails.ts). Best-effort by design: invite mutations must never fail
 * because SMTP did, so callers fire-and-forget via `notify`.
 */

const SITE_URL = process.env.AUTH_URL ?? "https://veranacouncil.org";

export function wgRoleLabel(role: "lead" | "participant"): string {
  return role === "lead" ? "a lead" : "a participant";
}

/** The membership line of the invite email, by the body's access rule
 * (`associate` is the legacy enum name for "Founding Members only"). */
export function wgInviteMembershipHtml(
  requiredClass: "any" | "associate",
): string {
  return requiredClass === "associate"
    ? `<p style="margin:0 0 12px;">This body is open to <strong>seated
       Founding Members</strong> of the Verana Council. If your organization
       already holds a seat, ask one of its administrators to add this email
       address to the organization's access list; otherwise, apply for a
       Founding Council Seat — membership is free.</p>`
    : `<p style="margin:0 0 12px;">Council bodies are open to
       <strong>Council Members and Public-Sector Observers</strong>. If your
       organization is already a member or observer, ask one of its
       administrators to add this email address to the organization's access
       list; otherwise, apply — membership is free.</p>`;
}

/** Invitation to a body for someone without an active qualifying membership. */
export async function sendWgInviteEmail(args: {
  to: string;
  wgName: string;
  role: "lead" | "participant";
  requiredClass: "any" | "associate";
  invitedByName: string;
}): Promise<void> {
  const wg = `<strong>${escapeHtml(args.wgName)}</strong>`;
  await sendEmail({
    to: args.to,
    subject: `You're invited to ${args.wgName} — Verana Council`,
    html: emailLayout({
      heading: `You're invited to ${escapeHtml(args.wgName)}`,
      bodyHtml: `
        <p style="margin:0 0 12px;">${escapeHtml(args.invitedByName)} invited
        <strong>${escapeHtml(args.to)}</strong> to join ${wg}, a Verana Council
        body, as ${wgRoleLabel(args.role)}.</p>
        ${wgInviteMembershipHtml(args.requiredClass)}
        <p style="margin:0 0 12px;">Sign in with this email address (Google,
        GitHub, or a one-time code — no password needed). As soon as your
        membership is active you are added to the body automatically and its
        meeting invitations land in your calendar.</p>
        <p style="margin:0;">If you weren't expecting this, you can ignore this
        email.</p>`,
      button: { label: "Join the Council", href: `${SITE_URL}/join` },
    }),
  });
}

/** Confirmation when someone actually enters the body — either a direct add
 * of a qualifying user, or a pending invite converting on activation. */
export async function sendWgJoinedEmail(args: {
  to: string;
  wgName: string;
  wgSlug: string;
  role: "lead" | "participant";
}): Promise<void> {
  await sendEmail({
    to: args.to,
    subject: `You've joined ${args.wgName} — Verana Council`,
    html: emailLayout({
      heading: `You've joined ${escapeHtml(args.wgName)}`,
      bodyHtml: `
        <p style="margin:0;">You are now ${wgRoleLabel(args.role)} of
        <strong>${escapeHtml(args.wgName)}</strong> on the Verana Council
        site, and the body's meeting invitations will arrive in your
        calendar.</p>`,
      button: {
        label: "Open the council body",
        href: `${SITE_URL}/council-bodies/${args.wgSlug}`,
      },
    }),
  });
}
