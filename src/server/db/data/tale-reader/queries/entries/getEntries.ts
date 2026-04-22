import { cache } from "react";
import { db } from "~/server/db";
import type { EntryRange, EntryWithRange } from "../../types/entries";

export async function getEntriesQuery(
	taleId: number,
): Promise<EntryWithRange[]> {
	const [entries, entryRanges] = await Promise.all([
		db.query.entries.findMany({
			where: (e, { eq }) => eq(e.taleId, taleId),
		}),
		db.query.entryRanges.findMany({
			where: (r, { eq }) => eq(r.taleId, taleId),
		}),
	]);

	const rangeMap = new Map<string, EntryRange>();
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

export const getEntries = cache(getEntriesQuery);
