import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createTaleReaderStore";

export type UiSlice = {
	debugMode: boolean;
	uiVisible: boolean;
	isViewportRebuilding: boolean;
	hideUI: () => void;
	showUI: () => void;
	toggleUI: () => void;
	toggleDebugMode: () => void;
	setIsViewportRebuilding: (value: boolean) => void;
};

export const createUiSlice =
	(): StateCreator<TaleReaderState, [], [], UiSlice> => (set) => ({
		debugMode: true,
		uiVisible: true,
		isViewportRebuilding: false,
		hideUI: () => set({ uiVisible: false }),
		showUI: () => set({ uiVisible: true }),
		toggleUI: () => set((state) => ({ uiVisible: !state.uiVisible })),
		toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),
		setIsViewportRebuilding: (value) => set({ isViewportRebuilding: value }),
	});
