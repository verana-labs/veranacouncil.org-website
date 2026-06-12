import { AgreementContext } from "@/app/lib/agreement-template";
import { countryName } from "@/app/lib/countries";
import { SECTOR_LABELS, REGION_LABELS } from "@/app/lib/seats";
import type { Sector, Region } from "@prisma/client";

/**
 * Raw candidacy-form fields, as captured by the /apply wizard. Used to build a
 * single AgreementContext so the on-screen preview and the finally-signed PDF
 * are rendered from identical data.
 */
export type ApplyInput = {
  legalName?: string;
  entityType?: string | null;
  jurisdiction?: string | null; // country code
  registeredAddress?: string | null;
  signerName?: string;
  signerTitle?: string | null;
  email?: string | null;
  sector: Sector;
  region: Region;
  effectiveDate: Date;
};

function display(code?: string | null): string | null {
  if (!code) return null;
  return countryName(code) ?? code;
}

export function toAgreementContext(i: ApplyInput): AgreementContext {
  const jurisdiction = display(i.jurisdiction);
  return {
    memberLegalName: i.legalName ?? "",
    entityForm: i.entityType ?? null,
    jurisdiction,
    // Always show an address clause; fall back to the country when no
    // registered address was given.
    memberAddress: i.registeredAddress?.trim() || jurisdiction,
    signerName: i.signerName ?? "",
    signerTitle: i.signerTitle ?? null,
    memberEmail: i.email ?? null,
    seatSector: SECTOR_LABELS[i.sector],
    seatRegion: REGION_LABELS[i.region],
    effectiveDate: i.effectiveDate,
  };
}
