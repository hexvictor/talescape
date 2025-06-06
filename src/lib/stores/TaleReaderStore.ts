import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { tale, type Tale, type TaleEntry } from "../data";

interface TaleReaderState {
  uiVisible: boolean;
  currentPage: number;
  tale: Tale;
  currentEntry: number;
  hideUI: () => void;
  showUI: () => void;
  toggleUI: () => void;
  setTale: (tale: Tale) => void;
  setCurrentPage: (page: number) => void;
  setCurrentEntry: (entry: number, page?: number) => void;
  currentBlockIndex: number;
  setCurrentBlockIndex: (index: number) => void;
  setNavigation: (entry: number, page?: number) => void;
  isAutoScrolling: boolean;
  setIsAutoScrolling: (value: boolean) => void;
}

export const useTaleReaderStore = create<TaleReaderState>()(
  devtools<TaleReaderState>((set) => ({
    uiVisible: true,
    currentPage: 0,
    currentEntry: 0,
    tale: tale,
    hideUI: () => set({ uiVisible: false }),
    showUI: () => set({ uiVisible: true }),
    toggleUI: () => set((state) => ({ uiVisible: !state.uiVisible })),
    setTale: (tale) => set({ tale }),
    setCurrentPage: (page) => set({ currentPage: page }),
    setCurrentEntry: (entry, page) =>
      set({
        currentEntry: entry,
        ...(page !== undefined ? { currentPage: page } : {}),
      }),
    currentBlockIndex: 0,
    setCurrentBlockIndex: (index) =>
      set((state) => {
        const blocks = state.tale.sections[0]?.blocks ?? [];
        const block = blocks[index];
        if (!block?.anchorId) return { currentBlockIndex: index };

        const id = block.anchorId.replace("anchor-", "");

        // 1. Check if it's an entry page (block matches entry.id)
        const entryIndex = state.tale.entries.findIndex((e) => e.id === id);
        if (entryIndex !== -1) {
          return {
            currentBlockIndex: index,
            currentEntry: entryIndex,
            currentPage: 0, // Entry page always page 0
          };
        }

        // 2. Check if it's a regular page
        const entryWithPage = state.tale.entries.find((entry) =>
          entry.pages.some((page) => page.id === id)
        );

        if (entryWithPage) {
          const entryIndex = state.tale.entries.indexOf(entryWithPage);
          const pageIndex = entryWithPage.pages.findIndex((p) => p.id === id);

          return {
            currentBlockIndex: index,
            currentEntry: entryIndex,
            currentPage: pageIndex + 1, // page[0] → 1
          };
        }

        // 3. Fallback
        return { currentBlockIndex: index };
      }),

    setNavigation: (entryNumber, pageNumber) =>
      set((state) => {
        const entry = state.tale.entries[entryNumber];
        if (!entry) return {};

        const blocks = state.tale.sections[0]?.blocks ?? [];

        const isEntryPage = pageNumber === undefined || pageNumber === -1;

        const id = isEntryPage ? entry.id : entry.pages[pageNumber]?.id;

        const anchorId = `anchor-${id}`;

        const blockIndex = blocks.findIndex(
          (block) => block.anchorId === anchorId
        );

        const entryPageBlockIndex = blocks.findIndex(
          (block) => block.anchorId === `anchor-${entry.pages[0]?.id}`
        );

        const currentEntryPageBlockIndex =
          entryPageBlockIndex !== -1
            ? entryPageBlockIndex
            : state.currentBlockIndex;
        const currentBlockIndex =
          blockIndex !== -1 ? blockIndex : currentEntryPageBlockIndex;
        return {
          currentEntry: entryNumber,
          currentPage: isEntryPage ? 0 : pageNumber + 1,
          currentBlockIndex,
        };
      }),

    isAutoScrolling: false,
    setIsAutoScrolling: (value) => set({ isAutoScrolling: value }),
  }))
);
