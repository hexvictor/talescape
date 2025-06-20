import { db } from "~/server/db";
import { partRanges } from "../../schema";

// Constants
const BLOCKS_PER_ENTRY = 8;
const ENTRIES_PER_PART = 5;
const BLOCKS_PER_PART = BLOCKS_PER_ENTRY * ENTRIES_PER_PART; // 40

export async function seedPartRanges() {
  const seeds = [];
  let currentBlockId = 1;
  let partId = 1;

  for (let taleId = 1; taleId <= 9; taleId++) {
    const partsInTale = taleId === 1 ? 1 : 2;

    for (let i = 0; i < partsInTale; i++) {
      const firstBlockId = currentBlockId;
      const lastBlockId = currentBlockId + BLOCKS_PER_PART - 1;

      seeds.push({
        taleId,
        partId,
        firstBlockId,
        lastBlockId,
      });

      partId++;
      currentBlockId += BLOCKS_PER_PART;
    }
  }

  await db.insert(partRanges).values(seeds);
  console.log(`✅ Seeded ${seeds.length} partRanges.`);
}
