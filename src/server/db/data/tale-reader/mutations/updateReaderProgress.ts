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
	const lastBlockId = input.blockId === null ? null : Number(input.blockId);

	const [progress] = await db
		.update(taleProgresses)
		.set({
			committedAnimationIds: input.committedAnimationIds,
			lastBlockId: Number.isFinite(lastBlockId) ? lastBlockId : null,
			lastBlockInnerProgress: input.innerProgress.toFixed(4),
			maxBlockIdReached: Number.isFinite(lastBlockId) ? lastBlockId : null,
			maxReadProgress: "0",
			seenBlockIds: toNumericIds(input.seenBlockIds),
			seenBlockProgress: "0",
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
