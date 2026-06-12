// One-time bootstrap: seed the Council admin allowlist from
// ADMIN_BOOTSTRAP_EMAILS (comma-separated). Idempotent (upsert), but intended
// to be run manually once — NOT on every deploy, so removing an admin in
// /admin/admins isn't undone. Run: `npm run db:seed`.
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Run directly via `node`, so load local env ourselves (the Prisma CLI loads it
// via prisma.config.ts, but `node prisma/seed.mjs` doesn't). In the cluster,
// env comes from the Job and these files are absent (no-op).
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file absent — ignore
  }
}

const db = new PrismaClient();

const emails = (process.env.ADMIN_BOOTSTRAP_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

for (const email of emails) {
  await db.adminAllowlistEntry.upsert({
    where: { email },
    update: {},
    create: { email },
  });
}

console.log(`Seeded ${emails.length} admin allowlist entr${emails.length === 1 ? "y" : "ies"}.`);

// Activate a Candidate Agreement version file from legal/ (admins can switch
// versions in /admin/settings). Pins the file's sha384 on first activation;
// never re-pins a changed file (that would defeat the integrity guarantee).
const agreementFile = process.env.AGREEMENT_FILENAME ?? "candidate-agreement-v1.md";
try {
  const content = readFileSync(path.join(process.cwd(), "legal", agreementFile), "utf8");
  const hash = "sha384-" + crypto.createHash("sha384").update(content, "utf8").digest("base64");
  const version = agreementFile.replace(/\.md$/i, "").match(/v\d+[a-z0-9.]*/i)?.[0] ?? agreementFile;
  const existing = await db.agreementDocument.findUnique({ where: { filename: agreementFile } });
  if (existing && existing.hash !== hash) {
    console.warn(`Skipped activating ${agreementFile}: file changed since it was pinned.`);
  } else {
    await db.agreementDocument.updateMany({ where: { active: true }, data: { active: false } });
    await db.agreementDocument.upsert({
      where: { filename: agreementFile },
      update: { active: true },
      create: { filename: agreementFile, version, hash, active: true },
    });
    console.log(`Activated Candidate Agreement ${version} (${agreementFile}).`);
  }
} catch (e) {
  console.warn(`Could not seed Candidate Agreement from ${agreementFile}:`, e.message);
}


// Seed the seat matrix (sector × region) from defs.md. A row exists only for
// cells that are open; "n/a" cells have no row. Idempotent (upsert) — never
// deletes cells (closing/opening a cell is a Council decision, done in admin).
const MATRIX = {
  financial_services: ["americas"],
  workforce: ["americas", "emea", "apac"],
  communications: ["americas"],
  industrial_iot: ["emea", "apac"],
  energy_sustainability: ["americas", "emea"],
  logistics_supply_chain: ["americas", "emea", "apac", "latam"],
  ai_agentic_identity: ["americas"],
  ai_agentic_commerce: ["americas"],
  idv_kyc: ["americas", "emea", "apac", "latam"],
  markets_commodities: ["americas"],
  legal: ["americas", "emea"],
  crypto_validators: ["americas", "emea"],
  academic_research: ["americas", "emea", "apac", "latam", "africa"],
  standards_liaison: ["americas", "emea"],
  public_sector: ["americas", "emea", "apac", "latam", "africa"],
};

let cells = 0;
for (const [sector, regions] of Object.entries(MATRIX)) {
  for (const region of regions) {
    await db.seatCell.upsert({
      where: { sector_region: { sector, region } },
      update: {},
      create: { sector, region },
    });
    cells += 1;
  }
}
console.log(`Seeded ${cells} seat-matrix cells.`);

await db.$disconnect();
