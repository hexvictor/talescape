import { create } from "zustand";

interface TaleReaderState {
	uiVisible: boolean;
	currentPage: number;
	currentEntry: number;
	hideUI: () => void;
	showUI: () => void;
	toggleUI: () => void;
	setCurrentPage: (page: number) => void;
	setCurrentEntry: (entry: number, page?: number) => void; // updated
}

export const useTaleReaderStore = create<TaleReaderState>((set) => ({
	uiVisible: true,
	currentPage: 1,
	currentEntry: 0,

	hideUI: () => set({ uiVisible: false }),
	showUI: () => set({ uiVisible: true }),
	toggleUI: () => set((state) => ({ uiVisible: !state.uiVisible })),
	setCurrentPage: (page) => set({ currentPage: page }),

	setCurrentEntry: (entry, page) =>
		set({
			currentEntry: entry,
			...(page !== undefined ? { currentPage: page } : {}),
		}),
}));
