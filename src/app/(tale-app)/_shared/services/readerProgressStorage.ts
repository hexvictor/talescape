import type { SavedReaderProgress, Tale } from "../types";

function progressStorageKey(taleId: number | string) {
	return `tale_reader_progress_${taleId}`;
}

/**
 * Creates a fresh empty progress value with a current timestamp.
 *
 * @returns Default reader progress.
 *
 * @example
 * const progress = createDefaultProgress();
 */
function createDefaultProgress(): SavedReaderProgress {
	return {
		blockId: null,
		committedAnimationIds: [],
		innerProgress: 0,
		seenBlockIds: [],
		seenEntryIds: [],
		seenPageIds: [],
		seenPartIds: [],
		selectedBranchIds: [],
		updatedAt: new Date().toISOString(),
	};
}

export function readProgress(tale: Tale): SavedReaderProgress {
	if (typeof window === "undefined") return createDefaultProgress();

	const stored = window.localStorage.getItem(progressStorageKey(tale.id));
	if (!stored) return createDefaultProgress();

	try {
		return {
			...createDefaultProgress(),
			...(JSON.parse(stored) as SavedReaderProgress),
		};
	} catch {
		return createDefaultProgress();
	}
}

export function writeProgress(
	taleId: number | string,
	progress: SavedReaderProgress,
) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(
		progressStorageKey(taleId),
		JSON.stringify(progress),
	);
}
