import { db } from "~/server/db";
import { type ReaderProgressSchema, taleProgresses } from "~/server/db/schema";

/**
 * Creates the first persisted progress row for a reader and tale.
 *
 * @param taleId - The numeric database tale id.
 * @param blockIds - Ordered reader block ids for the visible root route.
 * @param userId - The Clerk user id that owns the progress row.
 * @returns The inserted database progress row.
 *
 * @example
 * const progress = await createNewProgress(tale.id, tale.order.blockIds, userId);
 */
export async function createNewProgress(
	taleId: number,
	blockIds: string[],
	userId: string,
): Promise<ReaderProgressSchema> {
	const numericBlockIds = blockIds
		.map((blockId) => Number(blockId))
		.filter(Number.isFinite);
	const firstBlockId = numericBlockIds[0];
	const initialProgress =
		numericBlockIds.length > 0 ? (1 / numericBlockIds.length).toFixed(4) : "0";
	const newProgressData = {
		userId,
		taleId,
		seenBlockIds: firstBlockId ? [firstBlockId] : [],
		lastBlockId: firstBlockId ?? null,
		maxBlockIdReached: firstBlockId ?? null,
		activePathIds: [],
		committedFragmentIds: [],
		lastBlockInnerProgress: "0",
		selectedBranchIds: [],
		seenPathIds: [],
		seenEntryIds: [],
		seenPageIds: [],
		seenPartIds: [],
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
