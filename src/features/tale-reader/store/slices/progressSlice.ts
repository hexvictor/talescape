import type { StateCreator } from "zustand/vanilla";
import type { ReaderProgressSchema } from "~/server/db/schema";
import type { TaleReaderState } from "../createReaderStore";

export type ProgressSlice = {
	progress: {
		data: ReaderProgressSchema;
		isSaving: boolean;
		isTrackingPaused: boolean;
		setProgress: (newProgress: ReaderProgressSchema) => void;
		generateProgressUpdate: (blockId: number) => ReaderProgressSchema | null;
		updateProgressByBlockId: (blockId: number) => ReaderProgressSchema | null;
		setIsSaving: (value: boolean) => void;
		setIsTrackingPaused: (value: boolean) => void;
	};
};

export const createProgressSlice =
	(
		initialProgress: ReaderProgressSchema,
	): StateCreator<TaleReaderState, [], [], ProgressSlice> =>
	(set, get) => ({
		progress: {
			data: initialProgress,
			isSaving: false,
			isTrackingPaused: false,

			setProgress: (newProgress) =>
				set((state) => ({
					progress: {
						...state.progress,
						data: newProgress,
					},
				})),

			generateProgressUpdate: (blockId) => {
				const { tale, progress } = get();
				const prevProgress = progress.data;

				const blocksById = tale.data.structure.indexMap.blocksById;
				const blockIds = tale.data.structure.blockIds;
				const block = blocksById[blockId];
				if (!block) return null;

				const seenBlockIds = Array.from(
					new Set([...(prevProgress.seenBlockIds ?? []), block.id]),
				);

				const total = blockIds.length;
				const currentIndex = block.globalIndex ?? 0;

				const prevMaxBlock =
					prevProgress.maxBlockIdReached != null
						? blocksById[prevProgress.maxBlockIdReached]
						: null;

				const prevIndex = prevMaxBlock?.globalIndex ?? -1;

				const maxBlockIdReached =
					currentIndex > prevIndex ? block.id : prevProgress.maxBlockIdReached;

				const seenBlockProgress = (seenBlockIds.length / total).toFixed(4);

				const maxBlock =
					maxBlockIdReached != null
						? (blocksById[maxBlockIdReached] ?? null)
						: null;

				const maxIndex = maxBlock?.globalIndex ?? 0;
				const maxReadProgress = ((maxIndex + 1) / total).toFixed(4);

				return {
					...prevProgress,
					lastBlockId: block.id,
					maxBlockIdReached,
					seenBlockIds,
					seenBlockProgress,
					maxReadProgress,
					updatedAt: new Date(),
				};
			},

			updateProgressByBlockId: (blockId) => {
				const { progress } = get();
				if (progress.isTrackingPaused) return null;

				const updated = progress.generateProgressUpdate(blockId);
				if (!updated) return null;

				set((state) => ({
					progress: {
						...state.progress,
						data: updated,
					},
				}));

				return updated;
			},

			setIsSaving: (value) =>
				set((state) => ({
					progress: {
						...state.progress,
						isSaving: value,
					},
				})),

			setIsTrackingPaused: (value) =>
				set((state) => ({
					progress: {
						...state.progress,
						isTrackingPaused: value,
					},
				})),
		},
	});
