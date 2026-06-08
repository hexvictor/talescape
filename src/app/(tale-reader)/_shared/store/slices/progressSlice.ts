import type { StateCreator } from "zustand/vanilla";
import { writeProgress } from "../../services/readerProgressStorage";
import type { ReaderLocation, SavedReaderProgress, Tale } from "../../types";
import type { TaleReaderState } from "../createReaderStore";

function addUnique(items: string[], value: string) {
	return items.includes(value) ? items : [...items, value];
}

export type ProgressSlice = {
	progress: {
		commitFragments: (fragmentIds: string[]) => void;
		data: SavedReaderProgress;
		markLocationReached: (location: ReaderLocation) => void;
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
			commitFragments: (fragmentIds) => {
				const progress = get().progress.data;
				const committedFragmentIds = [
					...new Set([...progress.committedFragmentIds, ...fragmentIds]),
				];
				if (
					committedFragmentIds.length === progress.committedFragmentIds.length
				)
					return;
				const next = {
					...progress,
					committedFragmentIds,
					updatedAt: new Date().toISOString(),
				};
				writeProgress(tale.id, next);
				set((state) => ({ progress: { ...state.progress, data: next } }));
			},
			data: initial,
			markLocationReached: (location) => {
				const progress = get().progress.data;
				const next = {
					...progress,
					blockId: location.blockId,
					innerProgress: 0,
					seenBlockIds: addUnique(progress.seenBlockIds, location.blockId),
					seenEntryIds: addUnique(progress.seenEntryIds, location.entryId),
					seenPageIds: addUnique(progress.seenPageIds, location.pageId),
					seenPartIds: addUnique(progress.seenPartIds, location.partId),
					updatedAt: new Date().toISOString(),
				};
				writeProgress(tale.id, next);
				set((state) => ({ progress: { ...state.progress, data: next } }));
			},
			savePosition: (blockId, innerProgress) => {
				const next = {
					...get().progress.data,
					blockId,
					innerProgress,
					updatedAt: new Date().toISOString(),
				};
				writeProgress(tale.id, next);
				set((state) => ({ progress: { ...state.progress, data: next } }));
			},
			setSelectedBranchIds: (selectedBranchIds) => {
				const next = {
					...get().progress.data,
					selectedBranchIds,
					updatedAt: new Date().toISOString(),
				};
				writeProgress(tale.id, next);
				set((state) => ({ progress: { ...state.progress, data: next } }));
			},
		},
	});
