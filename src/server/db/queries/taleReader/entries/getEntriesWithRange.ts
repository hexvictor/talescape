import { db } from "~/server/db";
import type {
  EntryRangeExtra,
  EntryWithRange,
} from "~/types/tale-reader/taleStructure";
import { getEntries } from "../entries";

export async function getEntriesWithRanges(
  taleId: number
): Promise<EntryWithRange[]> {
  const [entries, entryRanges] = await Promise.all([
    getEntries(taleId),
    db.query.entryRanges.findMany({
      where: (r, { eq }) => eq(r.taleId, taleId),
    }),
  ]);

  const rangeMap = new Map<string, EntryRangeExtra>();
  for (const range of entryRanges) {
    rangeMap.set(String(range.entryId), {
      firstBlockId: range.firstBlockId,
      lastBlockId: range.lastBlockId,
    });
  }

  return entries.map((entry) => {
    const range = rangeMap.get(String(entry.id));
    if (!range) return { ...entry, firstBlockId: null, lastBlockId: null };
    return {
      ...entry,
      ...range,
    };
  });
}
