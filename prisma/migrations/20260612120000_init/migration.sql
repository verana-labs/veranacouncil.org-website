-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WorkingGroupState" AS ENUM ('enabled', 'disabled');

-- CreateEnum
CREATE TYPE "WgSessionStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('organization');

-- CreateEnum
CREATE TYPE "MembershipTrack" AS ENUM ('founding_member', 'observer');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('pending', 'active', 'suspended', 'ended');

-- CreateEnum
CREATE TYPE "AdmissionKind" AS ENUM ('seed', 'ballot', 'board');

-- CreateEnum
CREATE TYPE "ValidatorStatus" AS ENUM ('none', 'in_progress', 'online');

-- CreateEnum
CREATE TYPE "CandidacyStatus" AS ENUM ('applied', 'signed', 'queued', 'ballot_open', 'accepted', 'refused', 'lapsed', 'withdrawn');

-- CreateEnum
CREATE TYPE "BallotStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "BallotOutcome" AS ENUM ('accepted', 'refused');

-- CreateEnum
CREATE TYPE "VoteChoice" AS ENUM ('accept', 'refuse');

-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('financial_services', 'workforce', 'communications', 'industrial_iot', 'energy_sustainability', 'logistics_supply_chain', 'ai_agentic_identity', 'ai_agentic_commerce', 'idv_kyc', 'markets_commodities', 'legal', 'crypto_validators', 'academic_research', 'standards_liaison', 'public_sector');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('americas', 'emea', 'apac', 'latam', 'africa');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('manager', 'representative');

-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('invited', 'active', 'removed');

-- CreateEnum
CREATE TYPE "RequiredClass" AS ENUM ('any', 'associate');

