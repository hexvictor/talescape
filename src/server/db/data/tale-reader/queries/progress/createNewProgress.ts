import { db } from "~/server/db";
import { type TaleProgressSchema, taleProgresses } from "~/server/db/schema";

export async function createNewProgress(
	taleId: number,
	blockIds: number[],
	userId: string,
): Promise<TaleProgressSchema> {
	const firstBlockId = blockIds[0];
	const newProgressData = {
		userId,
		taleId,
		seenBlockIds: firstBlockId ? [firstBlockId] : [],
		lastBlockId: firstBlockId ?? null,
		maxBlockIdReached: firstBlockId ?? null,
		seenBlockProgress: (1 / blockIds.length).toFixed(4),
		maxReadProgress: (1 / blockIds.length).toFixed(4),
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
