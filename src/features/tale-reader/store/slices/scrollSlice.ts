import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createTaleReaderStore";

export type ReaderScrollApi = {
  scrollToBlockId: (blockId: number, opts?: { duration?: number }) => void;
  setPaused: (paused: boolean) => void;
  rebuild: () => void;
};

export type ScrollSlice = {
  scrollApi: ReaderScrollApi | null;
  setScrollApi: (api: ReaderScrollApi | null) => void;
  clearScrollApi: () => void;
};

export const createScrollSlice =
  (): StateCreator<TaleReaderState, [], [], ScrollSlice> => (set) => ({
    scrollApi: null,
    setScrollApi: (api) => set({ scrollApi: api }),
    clearScrollApi: () => set({ scrollApi: null }),
  });