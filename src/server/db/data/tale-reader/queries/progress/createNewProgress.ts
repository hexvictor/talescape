import { db } from "~/server/db";
import { type ReaderProgressSchema, taleProgresses } from "~/server/db/schema";

export async function createNewProgress(
	taleId: number,
	blockIds: number[],
	userId: string,
): Promise<ReaderProgressSchema> {
	const firstBlockId = blockIds[0];
	const initialProgress =
		blockIds.length > 0 ? (1 / blockIds.length).toFixed(4) : "0";
	const newProgressData = {
		userId,
		taleId,
		seenBlockIds: firstBlockId ? [firstBlockId] : [],
		lastBlockId: firstBlockId ?? null,
		maxBlockIdReached: firstBlockId ?? null,
		activePathIds: [],
		seenPathIds: [],
		seenBlockProgress: initialProgress,
		maxReadProgress: initialProgress,
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
