import type { StateCreator } from "zustand/vanilla";
import type { TaleProgressSchema } from "~/server/db/schema";
import type {
	Tale,
	TaleStructure,
	BlockMeta,
	EntryMeta,
	PageMeta,
	PartMeta,
	SectionMeta,
	NavigationTargetMap,
	NavigationTargetType,
} from "~/features/tale-reader/types/taleStructure";
import type { TaleReaderState } from "../createTaleReaderStore";

export type TaleReaderNavigation = {
	page: PageMeta | null;
	entry: EntryMeta | null;
	part: PartMeta | null;
	block: BlockMeta | null;
	section: SectionMeta | null;
};

export type NavigationSlice = {
	navigation: TaleReaderNavigation;
	activeBlockId: number | null;
	setActiveBlockId: (id: number | null) => void;
	setNavigation: (id: number, type?: NavigationTargetType) => void;
	setNavigationByBlock: (block: BlockMeta) => void;
	getTargetBlock: (
		id: number,
		type: NavigationTargetType,
	) => BlockMeta | undefined;
	getNext: <T extends NavigationTargetType>(
		type: T,
	) => NavigationTargetMap[T] | undefined;
	getPrevious: <T extends NavigationTargetType>(
		type: T,
	) => NavigationTargetMap[T] | undefined;
};

export const createNavigationSlice =
	(
		initialTale: Tale,
		initialProgress: TaleProgressSchema,
	): StateCreator<TaleReaderState, [], [], NavigationSlice> =>
	(set, get) => {
		const indexMap = initialTale.structure.indexMap;

		const firstBlockId =
			initialProgress?.lastBlockId ?? initialTale.structure.firstBlock;

		const block =
			firstBlockId != null ? (indexMap.blocksById[firstBlockId] ?? null) : null;

		const entry = block?.entryId
			? (indexMap.entriesById[block.entryId] ?? null)
			: null;

		const page = block?.pageId
			? (indexMap.pagesById[block.pageId] ?? null)
			: null;

		const part = block?.partId
			? (indexMap.partsById[block.partId] ?? null)
			: null;

		const section = block?.sectionId
			? (indexMap.sectionsById[block.sectionId] ?? null)
			: null;

		const getTarget = createGetTargetBlock(indexMap);

		return {
			navigation: {
				block,
				entry,
				page,
				part,
				section,
			},

			activeBlockId: initialProgress?.lastBlockId ?? null,
			setActiveBlockId: (id) => set({ activeBlockId: id }),

			setNavigationByBlock: (targetBlock) => {
				set({
					navigation: {
						page: targetBlock.page,
						entry: targetBlock.entry,
						part: targetBlock.part,
						block: targetBlock,
						section: targetBlock.section,
					},
				});
			},

			setNavigation: (id, type = "block") => {
				const targetBlock = getTarget[type](id);
				if (!targetBlock) return;

				set({
					navigation: {
						page: targetBlock.page,
						entry: targetBlock.entry,
						part: targetBlock.part,
						block: targetBlock,
						section: targetBlock.section,
					},
				});
			},

			getTargetBlock: (id, type) => getTarget[type](id),

			getNext: (type) => {
				const nav = get().navigation;
				const currentTargetId = nav[type]?.id;
				if (!currentTargetId) return undefined;
				return createGetAdjacentTarget(get().tale.structure)(
					currentTargetId,
					type,
					"next",
				);
			},

			getPrevious: (type) => {
				const nav = get().navigation;
				const currentTargetId = nav[type]?.id;
				if (!currentTargetId) return undefined;
				return createGetAdjacentTarget(get().tale.structure)(
					currentTargetId,
					type,
					"prev",
				);
			},
		};
	};

function createGetTargetBlock(indexMap: TaleStructure["indexMap"]) {
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

function createGetAdjacentTarget(structure: TaleStructure) {
	const { blockIds, entryIds, pageIds, partIds, sectionIds } = structure;
	const { blocksById, entriesById, pagesById, partsById, sectionsById } =
		structure.indexMap;

	const idArrays: Record<NavigationTargetType, number[]> = {
		block: blockIds,
		entry: entryIds,
		page: pageIds,
		part: partIds,
		section: sectionIds,
	};

	const dataMaps: {
		[K in NavigationTargetType]: Record<number, NavigationTargetMap[K]>;
	} = {
		block: blocksById,
		entry: entriesById,
		page: pagesById,
		part: partsById,
		section: sectionsById,
	};

	return function getAdjacentTarget<K extends NavigationTargetType>(
		id: number,
		type: K,
		direction: "next" | "prev",
	): NavigationTargetMap[K] | undefined {
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
