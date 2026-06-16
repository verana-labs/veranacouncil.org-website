import type { Sector, Region } from "@prisma/client";
import { seatLabel } from "@/app/lib/seats";

/**
 * Public-record copy for membership exits. The record is symmetric with
 * seatings: when a *named* (seated) member leaves, is suspended, or is
 * reinstated, an entry says so. Departures carry the nature in the title
 * (defs.md "The record is symmetric — exits are recorded, not silent").
 */

export type DepartureReason = "resignation" | "term_not_renewed" | "removal_for_cause";

export const DEPARTURE_REASONS: DepartureReason[] = [
  "resignation",
  "term_not_renewed",
  "removal_for_cause",
];

export const DEPARTURE_REASON_LABEL: Record<DepartureReason, string> = {
  resignation: "resignation",
  term_not_renewed: "term not renewed",
  removal_for_cause: "removal for cause",
};

export function isDepartureReason(v: unknown): v is DepartureReason {
  return typeof v === "string" && (DEPARTURE_REASONS as string[]).includes(v);
}

/** Seat string for founding members; "Observer" for the observer track. */
export function membershipLabel(
  track: string | null | undefined,
  sector: Sector | null,
  region: Region | null,
): string {
  if (sector && region) return seatLabel(sector, region);
  return track === "observer" ? "Observer" : "Founding Member";
}

export function departedTitle(
  name: string,
  reason: DepartureReason,
  label: string,
): string {
  return `${name} departed — ${DEPARTURE_REASON_LABEL[reason]} (${label})`;
}

export function suspendedTitle(name: string, label: string): string {
  return `${name} suspended (${label})`;
}

export function reinstatedTitle(name: string, label: string): string {
  return `${name} reinstated (${label})`;
}

/**
 * A membership is "named" on the public record once it has been seated —
 * i.e. it reached active (or is currently suspended). pending/ended members
 * were never publicly named, so their transitions stay silent.
 */
export function wasNamed(status: string): boolean {
  return status === "active" || status === "suspended";
}
