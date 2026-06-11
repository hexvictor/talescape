import type { StateCreator } from "zustand/vanilla";
import { writeProgress } from "../../services/readerProgressStorage";
import type { ReaderLocation, SavedReaderProgress, Tale } from "../../types";
import type { TaleReaderState } from "../createReaderStore";

function addUniqueValues(items: string[], values: string[]): string[] {
	return [...new Set([...items, ...values])];
}

export type ProgressSlice = {
	progress: {
		commitFragments: (fragmentIds: string[]) => void;
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
			markLocationsReached: (locations) => {
				if (locations.length === 0) return;
				const progress = get().progress.data;
				const latest = locations.at(-1);
				if (!latest) return;
				const next = {
					...progress,
					blockId: latest.blockId,
					innerProgress: 0,
					seenBlockIds: addUniqueValues(
						progress.seenBlockIds,
						locations.map((location) => location.blockId),
					),
					seenEntryIds: addUniqueValues(
						progress.seenEntryIds,
						locations.map((location) => location.entryId),
					),
					seenPageIds: addUniqueValues(
						progress.seenPageIds,
						locations.map((location) => location.pageId),
					),
					seenPartIds: addUniqueValues(
						progress.seenPartIds,
						locations.map((location) => location.partId),
					),
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
