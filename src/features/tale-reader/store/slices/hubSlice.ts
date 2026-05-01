import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createReaderStore";

export type HubSlice = {
	taleHub: {
		isOpen: boolean;
		open: () => void;
		close: () => void;
		toggle: () => void;
	};
};

export const createHubSlice =
	(): StateCreator<TaleReaderState, [], [], HubSlice> => (set) => ({
		taleHub: {
			isOpen: false,
			open: () =>
				set((state) => ({
					taleHub: {
						...state.taleHub,
						isOpen: true,
					},
				})),
			close: () =>
				set((state) => ({
					taleHub: {
						...state.taleHub,
						isOpen: false,
					},
				})),
			toggle: () =>
				set((state) => ({
					taleHub: {
						...state.taleHub,
						isOpen: !state.taleHub.isOpen,
					},
				})),
		},
	});
