import { db } from "~/server/db";
import { type ReaderProgressSchema, taleProgresses } from "~/server/db/schema";

/**
 * Creates the first persisted progress row for a reader and tale.
 *
 * @param taleId - The numeric database tale id.
 * @param sceneIds - Ordered reader block ids for the visible root route.
 * @param userId - The Clerk user id that owns the progress row.
 * @returns The inserted database progress row.
 *
 * @example
 * const progress = await createNewProgress(tale.id, tale.order.sceneIds, userId);
 */
export async function createNewProgress(
	taleId: number,
	sceneIds: string[],
	keyframeIds: string[],
	userId: string,
): Promise<ReaderProgressSchema> {
	const numericSceneIds = sceneIds
		.map((sceneId) => Number(sceneId))
		.filter(Number.isFinite);
	const firstSceneId = numericSceneIds[0];
	const numericKeyframeIds = keyframeIds.map(Number).filter(Number.isFinite);
	const firstKeyframeId = numericKeyframeIds[0];
	const initialProgress =
		numericSceneIds.length > 0 ? (1 / numericSceneIds.length).toFixed(4) : "0";
	const newProgressData = {
		userId,
		taleId,
		seenSceneIds: firstSceneId ? [firstSceneId] : [],
		seenKeyframeIds: firstKeyframeId ? [firstKeyframeId] : [],
		lastSceneId: firstSceneId ?? null,
		lastKeyframeId: firstKeyframeId ?? null,
		maxSceneIdReached: firstSceneId ?? null,
		activePathIds: [],
		committedAnimationIds: [],
		lastKeyframeInnerProgress: "0",
		selectedBranchIds: [],
		seenPathIds: [],
		seenEntryIds: [],
		seenPageIds: [],
		seenPartIds: [],
		seenKeyframeProgress: initialProgress,
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
