import type { StateCreator } from "zustand/vanilla";
import type { TaleContent } from "~/server/db/data/tale-reader/types/tales";
import type { ReaderProgressSchema } from "~/server/db/schema";
import type { TaleReaderState } from "../createReaderStore";

type ChoosePathOptions = {
	scroll?: boolean;
	navigate?: boolean;
	duration?: number;
};

export type ProgressSlice = {
	progress: {
		data: ReaderProgressSchema;
		isSaving: boolean;
		isTrackingPaused: boolean;
		setProgress: (newProgress: ReaderProgressSchema) => void;
		generateProgressUpdate: (blockId: number) => ReaderProgressSchema | null;
		updateProgressByBlockId: (blockId: number) => ReaderProgressSchema | null;
		choosePath: (
			pathId: number,
			opts?: ChoosePathOptions,
		) => ReaderProgressSchema | null;
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

			setProgress: (newProgress) => {
				set((state) => ({
					progress: {
						...state.progress,
						data: newProgress,
					},
				}));
				get().navigation.refreshContext();
			},

			generateProgressUpdate: (blockId) => {
				const { tale, progress } = get();
				const prevProgress = progress.data;
				const { content } = tale.data;

				const blocksById = content.indexMap.blocksById;
				const block = blocksById[blockId];
				if (!block) return null;

				const seenBlockIds = Array.from(
					new Set([...(prevProgress.seenBlockIds ?? []), block.id]),
				);

				const total = content.counts.blocks;
				if (total === 0) return null;

				const currentIndex = block.position.index;

				const prevMaxBlock =
					prevProgress.maxBlockIdReached != null
						? blocksById[prevProgress.maxBlockIdReached]
						: null;

				const prevIndex = prevMaxBlock?.position.index ?? -1;

				const maxBlockIdReached =
					currentIndex > prevIndex ? block.id : prevProgress.maxBlockIdReached;

				const seenBlockProgress = (seenBlockIds.length / total).toFixed(4);

				const maxBlock =
					maxBlockIdReached != null
						? (blocksById[maxBlockIdReached] ?? null)
						: null;

				const maxIndex = maxBlock?.position.index ?? 0;
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
				get().navigation.refreshContext();

				return updated;
			},

			choosePath: (pathId, opts) => {
				const { tale, progress } = get();
				const { content } = tale.data;
				const path = content.indexMap.pathsById[pathId];
				if (!path) return null;

				const activePathIds = replaceActivePathChoice(
					content,
					progress.data.activePathIds ?? [],
					path.id,
				);
				const seenPathIds = Array.from(
					new Set([...(progress.data.seenPathIds ?? []), path.id]),
				);

				const updated = {
					...progress.data,
					activePathIds,
					seenPathIds,
					updatedAt: new Date(),
				};

				set((state) => ({
					progress: {
						...state.progress,
						data: updated,
					},
				}));
				get().navigation.refreshContext();

				const firstBlockId =
					content.indexMap.branchesById[path.toBranchId]?.bounds.firstBlockId;

				if (firstBlockId != null && opts?.navigate !== false) {
					const goToChosenBranch = () => {
						get().navigation.goToBlock(firstBlockId, {
							scroll: opts?.scroll ?? true,
							navigate: opts?.navigate,
							duration: opts?.duration,
						});
					};

					if (typeof window === "undefined") {
						goToChosenBranch();
					} else {
						window.requestAnimationFrame(goToChosenBranch);
					}
				}

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

function replaceActivePathChoice(
	content: TaleContent,
	activePathIds: number[],
	selectedPathId: number,
) {
	const selectedPath = content.indexMap.pathsById[selectedPathId];
	if (!selectedPath) return activePathIds;

	const prunedBranchIds = collectReachableBranchIds(
		content,
		selectedPath.fromBranchId,
	);
	const nextActivePathIds = activePathIds.filter((pathId) => {
		if (pathId === selectedPathId) return false;

		const activePath = content.indexMap.pathsById[pathId];
		if (!activePath) return false;

		if (activePath.fromBranchId === selectedPath.fromBranchId) return false;

		return !prunedBranchIds.has(activePath.fromBranchId);
	});

	return Array.from(new Set([...nextActivePathIds, selectedPathId]));
}

function collectReachableBranchIds(
	content: TaleContent,
	fromBranchId: number,
	visited = new Set<number>(),
) {
	const branch = content.indexMap.branchesById[fromBranchId];
	if (!branch) return visited;

	for (const pathId of branch.links.outgoingPathIds) {
		const path = content.indexMap.pathsById[pathId];
		if (!path || visited.has(path.toBranchId)) continue;

		visited.add(path.toBranchId);
		collectReachableBranchIds(content, path.toBranchId, visited);
	}

	return visited;
}
