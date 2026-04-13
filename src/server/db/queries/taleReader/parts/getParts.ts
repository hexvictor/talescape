import { db } from "~/server/db";
import type {
	PartRangeExtra,
	PartWithRange,
} from "~/features/tale-reader/types/taleStructure";
import { cache } from "react";

export async function getPartsQuery(taleId: number): Promise<PartWithRange[]> {
	const [parts, partRanges] = await Promise.all([
		db.query.parts.findMany({
			where: (p, { eq }) => eq(p.taleId, taleId),
		}),
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

export const getParts = cache(getPartsQuery);
