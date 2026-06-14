import { Sector, Region } from "@prisma/client";
import { db } from "@/app/lib/db";

/**
 * Council seats — sectors with a fixed cap and a soft regional balance (defs.md).
 * Not a sector × region grid: a candidate applies under one sector + declares a
 * region; the Membership & Seats Committee keeps a broad spread; admissions stop
 * at COUNCIL_SEAT_CAP.
 */

export const COUNCIL_SEAT_CAP = Number(process.env.COUNCIL_SEAT_CAP ?? 25);

export const SECTOR_LABELS: Record<Sector, string> = {
  financial_services: "Financial services & markets",
  workforce: "Workforce / employment",
  communications: "Communications",
  industrial_iot: "Industrial / IoT",
  energy_sustainability: "Energy / Sustainability",
  logistics_supply_chain: "Logistics / Supply-chain",
  ai_agentic: "AI / Agentic",
  idv_kyc: "IDV / KYC orchestration",
  legal: "Legal",
  crypto_validators: "Crypto network validators",
  academic_research: "Academic / research",
  standards_bodies: "Standards bodies",
  public_sector: "Public-sector / sovereign issuers",
};

export const REGION_LABELS: Record<Region, string> = {
  americas: "Americas",
  emea: "EMEA",
  apac: "APAC",
  latam: "LATAM",
  africa: "Africa",
};

export const SECTORS = Object.keys(SECTOR_LABELS) as Sector[];
export const REGIONS = Object.keys(REGION_LABELS) as Region[];

export function sectorLabel(s: Sector): string {
  return SECTOR_LABELS[s];
}
export function regionLabel(r: Region): string {
  return REGION_LABELS[r];
}

/** "Financial services & markets — EMEA", used in agreements, the record, etc. */
export function seatLabel(sector: Sector, region: Region): string {
  return `${SECTOR_LABELS[sector]} — ${REGION_LABELS[region]}`;
}

export type SeatSummary = {
  cap: number;
  seated: number;
  remaining: number;
  pending: number; // candidacies in vetting/queue/ballot (anonymous count)
  bySector: { sector: Sector; label: string; seated: number }[];
  byRegion: { region: Region; label: string; seated: number }[];
};

/**
 * The public, anonymous seat picture: how many of the cap are filled, plus the
 * spread across sectors and regions. Never names organizations (that is gated
 * by the admin `listed` flag on the directory).
 */
export async function loadSeatSummary(): Promise<SeatSummary> {
  const seatedMemberships = await db.membership.findMany({
    where: { track: "founding_member", status: "active" },
    select: { sector: true, region: true },
  });
  const pending = await db.candidacy.count({
    where: { status: { in: ["signed", "queued", "ballot_open"] } },
  });

  const seated = seatedMemberships.length;
  const sectorCount = new Map<Sector, number>();
  const regionCount = new Map<Region, number>();
  for (const m of seatedMemberships) {
    if (m.sector) sectorCount.set(m.sector, (sectorCount.get(m.sector) ?? 0) + 1);
    if (m.region) regionCount.set(m.region, (regionCount.get(m.region) ?? 0) + 1);
  }

  return {
    cap: COUNCIL_SEAT_CAP,
    seated,
    remaining: Math.max(0, COUNCIL_SEAT_CAP - seated),
    pending,
    bySector: SECTORS.map((sector) => ({
      sector,
      label: SECTOR_LABELS[sector],
      seated: sectorCount.get(sector) ?? 0,
    })),
    byRegion: REGIONS.map((region) => ({
      region,
      label: REGION_LABELS[region],
      seated: regionCount.get(region) ?? 0,
    })),
  };
}
