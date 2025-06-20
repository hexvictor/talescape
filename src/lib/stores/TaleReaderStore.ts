import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
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
  TargetMeta,
} from "~/types/tale-reader/taleStructure";

export type TaleReaderNavigation = {
  page: PageMeta | null;
  entry: EntryMeta | null;
  part: PartMeta | null;
  block: BlockMeta | null;
  section: SectionMeta | null;
};

export interface TaleReaderState {
  uiVisible: boolean;
  hideUI: () => void;
  showUI: () => void;
  toggleUI: () => void;

  tale: Tale;
  progress: TaleProgressSchema;
  navigation: TaleReaderNavigation;

  setTale: (tale: Tale) => void;
  setNavigation: (id: number, type?: NavigationTargetType) => void;
  setNavigationByBlock: (block: BlockMeta) => void;
  setProgress: (newProgress: TaleProgressSchema) => void;
  generateProgressUpdate: (blockId: number) => TaleProgressSchema | null;

  getTargetBlock: (
    id: number,
    type: NavigationTargetType
  ) => BlockMeta | undefined;
  getNext: <T extends NavigationTargetType>(
    type: T
  ) => NavigationTargetMap[T] | undefined;

  getPrevious: <T extends NavigationTargetType>(
    type: T
  ) => NavigationTargetMap[T] | undefined;

  goToNext: <T extends NavigationTargetType>(type: T) => void;
  goToPrevious: <T extends NavigationTargetType>(type: T) => void;

  getNextBlock: () => BlockMeta | undefined;
  getNextEntry: () => EntryMeta | undefined;
  getNextPage: () => PageMeta | undefined;
  getNextPart: () => PartMeta | undefined;
  getNextSection: () => SectionMeta | undefined;

  getPreviousBlock: () => BlockMeta | undefined;
  getPreviousEntry: () => EntryMeta | undefined;
  getPreviousPage: () => PageMeta | undefined;
  getPreviousPart: () => PartMeta | undefined;
  getPreviousSection: () => SectionMeta | undefined;

  goToNextBlock: () => void;
  goToNextEntry: () => void;
  goToNextPage: () => void;
  goToNextPart: () => void;
  goToNextSection: () => void;

  goToPreviousBlock: () => void;
  goToPreviousEntry: () => void;
  goToPreviousPage: () => void;
  goToPreviousPart: () => void;
  goToPreviousSection: () => void;

  progressSaving: boolean;
  progressSavedAt: Date | null;
  setProgressSaving: (value: boolean) => void;
  setProgressSavedAt: (date: Date) => void;

  isScrollActive: boolean;
  setIsScrollActive: (value: boolean) => void;

  hasScrolled: boolean;
  setHasScrolled: (value: boolean) => void;

  isContentReady: boolean;
  setIsContentReady: (value: boolean) => void;

  progressDebounceTimer?: NodeJS.Timeout | null;
  lastQueuedBlockId?: number | null;
  setProgressDebounceTimer: (timer: NodeJS.Timeout | null) => void;
  setLastQueuedBlockId: (blockId: number | null) => void;
}

