import { db } from "~/server/db";
import { blockEmbeds } from "../../schema";

// Constants
const BLOCKS_PER_ENTRY = 8;
const ENTRIES_COUNT = 85;

// Generate seed
export async function seedBlockEmbeds() {
  const embedSeeds = [];

  // This map will track index per taleId-sectionId combo
  const sectionIndexCounters = new Map<string, number>();

  for (let entryIndex = 0; entryIndex < ENTRIES_COUNT; entryIndex++) {
    const taleId = getTaleIdFromEntryIndex(entryIndex);
    const pageIds = getPageIdsForEntry(entryIndex);
    const entriesPerTale = taleId === 1 ? 5 : 10;
    const blocksPerTale = entriesPerTale * BLOCKS_PER_ENTRY;
    const blocksPerSection = blocksPerTale / 4;

    const entryIndexInTale =
      taleId === 1 ? entryIndex : entryIndex - 5 - (taleId - 2) * 10;

    for (let i = 0; i < BLOCKS_PER_ENTRY; i++) {
      const globalBlockIndex = entryIndex * BLOCKS_PER_ENTRY + i;
      const localBlockIndex = entryIndexInTale * BLOCKS_PER_ENTRY + i;

      const sectionInTale = Math.floor(localBlockIndex / blocksPerSection);
      const sectionId = (taleId - 1) * 4 + sectionInTale + 1;

      const counterKey = `${taleId}-${sectionId}`;
      const indexInSection = sectionIndexCounters.get(counterKey) ?? 0;
      sectionIndexCounters.set(counterKey, indexInSection + 1);

      embedSeeds.push({
        blockId: globalBlockIndex + 1,
        taleId,
        sectionId,
        isSnap: false,
        pageId: getPageIdByBlockIndex(i, pageIds),
        index: indexInSection, // ← correctly reset per section
      });
    }
  }

  await db.insert(blockEmbeds).values(embedSeeds);
  console.log(`✅ Seeded ${embedSeeds.length} blockEmbeds.`);
}

// Helpers
function getTaleIdFromEntryIndex(entryIndex: number): number {
  if (entryIndex < 5) return 1;
  return Math.floor((entryIndex - 5) / 10) + 2;
}

function getPageIdsForEntry(entryIndex: number): number[] {
  const basePageId = entryIndex * 5 + 1;
  return Array.from({ length: 5 }, (_, i) => basePageId + i);
}

function getPageIdByBlockIndex(
  blockIndex: number,
  pageIds: number[]
): number | null {
  switch (blockIndex) {
    case 1:
      return pageIds[0] ?? null;
    case 2:
      return pageIds[1] ?? null;
    case 3:
      return pageIds[2] ?? null;
    case 5:
      return pageIds[3] ?? null;
    case 6:
      return pageIds[4] ?? null;
    default:
      return null;
  }
}
