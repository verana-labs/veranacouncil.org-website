import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { resolveTemplate, AgreementContext } from "./agreement-template";
import { markdownToPdf, renderAgreementPdf } from "./agreement-pdf";

const TEMPLATE = readFileSync(
  path.join(process.cwd(), "legal", "candidate-agreement-v1.md"),
  "utf8",
);

const TPL = [
  "Party: **{{member_legal_name}}**, a {{entity_form}} under {{jurisdiction}}<!--IF:has_member_address-->, at **{{member_address}}**<!--ENDIF-->.",
  "Seat: {{seat_label}} ({{seat_sector}} / {{seat_region}})",
  "Name: {{signer_name}}",
  "<!--IF:is_founding_member-->Title: {{signer_title}}\n<!--ENDIF-->Email: {{member_email}}\nDate: {{effective_date}}",
].join("\n");

const candidate: AgreementContext = {
  memberLegalName: "Acme OÜ",
  entityForm: "private limited company",
  jurisdiction: "Estonia",
  memberAddress: "Tallinn",
  signerName: "Jane Doe",
  signerTitle: "CEO",
  memberEmail: "jane@acme.example",
  seatSector: "Legal",
  seatRegion: "EMEA",
  effectiveDate: new Date("2026-06-09T10:00:00Z"),
};

const noAddress: AgreementContext = {
  ...candidate,
  memberAddress: null,
};

describe("resolveTemplate", () => {
  it("renders the candidate case", () => {
    const out = resolveTemplate(TPL, candidate);
    expect(out).toContain("a private limited company under Estonia, at **Tallinn**");
    expect(out).toContain("Seat: Legal — EMEA (Legal / EMEA)");
    expect(out).toContain("Title: CEO");
    expect(out).toContain("Email: jane@acme.example");
    expect(out).toContain("Date: 9 June 2026");
  });

  it("drops the address clause when no address is present", () => {
    const out = resolveTemplate(TPL, noAddress);
    expect(out).toContain("a private limited company under Estonia.");
    expect(out).not.toContain("at **");
  });

  it("throws on an unknown placeholder", () => {
    expect(() => resolveTemplate("{{nope}}", candidate)).toThrow(/unknown placeholder/);
  });

  it("leaves no template tokens behind for any case", () => {
    for (const ctx of [candidate, noAddress]) {
      const out = resolveTemplate(TPL, ctx);
      expect(out).not.toMatch(/\{\{|<!--(?:IF:|ELSE|ENDIF)/);
    }
  });
});

describe("real template + PDF", () => {
  it("personalises the on-disk template with no leftover tokens", () => {
    const md = resolveTemplate(TEMPLATE, candidate);
    expect(md).not.toMatch(/\{\{|<!--(?:IF:|ELSE|ENDIF)/);
    expect(md).toContain("Acme OÜ");
    expect(md).toContain("Legal — EMEA");
    // The placeholder draft must announce itself as such.
    expect(md).toContain("DRAFT — PLACEHOLDER, NOT FOR EXECUTION");
  });

  it("renders a valid PDF", async () => {
    const buf = await markdownToPdf(resolveTemplate(TEMPLATE, candidate));
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(buf.length).toBeGreaterThan(2000);
  });

  it("renderAgreementPdf works end-to-end", async () => {
    const buf = await renderAgreementPdf(noAddress, TEMPLATE);
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
