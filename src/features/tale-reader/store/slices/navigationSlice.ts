import type { StateCreator } from "zustand/vanilla";
import type { Block } from "~/server/db/data/tale-reader/types/blocks";
import type {
	Tale,
	TaleStructure,
} from "~/server/db/data/tale-reader/types/tales";
import type { TaleProgressSchema } from "~/server/db/schema";
import type { TaleReaderState } from "../createTaleReaderStore";
import type {
	Navigation,
	NavigationNodeMap,
	NavigationNodeType,
} from "../types/navigation";

export type NavigationSlice = {
	navigation: {
		current: Navigation | null;
		set: (id: number, type?: NavigationNodeType) => void;
		getNodeBlock: (id: number, type: NavigationNodeType) => Block | undefined;
		getNext: <T extends NavigationNodeType>(
			type: T,
		) => NavigationNodeMap[T] | undefined;
		getPrevious: <T extends NavigationNodeType>(
			type: T,
		) => NavigationNodeMap[T] | undefined;
		goToBlock: (
			blockId: number,
			opts?: {
				scroll?: boolean;
				navigate?: boolean;
				duration?: number;
			},
		) => void;
		goToNode: (
			type: NavigationNodeType,
			id: number,
			opts?: {
				scroll?: boolean;
				navigate?: boolean;
				duration?: number;
			},
		) => void;
		goToNextBlock: (opts?: {
			scroll?: boolean;
			navigate?: boolean;
			duration?: number;
		}) => void;
		goToPreviousBlock: (opts?: {
			scroll?: boolean;
			navigate?: boolean;
			duration?: number;
		}) => void;
	};
};

export const createNavigationSlice =
	(
		initialTale: Tale,
		initialProgress: TaleProgressSchema,
	): StateCreator<TaleReaderState, [], [], NavigationSlice> =>
	(set, get) => {
		const indexMap = initialTale.structure.indexMap;

		const activeBlockId =
			initialProgress?.lastBlockId ?? initialTale.structure.firstBlock;

		const activeBlock =
			activeBlockId != null
				? (indexMap.blocksById[activeBlockId] ?? null)
				: null;

		const getNode = createGetNodeBlock(indexMap);

		return {
			navigation: {
				current:
					activeBlock === null
						? null
						: {
								block: activeBlock,
								entry: activeBlock.entry,
								page: activeBlock.page,
								part: activeBlock.part,
								section: activeBlock.section,
							},

				set: (id, type = "block") => {
					const targetBlock = getNode[type](id);
					if (!targetBlock) return;

					set((state) => ({
						navigation: {
							...state.navigation,
							current: {
								page: targetBlock.page,
								entry: targetBlock.entry,
								part: targetBlock.part,
								block: targetBlock,
								section: targetBlock.section,
							},
						},
					}));
				},

				getNodeBlock: (id, type) => getNode[type](id),

				getNext: (type) => {
					const nav = get().navigation.current;
					if (!nav) return undefined;
					const currentNodeId = nav[type]?.id;
					if (!currentNodeId) return undefined;

					return createGetAdjacentNode(get().tale.data.structure)(
						currentNodeId,
						type,
						"next",
					);
				},

				getPrevious: (type) => {
					const nav = get().navigation.current;
					if (!nav) return undefined;
					const currentNodeId = nav[type]?.id;
					if (!currentNodeId) return undefined;

					return createGetAdjacentNode(get().tale.data.structure)(
						currentNodeId,
						type,
						"prev",
					);
				},

				goToBlock: (blockId, opts) => {
					const state = get();
					const block = state.tale.data.structure.indexMap.blocksById[blockId];
					if (!block) return;

					state.scroll.api?.clearPendingActiveBlockUpdate();

					if (opts?.scroll) {
						state.scroll.api?.scrollToBlockId(blockId, {
							duration: opts.duration,
							navigate: opts.navigate,
						});
						return;
					}

					state.navigation.set(block.id);

					if (!state.progress.isTrackingPaused) {
						state.progress.updateProgressByBlockId(blockId);
					}
				},

				goToNode: (type, id, opts) => {
					const targetBlock = get().navigation.getNodeBlock(id, type);
					if (!targetBlock) return;
					get().navigation.goToBlock(targetBlock.id, opts);
				},

				goToNextBlock: (opts) => {
					const next = get().navigation.getNext("block");
					if (!next) return;
					get().navigation.goToBlock(next.id, opts);
				},

				goToPreviousBlock: (opts) => {
					const prev = get().navigation.getPrevious("block");
					if (!prev) return;
					get().navigation.goToBlock(prev.id, opts);
				},
			},
		};
	};

function createGetNodeBlock(indexMap: TaleStructure["indexMap"]) {
	return {
		block: (id: number) => indexMap.blocksById[id],
		page: (id: number) =>
			indexMap.pagesById[id]?.blockId != null
				? indexMap.blocksById[indexMap.pagesById[id].blockId]
				: undefined,
		entry: (id: number) =>
			indexMap.entriesById[id]?.firstBlockId != null
				? indexMap.blocksById[indexMap.entriesById[id].firstBlockId]
				: undefined,
		part: (id: number) =>
			indexMap.partsById[id]?.firstBlockId != null
				? indexMap.blocksById[indexMap.partsById[id].firstBlockId]
				: undefined,
		section: (id: number) =>
			indexMap.sectionsById[id]?.firstBlockId != null
				? indexMap.blocksById[indexMap.sectionsById[id].firstBlockId]
				: undefined,
	};
}

function createGetAdjacentNode(structure: TaleStructure) {
	const { blockIds, entryIds, pageIds, partIds, sectionIds } = structure;
	const { blocksById, entriesById, pagesById, partsById, sectionsById } =
		structure.indexMap;

	const idArrays: Record<NavigationNodeType, number[]> = {
		block: blockIds,
		entry: entryIds,
		page: pageIds,
		part: partIds,
		section: sectionIds,
	};

	const dataMaps: {
		[K in NavigationNodeType]: Record<number, NavigationNodeMap[K]>;
	} = {
		block: blocksById,
		entry: entriesById,
		page: pagesById,
		part: partsById,
		section: sectionsById,
	};

	return function getAdjacentNode<K extends NavigationNodeType>(
		id: number,
		type: K,
		direction: "next" | "prev",
	): NavigationNodeMap[K] | undefined {
		const ids = idArrays[type];
		const map = dataMaps[type];
		const index = ids.indexOf(id);
		if (index === -1) return undefined;

		const nextIndex =
			direction === "next"
				? Math.min(index + 1, ids.length - 1)
				: Math.max(index - 1, 0);

		const adjacentId = ids[nextIndex];
		return adjacentId !== undefined ? map[adjacentId] : undefined;
	};
}
