import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createTaleReaderStore";

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
		openCodex: () => void;
		panelWidthPx: number;
		setActivePanel: (panel: ReaderHubPanel) => void;
		setPanelWidthPx: (width: number) => void;
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
		openCodex: () =>
			set((state) => ({
				hub: { ...state.hub, activePanel: "codex", open: true },
			})),
		panelWidthPx: 360,
		setActivePanel: (activePanel) =>
			set((state) => ({ hub: { ...state.hub, activePanel } })),
		setPanelWidthPx: (panelWidthPx) =>
			set((state) => ({ hub: { ...state.hub, panelWidthPx } })),
		toggleOpen: () =>
			set((state) => ({ hub: { ...state.hub, open: !state.hub.open } })),
	},
});
