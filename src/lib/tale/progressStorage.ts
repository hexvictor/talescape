import type { TaleProgressSchema } from "~/server/db/schema";
import type { Tale } from "~/types/tale-reader/taleStructure";

export function getInitialProgressFromLocalStorage(
  tale: Tale
): TaleProgressSchema {
  const key = `tale_progress_${tale.id}`;
  const raw = localStorage.getItem(key);

  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed) return parsed;
  } catch {
    // ignore invalid JSON
  }

  const {
    id: taleId,
    structure: { blockIds },
  } = tale;

  const firstBlockId = blockIds[0] ?? null;

  const generatedProgress: TaleProgressSchema = {
    id: -1,
    userId: "localStorage",
    taleId,
    updatedAt: new Date(),
    seenBlockIds: firstBlockId ? [firstBlockId] : [],
    lastBlockId: firstBlockId,
    maxBlockIdReached: firstBlockId,
    seenBlockProgress: (1 / blockIds.length).toFixed(4),
    linearReadProgress: (1 / blockIds.length).toFixed(4),
  };

  localStorage.setItem(key, JSON.stringify(generatedProgress));
  return generatedProgress;
}
