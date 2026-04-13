import type { StateCreator } from "zustand/vanilla";
import type { TaleProgressSchema } from "~/server/db/schema";
import type { TaleReaderState } from "../createTaleReaderStore";

export type ProgressSlice = {
	progress: TaleProgressSchema;
	setProgress: (newProgress: TaleProgressSchema) => void;
	generateProgressUpdate: (blockId: number) => TaleProgressSchema | null;
	updateProgressByBlockId: (blockId: number) => TaleProgressSchema | null;
	progressSaving: boolean;
	progressSavedAt: Date | null;
	setProgressSaving: (value: boolean) => void;
	setProgressSavedAt: (date: Date) => void;
	progressDebounceTimer?: NodeJS.Timeout | null;
	lastQueuedBlockId?: number | null;
	setProgressDebounceTimer: (timer: NodeJS.Timeout | null) => void;
	setLastQueuedBlockId: (blockId: number | null) => void;
};

export const createProgressSlice =
	(
		initialProgress: TaleProgressSchema,
	): StateCreator<TaleReaderState, [], [], ProgressSlice> =>
	(set, get) => ({
		progress: initialProgress,
		setProgress: (newProgress) => set({ progress: newProgress }),

		generateProgressUpdate: (blockId) => {
			const { tale, progress: prevProgress } = get();

			const blocksById = tale.structure.indexMap.blocksById;
			const blockIds = tale.structure.blockIds;
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
			const linearReadProgress = ((maxIndex + 1) / total).toFixed(4);

			return {
				...prevProgress,
				lastBlockId: block.id,
				maxBlockIdReached,
				seenBlockIds,
				seenBlockProgress,
				linearReadProgress,
				updatedAt: new Date(),
			};
		},

		updateProgressByBlockId: (blockId) => {
			const updated = get().generateProgressUpdate(blockId);
			if (!updated) return null;

			set({
				progress: updated,
				progressSavedAt: new Date(),
			});

			return updated;
		},

		progressSaving: false,
		progressSavedAt: null,
		setProgressSaving: (value) => set({ progressSaving: value }),
		setProgressSavedAt: (date) => set({ progressSavedAt: date }),

		progressDebounceTimer: null,
		lastQueuedBlockId: null,
		setProgressDebounceTimer: (timer) => set({ progressDebounceTimer: timer }),
		setLastQueuedBlockId: (blockId) => set({ lastQueuedBlockId: blockId }),
	});
