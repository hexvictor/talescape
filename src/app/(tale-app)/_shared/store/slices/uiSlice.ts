import type { StateCreator } from "zustand/vanilla";
import { viewportFallback } from "../../constants";
import type {
	TaleStoreMode,
	ReaderViewportLayout,
	ViewportSize,
} from "../../types";
import type { TaleReaderState } from "../createTaleStore";

export type ReaderUiVisibilityMode =
	| "all"
	| "hidden"
	| "minimal"
	| "navigation";

export type UiSlice = {
	ui: {
		activityFadeDelaySeconds: number;
		contentsOpen: boolean;
		debugVisible: boolean;
		hiddenVisibilityMode: Exclude<ReaderUiVisibilityMode, "all">;
		navigationPinsVisible: boolean;
		navigationUsesSelectedPart: boolean;
		layout: ReaderViewportLayout;
		reduceInactiveUiOpacity: boolean;
		readerStatusVisible: boolean;
		setActivityFadeDelaySeconds: (seconds: number) => void;
		setDebugVisible: (visible: boolean) => void;
		setViewportMetrics: (
			viewport: ViewportSize,
			layout: ReaderViewportLayout,
		) => void;
		setNavigationPinsVisible: (visible: boolean) => void;
		setNavigationUsesSelectedPart: (enabled: boolean) => void;
		setReduceInactiveUiOpacity: (enabled: boolean) => void;
		setReaderStatusVisible: (visible: boolean) => void;
		setVisibilityMode: (mode: ReaderUiVisibilityMode) => void;
		toggleContents: () => void;
		toggleReaderUi: () => void;
		visibilityMode: ReaderUiVisibilityMode;
		viewport: ViewportSize;
	};
};

/**
 * Creates reader overlay visibility state and actions.
 *
 * @param mode - Reader route mode.
 * @returns The reader UI slice.
 *
 * @example
 * const uiSlice = createUiSlice(set, get, api);
 */
export const createUiSlice =
	(mode: TaleStoreMode): StateCreator<TaleReaderState, [], [], UiSlice> =>
	(set) => ({
		ui: {
			activityFadeDelaySeconds: 4,
			contentsOpen: false,
			debugVisible: mode === "edit",
			hiddenVisibilityMode: "hidden",
			layout: "desktop",
			navigationPinsVisible: true,
			navigationUsesSelectedPart: false,
			reduceInactiveUiOpacity: mode !== "edit",
			readerStatusVisible: mode === "edit",
			setActivityFadeDelaySeconds: (activityFadeDelaySeconds) =>
				set((state) => ({
					ui: { ...state.ui, activityFadeDelaySeconds },
				})),
			setDebugVisible: (debugVisible) =>
				set((state) => ({ ui: { ...state.ui, debugVisible } })),
			setViewportMetrics: (viewport, layout) =>
				set((state) => {
					if (
						state.ui.layout === layout &&
						state.ui.viewport.width === viewport.width &&
						state.ui.viewport.height === viewport.height
					) {
						return state;
					}
					return {
						ui: { ...state.ui, layout, viewport },
					};
				}),
			setNavigationPinsVisible: (navigationPinsVisible) =>
				set((state) => ({ ui: { ...state.ui, navigationPinsVisible } })),
			setNavigationUsesSelectedPart: (navigationUsesSelectedPart) =>
				set((state) => ({ ui: { ...state.ui, navigationUsesSelectedPart } })),
			setReduceInactiveUiOpacity: (reduceInactiveUiOpacity) =>
				set((state) => ({ ui: { ...state.ui, reduceInactiveUiOpacity } })),
			setReaderStatusVisible: (readerStatusVisible) =>
				set((state) => ({ ui: { ...state.ui, readerStatusVisible } })),
			setVisibilityMode: (visibilityMode) =>
				set((state) => ({
					ui: {
						...state.ui,
						hiddenVisibilityMode:
							visibilityMode === "all"
								? state.ui.hiddenVisibilityMode
								: visibilityMode,
						visibilityMode,
					},
				})),
			toggleContents: () =>
				set((state) => ({
					ui: { ...state.ui, contentsOpen: !state.ui.contentsOpen },
				})),
			toggleReaderUi: () =>
				set((state) => ({
					ui: {
						...state.ui,
						visibilityMode:
							state.ui.visibilityMode === "all"
								? state.ui.hiddenVisibilityMode
								: "all",
					},
				})),
			visibilityMode: "all",
			viewport: viewportFallback,
		},
	});
