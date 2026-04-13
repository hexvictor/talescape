import { db } from "~/server/db";
import { entryRanges } from "../../schema";

// Constants
const BLOCKS_PER_ENTRY = 8;
const ENTRIES_COUNT = 85; // 9 tales, 17 parts, 5 entries each (1 part has 5 entries, rest 10x5)

export async function seedEntryRanges() {
	const ranges = Array.from({ length: ENTRIES_COUNT }).map((_, entryIndex) => {
		const taleId = getTaleIdFromEntryIndex(entryIndex);
		const entryId = entryIndex + 1;
		const firstBlockId = entryIndex * BLOCKS_PER_ENTRY + 1;
		const lastBlockId = firstBlockId + BLOCKS_PER_ENTRY - 1;

		return {
			taleId,
			entryId,
			firstBlockId,
			lastBlockId,
		};
	});

	await db.insert(entryRanges).values(ranges);
	console.log(`✅ Seeded ${ranges.length} entryRanges.`);
}

// Helper to find taleId from entryIndex
function getTaleIdFromEntryIndex(entryIndex: number): number {
	if (entryIndex < 5) return 1; // tale 1 has 1 part, 5 entries
	return Math.floor((entryIndex - 5) / 10) + 2; // each other tale has 10 entries (2 parts)
}
