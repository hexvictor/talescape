import type { StateCreator } from "zustand/vanilla";
import { writeProgress } from "../../services/readerProgressStorage";
import type { ReaderLocation, SavedReaderProgress, Tale } from "../../types";
import type { TaleReaderState } from "../createTaleStore";

function addUniqueValues(items: string[], values: string[]): string[] {
	return [...new Set([...items, ...values])];
}

/**
 * Checks whether two ordered string collections contain the same values.
 *
 * @param first - First collection.
 * @param second - Second collection.
 * @returns True when both collections match.
 */
function stringArraysEqual(first: string[], second: string[]): boolean {
	return (
		first.length === second.length &&
		first.every((value, index) => value === second[index])
	);
}

export type ProgressSlice = {
	progress: {
		commitAnimations: (animationIds: string[]) => void;
		data: SavedReaderProgress;
		markLocationsReached: (locations: ReaderLocation[]) => void;
		savePosition: (blockId: string, innerProgress: number) => void;
		setSelectedBranchIds: (ids: string[]) => void;
	};
};

export const createProgressSlice =
	(
		tale: Tale,
		initial: SavedReaderProgress,
	): StateCreator<TaleReaderState, [], [], ProgressSlice> =>
	(set, get) => ({
		progress: {
			commitAnimations: (animationIds) => {
				const progress = get().progress.data;
				const committedAnimationIds = [
					...new Set([...progress.committedAnimationIds, ...animationIds]),
				];
				if (
					committedAnimationIds.length === progress.committedAnimationIds.length
				)
					return;
				const next = {
					...progress,
					committedAnimationIds,
					updatedAt: new Date().toISOString(),
				};
				writeProgress(tale.id, next);
				set((state) => ({ progress: { ...state.progress, data: next } }));
			},
			data: initial,
			markLocationsReached: (locations) => {
				if (locations.length === 0) return;
				const progress = get().progress.data;
				const latest = locations.at(-1);
				if (!latest) return;
				const seenBlockIds = addUniqueValues(
					progress.seenBlockIds,
					locations.map((location) => location.blockId),
				);
				const seenEntryIds = addUniqueValues(
					progress.seenEntryIds,
					locations.map((location) => location.entryId),
				);
				const seenPageIds = addUniqueValues(
					progress.seenPageIds,
					locations.map((location) => location.pageId),
				);
				const seenPartIds = addUniqueValues(
					progress.seenPartIds,
					locations.map((location) => location.partId),
				);
				if (
					progress.blockId === latest.blockId &&
					stringArraysEqual(progress.seenBlockIds, seenBlockIds) &&
					stringArraysEqual(progress.seenEntryIds, seenEntryIds) &&
					stringArraysEqual(progress.seenPageIds, seenPageIds) &&
					stringArraysEqual(progress.seenPartIds, seenPartIds)
				) {
					return;
				}
				const next = {
					...progress,
					blockId: latest.blockId,
					innerProgress: 0,
					seenBlockIds,
					seenEntryIds,
					seenPageIds,
					seenPartIds,
					updatedAt: new Date().toISOString(),
				};
				writeProgress(tale.id, next);
				set((state) => ({ progress: { ...state.progress, data: next } }));
			},
			savePosition: (blockId, innerProgress) => {
				const progress = get().progress.data;
				const normalizedInnerProgress =
					Math.round(Math.max(0, Math.min(1, innerProgress)) * 1000) / 1000;
				if (
					progress.blockId === blockId &&
					Math.abs(progress.innerProgress - normalizedInnerProgress) < 0.002
				) {
					return;
				}
				const next = {
					...progress,
					blockId,
					innerProgress: normalizedInnerProgress,
					updatedAt: new Date().toISOString(),
				};
				writeProgress(tale.id, next);
				set((state) => ({ progress: { ...state.progress, data: next } }));
			},
			setSelectedBranchIds: (selectedBranchIds) => {
				const progress = get().progress.data;
				if (stringArraysEqual(progress.selectedBranchIds, selectedBranchIds)) {
					return;
				}
				const next = {
					...progress,
					selectedBranchIds,
					updatedAt: new Date().toISOString(),
				};
				writeProgress(tale.id, next);
				set((state) => ({ progress: { ...state.progress, data: next } }));
			},
		},
	});
