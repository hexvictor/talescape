import type { ReaderViewportLayout } from "../../types";
import type { TaleReaderState } from "../createTaleReaderStore";

/**
 * Determines whether navigation controls are available for the active UI mode.
 *
 * @param state - Complete reader runtime state.
 * @returns Whether navigation features should be mounted.
 *
 * @example
 * const visible = selectShowsReaderNavigation(store.getState());
 */
export function selectShowsReaderNavigation(state: TaleReaderState): boolean {
	return (
		state.ui.visibilityMode === "all" ||
		state.ui.visibilityMode === "navigation"
	);
}

/**
 * Determines whether reader progress and scroll guidance are visible.
 *
 * @param state - Complete reader runtime state.
 * @returns Whether progress features should be mounted.
 *
 * @example
 * const visible = selectShowsReaderProgress(store.getState());
 */
export function selectShowsReaderProgress(state: TaleReaderState): boolean {
	return state.ui.visibilityMode !== "hidden";
}

/**
 * Determines whether optional reader tools are visible.
 *
 * @param state - Complete reader runtime state.
 * @returns Whether tool overlays should be mounted.
 *
 * @example
 * const visible = selectShowsReaderTools(store.getState());
 */
export function selectShowsReaderTools(state: TaleReaderState): boolean {
	return state.ui.visibilityMode === "all";
}

/**
 * Determines whether the Reader Hub is open and available in the current UI mode.
 *
 * @param state - Complete reader runtime state.
 * @returns Whether the open Reader Hub affects viewport layout.
 *
 * @example
 * const open = selectIsReaderHubOpen(store.getState());
 */
export function selectIsReaderHubOpen(state: TaleReaderState): boolean {
	return state.hub.open && selectShowsReaderNavigation(state);
}

/**
 * Derives responsive reader layout from canonical viewport dimensions.
 *
 * @param state - Complete reader runtime state.
 * @returns Desktop, portrait-mobile, or landscape-mobile layout.
 *
 * @example
 * const layout = selectReaderViewportLayout(store.getState());
 */
export function selectReaderViewportLayout(
	state: TaleReaderState,
): ReaderViewportLayout {
	const { height, width } = state.ui.viewport;
	if (width >= 768) return "desktop";
	return height > width ? "mobile-portrait" : "mobile-landscape";
}
