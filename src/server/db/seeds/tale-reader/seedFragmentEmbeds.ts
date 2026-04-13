import { db } from "~/server/db";
import { fragmentEmbeds } from "../../schema";

// Constants
const ENTRIES_COUNT = 85;
const BLOCKS_PER_ENTRY = 8;
const TOTAL_BLOCKS = ENTRIES_COUNT * BLOCKS_PER_ENTRY; // 680
const FRAGMENTS_PER_BLOCK = 2; // text and image

export async function seedFragmentEmbeds() {
	const embedSeeds = [];

	for (let blockIndex = 0; blockIndex < TOTAL_BLOCKS; blockIndex++) {
		const taleId = getTaleIdFromBlockIndex(blockIndex);
		const fragmentIdStart = blockIndex * FRAGMENTS_PER_BLOCK + 1;

		for (let i = 0; i < FRAGMENTS_PER_BLOCK; i++) {
			embedSeeds.push({
				fragmentId: fragmentIdStart + i,
				taleId,
				blockId: blockIndex + 1,
				index: i,
			});
		}
	}

	await db.insert(fragmentEmbeds).values(embedSeeds);
	console.log(`✅ Seeded ${embedSeeds.length} fragmentEmbeds.`);
}

// Helper to map block index back to taleId
function getTaleIdFromBlockIndex(blockIndex: number): number {
	if (blockIndex < 40) return 1; // Tale 1 has 5 entries * 8 = 40 blocks
	return Math.floor((blockIndex - 40) / 80) + 2; // Each tale after has 10 entries * 8 = 80 blocks
}
