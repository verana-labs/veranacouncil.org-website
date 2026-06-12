import { db } from "@/app/lib/db";
import { RecordEntryType, Prisma } from "@prisma/client";

/**
 * The public record (/news). Entries are emitted by console actions and steward
 * acts — never written editorially. Each entry points at its underlying
 * artifact where one exists (ballot, seat, minutes commit…).
 */
export async function addRecord(
  entry: {
    type: RecordEntryType;
    title: string;
    body?: string;
    refType?: string;
    refId?: string;
    url?: string;
  },
  tx: Prisma.TransactionClient | typeof db = db,
) {
  return tx.recordEntry.create({ data: entry });
}

export async function latestRecord(limit = 3) {
  return db.recordEntry.findMany({ orderBy: { publishedAt: "desc" }, take: limit });
}