export function createTaleReaderStore(
  initialTale: Tale,
  initialProgress: TaleProgressSchema
) {
  const indexMap = initialTale.structure.indexMap;

  const firstBlockId =
    initialProgress?.lastBlockId ?? initialTale.structure.firstBlock;
  const block =
    firstBlockId != null ? indexMap.blocksById[firstBlockId] ?? null : null;

  const entry = block?.entryId
    ? indexMap.entriesById[block.entryId] ?? null
    : null;
  const page = block?.pageId ? indexMap.pagesById[block.pageId] ?? null : null;
  const part = block?.partId ? indexMap.partsById[block.partId] ?? null : null;
  const section = block?.sectionId
    ? indexMap.sectionsById[block.sectionId] ?? null
    : null;

  const initializer: StateCreator<TaleReaderState> = (set, get) => ({
    uiVisible: true,
    hideUI: () => set({ uiVisible: false }),
    showUI: () => set({ uiVisible: true }),
    toggleUI: () => set((s) => ({ uiVisible: !s.uiVisible })),

    tale: initialTale,
    progress: initialProgress,
    setTale: (tale) => set({ tale }),

    navigation: {
      block,
      entry,
      page,
      part,
      section,
    },

    progressSaving: false,
    progressSavedAt: null,

    setProgressSaving: (value: boolean) => set({ progressSaving: value }),
    setProgressSavedAt: (date: Date) => set({ progressSavedAt: date }),

    isScrollActive: false,
    setIsScrollActive: (value) => set({ isScrollActive: value }),

    hasScrolled: false,
    setHasScrolled: (value) => set({ hasScrolled: value }),

    getTargetBlock: (id, type = "block") => {
      const indexMap = get().tale.structure.indexMap;
      const blockFromTarget = getTargetBlock(indexMap);
      return blockFromTarget[type](id);
    },
    isContentReady: false,
    setIsContentReady: (value: boolean) => set({ isContentReady: value }),

    setNavigationByBlock: (block) => {
      set({
        navigation: {
          page: block.page,
          entry: block.entry,
          part: block.part,
          block,
          section: block.section,
        },
      });
    },
    setNavigation: (id, type = "block") => {
      const block = get().tale.structure.indexMap.blocksById[id];
      if (!block) return;
      set({
        navigation: {
          page: block.page,
          entry: block.entry,
          part: block.part,
          block,
          section: block.section,
        },
      });
    },

    setProgress: (newProgress) => {
      set({ progress: newProgress });
    },

    progressDebounceTimer: null,
    lastQueuedBlockId: null,

    setProgressDebounceTimer: (timer) => set({ progressDebounceTimer: timer }),
    setLastQueuedBlockId: (blockId) => set({ lastQueuedBlockId: blockId }),

    generateProgressUpdate: (blockId: number): TaleProgressSchema | null => {
      const { tale, progress: prevProgress } = get();

      const blocksById = tale.structure.indexMap.blocksById;
      const blockIds = tale.structure.blockIds;
      const block = blocksById[blockId];
      if (!block) return null;

      const seenBlockIds = Array.from(
        new Set([...(prevProgress.seenBlockIds ?? []), block.id])
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
          ? blocksById[maxBlockIdReached] ?? null
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

    getNext: (type) => {
      const nav = get().navigation;
      const structure = get().tale.structure;
      const currentTargetId = getCurrentTargetId(nav, type);
      if (!currentTargetId) return undefined;
      return createGetAdjacentTarget(structure)(currentTargetId, type, "next");
    },

    getPrevious: (type) => {
      const nav = get().navigation;
      const structure = get().tale.structure;
      const currentTargetId = getCurrentTargetId(nav, type);
      if (!currentTargetId) return undefined;
      return createGetAdjacentTarget(structure)(currentTargetId, type, "prev");
    },

    goToNext: (type) => {
      const next = get().getNext(type);
      if (next) get().setNavigation(next.id, type);
    },

    goToPrevious: (type) => {
      const prev = get().getPrevious(type);
      if (prev) get().setNavigation(prev.id, type);
    },

    getNextBlock: () => get().getNext("block"),
    getNextEntry: () => get().getNext("entry"),
    getNextPage: () => get().getNext("page"),
    getNextPart: () => get().getNext("part"),
    getNextSection: () => get().getNext("section"),

    goToNextBlock: () => get().goToNext("block"),
    goToNextEntry: () => get().goToNext("entry"),
    goToNextPage: () => get().goToNext("page"),
    goToNextPart: () => get().goToNext("part"),
    goToNextSection: () => get().goToNext("section"),

    getPreviousBlock: () => get().getPrevious("block"),
    getPreviousEntry: () => get().getPrevious("entry"),
    getPreviousPage: () => get().getPrevious("page"),
    getPreviousPart: () => get().getPrevious("part"),
    getPreviousSection: () => get().getPrevious("section"),

    goToPreviousBlock: () => get().goToPrevious("block"),
    goToPreviousEntry: () => get().goToPrevious("entry"),
    goToPreviousPage: () => get().goToPrevious("page"),
    goToPreviousPart: () => get().goToPrevious("part"),
    goToPreviousSection: () => get().goToPrevious("section"),
  });

  return createStore(devtools(initializer, { name: "TaleReaderStore" }));
}

// helpers reused from your original logic
function getTargetBlock(indexMap: TaleStructure["indexMap"]) {
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

function getCurrentTargetId(
  navigation: TaleReaderNavigation,
  type: NavigationTargetType
) {
  return navigation?.[type]?.id;
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
    direction: "next" | "prev"
  ): NavigationTargetMap[K] | undefined {
    const ids = idArrays[type];
    const map = dataMaps[type];
    const index = ids.indexOf(id);
    if (index === -1) return undefined;

    const clampedIndex =
      direction === "next"
        ? Math.min(index + 1, ids.length - 1)
        : Math.max(index - 1, 0);

    const adjacentId = ids[clampedIndex];
    return adjacentId !== undefined ? map[adjacentId] : undefined;
  };
}
