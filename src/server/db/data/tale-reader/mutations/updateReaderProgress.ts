import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { taleProgresses } from "~/server/db/schema";
import type { SavedReaderProgress } from "../types/tales";

export type UpdateReaderProgressInput = Required<
	Pick<SavedReaderProgress, "id" | "taleId">
> &
	SavedReaderProgress;

/**
 * Converts reader string ids into database numeric ids.
 *
 * @param ids - The reader ids to convert.
 * @returns Numeric ids that can be persisted to Postgres integer arrays.
 *
 * @example
 * const ids = toNumericIds(["1", "2"]);
 */
function toNumericIds(ids: string[]): number[] {
	return ids.map((id) => Number(id)).filter(Number.isFinite);
}

/**
 * Updates persisted reader progress for the signed-in user.
 *
 * @param userId - The Clerk user id that owns the progress row.
 * @param input - The reader progress payload from the client store.
 * @returns The updated database progress row.
 *
 * @example
 * await updateReaderProgress(userId, progress);
 */
export async function updateReaderProgress(
	userId: string,
	input: UpdateReaderProgressInput,
) {
	const lastSceneId = input.sceneId === null ? null : Number(input.sceneId);
	const lastKeyframeId = input.keyframeId === null ? null : Number(input.keyframeId);

	const [progress] = await db
		.update(taleProgresses)
		.set({
			committedAnimationIds: input.committedAnimationIds,
			lastSceneId: Number.isFinite(lastSceneId) ? lastSceneId : null,
			lastKeyframeId: Number.isFinite(lastKeyframeId) ? lastKeyframeId : null,
			lastKeyframeInnerProgress: input.innerProgress.toFixed(4),
			maxSceneIdReached: Number.isFinite(lastSceneId) ? lastSceneId : null,
			maxReadProgress: "0",
			seenSceneIds: toNumericIds(input.seenSceneIds),
			seenKeyframeIds: toNumericIds(input.seenKeyframeIds),
			seenKeyframeProgress: "0",
			seenEntryIds: toNumericIds(input.seenEntryIds),
			seenPageIds: toNumericIds(input.seenPageIds),
			seenPartIds: toNumericIds(input.seenPartIds),
			selectedBranchIds: toNumericIds(input.selectedBranchIds),
			updatedAt: new Date(input.updatedAt),
		})
		.where(
			and(
				eq(taleProgresses.id, input.id),
				eq(taleProgresses.taleId, input.taleId),
				eq(taleProgresses.userId, userId),
			),
		)
		.returning();

	if (!progress) {
		throw new Error("Failed to update tale progress");
	}

	return progress;
}
