import type { SavedReaderProgress } from "~/server/db/data/tale-reader/types/tales";
import type { ReaderProgressSchema } from "~/server/db/schema";

/**
 * Converts database progress rows into the string-id progress shape used by the reader.
 *
 * @param progress - The persisted database progress row.
 * @returns Reader progress ready to hydrate the client store.
 *
 * @example
 * const readerProgress = formatReaderProgress(progressRow);
 */
export function formatReaderProgress(
	progress: ReaderProgressSchema,
): SavedReaderProgress {
	return {
		blockId:
			progress.lastBlockId === null ? null : String(progress.lastBlockId),
		committedAnimationIds: progress.committedAnimationIds,
		id: progress.id,
		innerProgress: Number(progress.lastBlockInnerProgress),
		seenBlockIds: progress.seenBlockIds.map(String),
		seenEntryIds: progress.seenEntryIds.map(String),
		seenPageIds: progress.seenPageIds.map(String),
		seenPartIds: progress.seenPartIds.map(String),
		selectedBranchIds: progress.selectedBranchIds.map(String),
		taleId: progress.taleId,
		updatedAt: progress.updatedAt.toISOString(),
	};
}