-- CreateEnum
CREATE TYPE "RecordEntryType" AS ENUM ('candidacy_opened', 'ballot_opened', 'ballot_result', 'member_seated', 'observer_accepted', 'seed_designation', 'minutes_published', 'framework', 'milestone');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('in_app', 'email');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "displayName" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "AdminAllowlistEntry" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "addedByUserId" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAllowlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "type" "MemberType" NOT NULL DEFAULT 'organization',
    "legalName" TEXT NOT NULL,
    "entityType" TEXT,
    "jurisdiction" TEXT,
    "registeredAddress" TEXT,
    "noticeEmail" TEXT,
    "logoUri" TEXT,
    "socialAnnouncementConsent" BOOLEAN NOT NULL DEFAULT false,
    "logoDisplayConsent" BOOLEAN NOT NULL DEFAULT false,
    "primaryEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "track" "MembershipTrack" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'pending',
    "listed" BOOLEAN NOT NULL DEFAULT false,
    "admission" "AdmissionKind",
    "seatedAt" TIMESTAMP(3),
    "ratifiedAt" TIMESTAMP(3),
    "testnetValidator" "ValidatorStatus" NOT NULL DEFAULT 'none',
    "termStart" TIMESTAMP(3),
    "termEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberAccess" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL,
    "status" "AccessStatus" NOT NULL DEFAULT 'invited',
    "votingRep" BOOLEAN NOT NULL DEFAULT false,
    "addedByUserId" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatCell" (
    "id" TEXT NOT NULL,
    "sector" "Sector" NOT NULL,
    "region" "Region" NOT NULL,
    "seatedMemberId" TEXT,
    "seatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatCell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidacy" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "status" "CandidacyStatus" NOT NULL DEFAULT 'applied',
    "signatureId" TEXT,
    "vettedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ballot" (
    "id" TEXT NOT NULL,
    "candidacyId" TEXT NOT NULL,
    "opensAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "status" "BallotStatus" NOT NULL DEFAULT 'open',
    "outcome" "BallotOutcome",
    "closedAt" TIMESTAMP(3),
    "electorate" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ballot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BallotVote" (
    "id" TEXT NOT NULL,
    "ballotId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "choice" "VoteChoice" NOT NULL,
    "castAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BallotVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordEntry" (
    "id" TEXT NOT NULL,
    "type" "RecordEntryType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "refType" TEXT,
    "refId" TEXT,
    "url" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecordEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcsInterest" (
    "id" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "intendedRole" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "message" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EcsInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementDocument" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "hashAlgo" TEXT NOT NULL DEFAULT 'sha384',
    "active" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgreementDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignatureRecord" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerTitle" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "agreementVersion" TEXT NOT NULL,
    "agreementUrl" TEXT NOT NULL,
    "agreementHash" TEXT,
    "agreementPdfPath" TEXT,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "SignatureRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingGroup" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "requiredClass" "RequiredClass" NOT NULL DEFAULT 'any',
    "link" TEXT NOT NULL,
    "showOnHome" BOOLEAN NOT NULL DEFAULT false,
    "state" "WorkingGroupState" NOT NULL DEFAULT 'enabled',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WgLead" (
    "id" TEXT NOT NULL,
    "wgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WgLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WgParticipant" (
    "id" TEXT NOT NULL,
    "wgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "WgParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WgSchedule" (
    "id" TEXT NOT NULL,
    "wgId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "rrule" TEXT NOT NULL,
    "googleEventId" TEXT,
    "meetLink" TEXT,
    "syncedAt" TIMESTAMP(3),
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WgSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WgScheduleException" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "originalStart" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WgScheduleException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WgSession" (
    "id" TEXT NOT NULL,
    "wgId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "status" "WgSessionStatus" NOT NULL DEFAULT 'draft',
    "notesMd" TEXT NOT NULL DEFAULT '',
    "recordedById" TEXT NOT NULL,
    "notesPath" TEXT,
    "notesCommitSha" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WgSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WgSessionAttendee" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "WgSessionAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAction" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'in_app',
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAllowlistEntry_email_key" ON "AdminAllowlistEntry"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_memberId_key" ON "Membership"("memberId");

-- CreateIndex
CREATE INDEX "Membership_status_idx" ON "Membership"("status");

-- CreateIndex
CREATE INDEX "UserMember_memberId_idx" ON "UserMember"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMember_userId_memberId_key" ON "UserMember"("userId", "memberId");

-- CreateIndex
CREATE INDEX "MemberAccess_email_idx" ON "MemberAccess"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MemberAccess_memberId_email_key" ON "MemberAccess"("memberId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "SeatCell_seatedMemberId_key" ON "SeatCell"("seatedMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatCell_sector_region_key" ON "SeatCell"("sector", "region");

-- CreateIndex
CREATE INDEX "Candidacy_seatId_status_idx" ON "Candidacy"("seatId", "status");

-- CreateIndex
CREATE INDEX "Candidacy_memberId_idx" ON "Candidacy"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Ballot_candidacyId_key" ON "Ballot"("candidacyId");

-- CreateIndex
CREATE INDEX "Ballot_status_idx" ON "Ballot"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BallotVote_ballotId_memberId_key" ON "BallotVote"("ballotId", "memberId");

-- CreateIndex
CREATE INDEX "RecordEntry_publishedAt_idx" ON "RecordEntry"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgreementDocument_filename_key" ON "AgreementDocument"("filename");

-- CreateIndex
CREATE INDEX "SignatureRecord_memberId_idx" ON "SignatureRecord"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingGroup_slug_key" ON "WorkingGroup"("slug");

-- CreateIndex
CREATE INDEX "WgLead_userId_idx" ON "WgLead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WgLead_wgId_userId_key" ON "WgLead"("wgId", "userId");

-- CreateIndex
CREATE INDEX "WgParticipant_userId_idx" ON "WgParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WgParticipant_wgId_userId_key" ON "WgParticipant"("wgId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WgSchedule_wgId_key" ON "WgSchedule"("wgId");

-- CreateIndex
CREATE UNIQUE INDEX "WgScheduleException_scheduleId_originalStart_key" ON "WgScheduleException"("scheduleId", "originalStart");

-- CreateIndex
CREATE INDEX "WgSession_wgId_status_idx" ON "WgSession"("wgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WgSession_wgId_occurredAt_key" ON "WgSession"("wgId", "occurredAt");

-- CreateIndex
CREATE INDEX "WgSessionAttendee_sessionId_idx" ON "WgSessionAttendee"("sessionId");

-- CreateIndex
CREATE INDEX "AdminAction_actorUserId_idx" ON "AdminAction"("actorUserId");

-- CreateIndex
CREATE INDEX "AdminAction_targetType_targetId_idx" ON "AdminAction"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMember" ADD CONSTRAINT "UserMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMember" ADD CONSTRAINT "UserMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAccess" ADD CONSTRAINT "MemberAccess_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatCell" ADD CONSTRAINT "SeatCell_seatedMemberId_fkey" FOREIGN KEY ("seatedMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidacy" ADD CONSTRAINT "Candidacy_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidacy" ADD CONSTRAINT "Candidacy_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "SeatCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_candidacyId_fkey" FOREIGN KEY ("candidacyId") REFERENCES "Candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallotVote" ADD CONSTRAINT "BallotVote_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "Ballot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallotVote" ADD CONSTRAINT "BallotVote_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallotVote" ADD CONSTRAINT "BallotVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureRecord" ADD CONSTRAINT "SignatureRecord_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WgLead" ADD CONSTRAINT "WgLead_wgId_fkey" FOREIGN KEY ("wgId") REFERENCES "WorkingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WgLead" ADD CONSTRAINT "WgLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WgParticipant" ADD CONSTRAINT "WgParticipant_wgId_fkey" FOREIGN KEY ("wgId") REFERENCES "WorkingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WgParticipant" ADD CONSTRAINT "WgParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WgSchedule" ADD CONSTRAINT "WgSchedule_wgId_fkey" FOREIGN KEY ("wgId") REFERENCES "WorkingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WgScheduleException" ADD CONSTRAINT "WgScheduleException_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "WgSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WgSession" ADD CONSTRAINT "WgSession_wgId_fkey" FOREIGN KEY ("wgId") REFERENCES "WorkingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WgSession" ADD CONSTRAINT "WgSession_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WgSessionAttendee" ADD CONSTRAINT "WgSessionAttendee_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WgSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

