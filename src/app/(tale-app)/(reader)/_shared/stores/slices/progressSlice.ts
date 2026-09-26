import type { StateCreator } from "zustand/vanilla";
import { writeProgress } from "../../../../_shared/services/readerProgressStorage";
import type {
	ReaderLocation,
	SavedReaderProgress,
	Tale,
} from "../../../../_shared/types";
import type { TaleReaderState } from "../createTaleReaderStore";

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
		savePosition: (
			sceneId: string,
			keyframeId: string,
			innerProgress: number,
		) => void;
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
				const seenSceneIds = addUniqueValues(
					progress.seenSceneIds,
					locations.map((location) => location.sceneId),
				);
				const seenKeyframeIds = addUniqueValues(
					progress.seenKeyframeIds,
					locations.map((location) => location.keyframeId),
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
					progress.sceneId === latest.sceneId &&
					progress.keyframeId === latest.keyframeId &&
					stringArraysEqual(progress.seenSceneIds, seenSceneIds) &&
					stringArraysEqual(progress.seenKeyframeIds, seenKeyframeIds) &&
					stringArraysEqual(progress.seenEntryIds, seenEntryIds) &&
					stringArraysEqual(progress.seenPageIds, seenPageIds) &&
					stringArraysEqual(progress.seenPartIds, seenPartIds)
				) {
					return;
				}
				const next = {
					...progress,
					sceneId: latest.sceneId,
					keyframeId: latest.keyframeId,
					innerProgress: 0,
					seenSceneIds,
					seenKeyframeIds,
					seenEntryIds,
					seenPageIds,
					seenPartIds,
					updatedAt: new Date().toISOString(),
				};
				writeProgress(tale.id, next);
				set((state) => ({ progress: { ...state.progress, data: next } }));
			},
			savePosition: (sceneId, keyframeId, innerProgress) => {
				const progress = get().progress.data;
				const normalizedInnerProgress =
					Math.round(Math.max(0, Math.min(1, innerProgress)) * 1000) / 1000;
				if (
					progress.sceneId === sceneId &&
					progress.keyframeId === keyframeId &&
					Math.abs(progress.innerProgress - normalizedInnerProgress) < 0.002
				) {
					return;
				}
				const next = {
					...progress,
					sceneId,
					keyframeId,
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
