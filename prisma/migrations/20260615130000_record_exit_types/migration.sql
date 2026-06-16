-- AlterEnum
-- Departure / suspension / reinstatement events, so the public record closes
-- out seated members symmetrically with seatings (PG 12+: ADD VALUE is allowed
-- in a transaction as long as the new value isn't used in the same one).
ALTER TYPE "RecordEntryType" ADD VALUE IF NOT EXISTS 'member_departed';
ALTER TYPE "RecordEntryType" ADD VALUE IF NOT EXISTS 'member_suspended';
ALTER TYPE "RecordEntryType" ADD VALUE IF NOT EXISTS 'member_reinstated';
