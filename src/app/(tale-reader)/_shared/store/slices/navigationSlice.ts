import type { StateCreator } from "zustand/vanilla";
import type { Block } from "~/server/db/data/tale-reader/types/blocks";
import type {
	Tale,
	TaleContent,
} from "~/server/db/data/tale-reader/types/tales";
import type { ReaderProgressSchema } from "~/server/db/schema";
import type { TaleReaderState } from "../createReaderStore";
import {
	createNavigationContext,
	getEffectivePage,
} from "../selectors/navigationContext";
import type {
	Navigation,
	NavigationContext,
	NavigationNodeMap,
	NavigationNodeType,
} from "../types/navigation";

export type NavigationSlice = {
	navigation: {
		context: NavigationContext | null;
		current: Navigation | null;
		refreshContext: () => void;
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
		initialProgress: ReaderProgressSchema,
	): StateCreator<TaleReaderState, [], [], NavigationSlice> =>
	(set, get) => {
		const content = initialTale.content;
		const { indexMap } = content;

		const activeBlockId =
			initialProgress?.lastBlockId ?? content.bounds.firstBlockId;

		const activeBlock =
			activeBlockId != null
				? (indexMap.blocksById[activeBlockId] ?? null)
				: null;

		const getNodeBlock = createGetNodeBlock(content);
		const createCurrentNavigation = (
			block: Block,
			activePathIds: number[],
		): Navigation => ({
			block,
			effectivePage: getEffectivePage({
				activePathIds,
				block,
				content,
			}),
			entry: block.entry,
			page: block.page,
			part: block.part,
			section: block.section,
		});
		const createCurrentContext = (
			block: Block,
			activePathIds: number[],
		): NavigationContext =>
			createNavigationContext({
				activePathIds,
				block,
				content,
			});
		const initialActivePathIds = initialProgress?.activePathIds ?? [];

		return {
			navigation: {
				context:
					activeBlock === null
						? null
						: createCurrentContext(activeBlock, initialActivePathIds),
				current:
					activeBlock === null
						? null
						: createCurrentNavigation(activeBlock, initialActivePathIds),

				refreshContext: () => {
					const state = get();
					const currentBlock = state.navigation.current?.block;
					if (!currentBlock) return;

					const activePathIds = state.progress.data.activePathIds ?? [];
					set((nextState) => ({
						navigation: {
							...nextState.navigation,
							context: createNavigationContext({
								activePathIds,
								block: currentBlock,
								content: nextState.tale.data.content,
							}),
							current: createCurrentNavigation(currentBlock, activePathIds),
						},
					}));
				},

				set: (id, type = "block") => {
					const targetBlock = getNodeBlock(id, type);
					if (!targetBlock) return;
					const state = get();
					const activePathIds = state.progress.data.activePathIds ?? [];

					set((state) => ({
						navigation: {
							...state.navigation,
							context: createNavigationContext({
								activePathIds,
								block: targetBlock,
								content: state.tale.data.content,
							}),
							current: createCurrentNavigation(targetBlock, activePathIds),
						},
					}));
				},

				getNodeBlock: (id, type) => getNodeBlock(id, type),

				getNext: (type) => {
					const nav = get().navigation.current;
					if (!nav) return undefined;
					const currentNodeId = nav[type]?.id;
					if (!currentNodeId) return undefined;

					return getAdjacentNode(
						get().tale.data.content,
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

					return getAdjacentNode(
						get().tale.data.content,
						currentNodeId,
						type,
						"prev",
					);
				},

				goToBlock: (blockId, opts) => {
					const state = get();
					const block = state.tale.data.content.indexMap.blocksById[blockId];
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

function createGetNodeBlock(content: TaleContent) {
	const { indexMap } = content;

	return function getNodeBlock(id: number, type: NavigationNodeType) {
		if (type === "block") return indexMap.blocksById[id];

		const blockId = getFirstBlockIdForNode(content, id, type);

		return blockId != null ? indexMap.blocksById[blockId] : undefined;
	};
}

function getAdjacentNode<K extends NavigationNodeType>(
	content: TaleContent,
	id: number,
	type: K,
	direction: "next" | "prev",
): NavigationNodeMap[K] | undefined {
	const adjacentId = getAdjacentNodeId(content, id, type, direction);
	if (adjacentId == null) return undefined;

	const map = getNodeMap(content, type);

	return map[adjacentId];
}

function getFirstBlockIdForNode(
	content: TaleContent,
	id: number,
	type: NavigationNodeType,
) {
	switch (type) {
		case "page":
			return content.indexMap.pagesById[id]?.bounds.firstBlockId ?? null;
		case "entry":
			return content.indexMap.entriesById[id]?.bounds.firstBlockId ?? null;
		case "part":
			return content.indexMap.partsById[id]?.bounds.firstBlockId ?? null;
		case "section":
			return content.indexMap.sectionsById[id]?.bounds.firstBlockId ?? null;
		case "block":
			return id;
	}
}

function getAdjacentNodeId(
	content: TaleContent,
	id: number,
	type: NavigationNodeType,
	direction: "next" | "prev",
) {
	switch (type) {
		case "block":
			return direction === "next"
				? content.indexMap.blocksById[id]?.links.nextBlockIdInBranch
				: content.indexMap.blocksById[id]?.links.previousBlockIdInBranch;
		case "entry":
			return direction === "next"
				? content.indexMap.entriesById[id]?.links.nextEntryId
				: content.indexMap.entriesById[id]?.links.previousEntryId;
		case "page":
			return direction === "next"
				? content.indexMap.pagesById[id]?.links.nextPageId
				: content.indexMap.pagesById[id]?.links.previousPageId;
		case "part":
			return direction === "next"
				? content.indexMap.partsById[id]?.links.nextPartId
				: content.indexMap.partsById[id]?.links.previousPartId;
		case "section":
			return direction === "next"
				? content.indexMap.sectionsById[id]?.links.nextSectionId
				: content.indexMap.sectionsById[id]?.links.previousSectionId;
	}
}

function getNodeMap<K extends NavigationNodeType>(
	content: TaleContent,
	type: K,
): Record<number, NavigationNodeMap[K]> {
	switch (type) {
		case "block":
			return content.indexMap.blocksById as Record<
				number,
				NavigationNodeMap[K]
			>;
		case "entry":
			return content.indexMap.entriesById as Record<
				number,
				NavigationNodeMap[K]
			>;
		case "page":
			return content.indexMap.pagesById as Record<number, NavigationNodeMap[K]>;
		case "part":
			return content.indexMap.partsById as Record<number, NavigationNodeMap[K]>;
		case "section":
			return content.indexMap.sectionsById as Record<
				number,
				NavigationNodeMap[K]
			>;
	}
}
