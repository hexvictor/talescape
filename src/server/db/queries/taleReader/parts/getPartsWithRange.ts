import { db } from "~/server/db";
import type {
  PartRangeExtra,
  PartWithRange,
} from "~/types/tale-reader/taleStructure";
import { getParts } from "./getParts";

export async function getPartsWithRanges(
  taleId: number
): Promise<PartWithRange[]> {
  const [parts, partRanges] = await Promise.all([
    getParts(taleId),
    db.query.partRanges.findMany({
      where: (r, { eq }) => eq(r.taleId, taleId),
    }),
  ]);

  const rangeMap = new Map<string, PartRangeExtra>();
  for (const range of partRanges) {
    rangeMap.set(String(range.partId), {
      firstBlockId: range.firstBlockId,
      lastBlockId: range.lastBlockId,
    });
  }

  return parts.map((part) => {
    const range = rangeMap.get(String(part.id));
    if (!range) return { ...part, firstBlockId: null, lastBlockId: null };
    return {
      ...part,
      ...range,
    };
  });
}
