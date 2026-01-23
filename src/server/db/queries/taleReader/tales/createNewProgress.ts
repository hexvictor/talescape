import { db } from "~/server/db";
import { taleProgresses, type TaleProgressSchema } from "~/server/db/schema";
import type { FormattedTale } from "~/features/tale-reader/types/taleStructure";

export async function createNewProgress(
  formattedTale: FormattedTale,
  userId: string
): Promise<TaleProgressSchema> {
  const {
    id: taleId,
    structure: { blockIds },
  } = formattedTale;

  const firstBlockId = blockIds[0];
  const newProgressData = {
    userId,
    taleId,
    seenBlockIds: firstBlockId ? [firstBlockId] : [],
    lastBlockId: firstBlockId ?? null,
    maxBlockIdReached: firstBlockId ?? null,
    seenBlockProgress: (1 / blockIds.length).toFixed(4),
    linearReadProgress: (1 / blockIds.length).toFixed(4),
  };

  const [insertedProgress] = await db
    .insert(taleProgresses)
    .values(newProgressData)
    .returning();

  if (!insertedProgress) {
    throw new Error("Failed to create tale progress");
  }

  return insertedProgress;
}
