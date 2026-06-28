import type { StateCreator } from "zustand/vanilla";
import { viewportFallback } from "../../constants";
import type { ViewportSize } from "../../types";
import type { TaleAppRuntime } from "../createTaleAppStore";
import type { TaleReaderState } from "../createTaleReaderStore";

export type ReaderUiVisibilityMode =
	| "all"
	| "hidden"
	| "minimal"
	| "navigation";

export type UiSlice = {
	ui: {
		activityFadeDelaySeconds: number;
		debugVisible: boolean;
		hiddenVisibilityMode: Exclude<ReaderUiVisibilityMode, "all">;
		navigationPinsVisible: boolean;
		navigationUsesSelectedPart: boolean;
		reduceInactiveUiOpacity: boolean;
		readerStatusVisible: boolean;
		setActivityFadeDelaySeconds: (seconds: number) => void;
		setDebugVisible: (visible: boolean) => void;
		setViewportSize: (viewport: ViewportSize, viewportFrame?: ViewportSize) => void;
		setNavigationPinsVisible: (visible: boolean) => void;
		setNavigationUsesSelectedPart: (enabled: boolean) => void;
		setReduceInactiveUiOpacity: (enabled: boolean) => void;
		setReaderStatusVisible: (visible: boolean) => void;
		setVisibilityMode: (mode: ReaderUiVisibilityMode) => void;
		toggleReaderUi: () => void;
		visibilityMode: ReaderUiVisibilityMode;
		viewport: ViewportSize;
		viewportFrame: ViewportSize;
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
	(
		runtime: Pick<TaleAppRuntime, "activity" | "application">,
	): StateCreator<TaleReaderState, [], [], UiSlice> =>
	(set) => ({
		ui: {
			activityFadeDelaySeconds: 4,
			debugVisible: runtime.application === "editor",
			hiddenVisibilityMode: "hidden",
			navigationPinsVisible: true,
			navigationUsesSelectedPart: false,
			reduceInactiveUiOpacity: runtime.application === "reader",
			readerStatusVisible: runtime.application === "editor",
			setActivityFadeDelaySeconds: (activityFadeDelaySeconds) =>
				set((state) => ({
					ui: { ...state.ui, activityFadeDelaySeconds },
				})),
			setDebugVisible: (debugVisible) =>
				set((state) => ({ ui: { ...state.ui, debugVisible } })),
			setViewportSize: (viewport, viewportFrame = viewport) =>
				set((state) => {
					if (
						state.ui.viewport.width === viewport.width &&
						state.ui.viewport.height === viewport.height &&
						state.ui.viewportFrame.width === viewportFrame.width &&
						state.ui.viewportFrame.height === viewportFrame.height
					) {
						return state;
					}
					return {
						ui: { ...state.ui, viewport, viewportFrame },
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
			viewportFrame: viewportFallback,
		},
	});
