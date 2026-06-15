import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createReaderStore";

export type ReaderHubPanel =
	| "art"
	| "codex"
	| "community"
	| "settings"
	| "trivia";

export type HubSlice = {
	hub: {
		activePanel: ReaderHubPanel;
		open: boolean;
		setActivePanel: (panel: ReaderHubPanel) => void;
		toggleOpen: () => void;
	};
};

/**
 * Creates the reader hub overlay slice.
 *
 * @param set - Zustand state setter.
 * @returns Hub state and actions.
 *
 * @example
 * const slice = createHubSlice(set, get, api);
 */
export const createHubSlice: StateCreator<TaleReaderState, [], [], HubSlice> = (
	set,
) => ({
	hub: {
		activePanel: "community",
		open: false,
		setActivePanel: (activePanel) =>
			set((state) => ({ hub: { ...state.hub, activePanel } })),
		toggleOpen: () =>
			set((state) => ({ hub: { ...state.hub, open: !state.hub.open } })),
	},
});
