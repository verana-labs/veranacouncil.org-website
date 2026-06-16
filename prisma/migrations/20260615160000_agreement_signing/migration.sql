-- CreateEnum
CREATE TYPE "SignatoryStatus" AS ENUM ('pending', 'signed');

-- DropTable (replaced by AgreementSignatory; pre-launch, no real signatures)
DROP TABLE IF EXISTS "SignatureRecord";

-- CreateTable
CREATE TABLE "AgreementSignatory" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberAccessId" TEXT NOT NULL,
    "agreementVersion" TEXT NOT NULL,
    "agreementUrl" TEXT NOT NULL,
    "status" "SignatoryStatus" NOT NULL DEFAULT 'pending',
    "signerName" TEXT,
    "signerTitle" TEXT,
    "signedAt" TIMESTAMP(3),
    "ip" TEXT,
    "userAgent" TEXT,
    "agreementPdfPath" TEXT,
    "agreementHash" TEXT,
    "designatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgreementSignatory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgreementSignatory_memberId_memberAccessId_agreementVersion_key" ON "AgreementSignatory"("memberId", "memberAccessId", "agreementVersion");

-- CreateIndex
CREATE INDEX "AgreementSignatory_memberId_idx" ON "AgreementSignatory"("memberId");

-- CreateIndex
CREATE INDEX "AgreementSignatory_memberAccessId_status_idx" ON "AgreementSignatory"("memberAccessId", "status");

-- AddForeignKey
ALTER TABLE "AgreementSignatory" ADD CONSTRAINT "AgreementSignatory_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementSignatory" ADD CONSTRAINT "AgreementSignatory_memberAccessId_fkey" FOREIGN KEY ("memberAccessId") REFERENCES "MemberAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
