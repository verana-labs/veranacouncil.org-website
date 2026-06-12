import { Sector, Region } from "@prisma/client";
import { db } from "@/app/lib/db";

/**
 * The seat matrix (sector × region) — the Council's signature element.
 * A SeatCell row exists only where a seat is open or seated; absent cells are
 * "n/a". `candidate pending` is derived from queued/balloting candidacies.
 * Source of truth for the initial grid: defs.md (verana-strategy/2026).
 */

export const SECTOR_LABELS: Record<Sector, string> = {
  financial_services: "Financial services",
  workforce: "Workforce / employment",
  communications: "Communications",
  industrial_iot: "Industrial / IoT",
  energy_sustainability: "Energy / Sustainability",
  logistics_supply_chain: "Logistics / Supply-chain",
  ai_agentic_identity: "AI / Agentic (Identity)",
  ai_agentic_commerce: "AI / Agentic (Commerce)",
  idv_kyc: "IDV / KYC orchestration",
  markets_commodities: "Markets / commodities",
  legal: "Legal",
  crypto_validators: "Crypto Network Validators",
  academic_research: "Academic / research",
  standards_liaison: "Standards-body liaison",
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

export type CellState = "open" | "pending" | "seated";

export type MatrixCell = {
  id: string;
  sector: Sector;
  region: Region;
  state: CellState;
  seatedMemberName: string | null;
  pendingCount: number;
};

/** All cells with their derived public state. */
export async function loadMatrix(): Promise<MatrixCell[]> {
  const cells = await db.seatCell.findMany({
    include: {
      seatedMember: { select: { legalName: true, membership: { select: { listed: true } } } },
      candidacies: {
        where: { status: { in: ["queued", "ballot_open"] } },
        select: { id: true },
      },
    },
  });
  return cells.map((c) => ({
    id: c.id,
    sector: c.sector,
    region: c.region,
    state: c.seatedMemberId ? "seated" : c.candidacies.length > 0 ? "pending" : "open",
    // Name shown only once seated and admin-listed (logo/name consent flow).
    seatedMemberName:
      c.seatedMemberId && c.seatedMember?.membership?.listed
        ? c.seatedMember.legalName
        : null,
    pendingCount: c.candidacies.length,
  }));
}

export function seatLabel(sector: Sector, region: Region): string {
  return `${SECTOR_LABELS[sector]} — ${REGION_LABELS[region]}`;
}
