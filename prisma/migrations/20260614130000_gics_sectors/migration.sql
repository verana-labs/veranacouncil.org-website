-- AlterEnum
BEGIN;
CREATE TYPE "Sector_new" AS ENUM ('energy', 'materials', 'industrials', 'consumer_discretionary', 'consumer_staples', 'health_care', 'financials', 'information_technology', 'communication_services', 'utilities', 'real_estate', 'education', 'nonprofit', 'public_sector', 'standards_bodies');
ALTER TABLE "Membership" ALTER COLUMN "sector" TYPE "Sector_new" USING ("sector"::text::"Sector_new");
ALTER TABLE "Candidacy" ALTER COLUMN "sector" TYPE "Sector_new" USING ("sector"::text::"Sector_new");
ALTER TYPE "Sector" RENAME TO "Sector_old";
ALTER TYPE "Sector_new" RENAME TO "Sector";
DROP TYPE "Sector_old";
COMMIT;

