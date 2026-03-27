import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createTaleReaderStore";

export type HubSlice = {
  taleHubOpen: boolean;
  openTaleHub: () => void;
  closeTaleHub: () => void;
  toggleTaleHub: () => void;
};

export const createHubSlice =
  (): StateCreator<TaleReaderState, [], [], HubSlice> => (set) => ({
    taleHubOpen: false,
    openTaleHub: () => set({ taleHubOpen: true }),
    closeTaleHub: () => set({ taleHubOpen: false }),
    toggleTaleHub: () =>
      set((state) => ({ taleHubOpen: !state.taleHubOpen })),
  });