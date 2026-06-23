import { devtools } from "zustand/middleware";
import { type StoreApi, createStore } from "zustand/vanilla";
import type { SavedReaderProgress, Tale } from "../types";
import type { TaleAppRuntime } from "./createTaleAppStore";
import {
	selectIsReaderHubOpen,
	selectReaderViewportLayout,
	selectShowsReaderNavigation,
	selectShowsReaderProgress,
	selectShowsReaderTools,
} from "./selectors/readerUiSelectors";
import { type DebugSlice, createDebugSlice } from "./slices/debugSlice";
import { type EngineSlice, createEngineSlice } from "./slices/engineSlice";
import { type HubSlice, createHubSlice } from "./slices/hubSlice";
import {
	type NavigationSlice,
	createNavigationSlice,
} from "./slices/navigationSlice";
import {
	type ProgressSlice,
	createProgressSlice,
} from "./slices/progressSlice";
import { type ReaderSlice, createReaderSlice } from "./slices/readerSlice";
import { type ScrollSlice, createScrollSlice } from "./slices/scrollSlice";
import { type UiSlice, createUiSlice } from "./slices/uiSlice";

export type TaleReaderState = DebugSlice &
	EngineSlice &
	HubSlice &
	NavigationSlice &
	ProgressSlice &
	ReaderSlice &
	ScrollSlice &
	UiSlice;

export type TaleReaderDerivedState = {
	readonly hubDocked: boolean;
	readonly isHubOpen: boolean;
	readonly showsNavigation: boolean;
	readonly showsProgress: boolean;
	readonly showsTools: boolean;
	readonly viewportLayout: ReturnType<typeof selectReaderViewportLayout>;
};

/**
 * Creates disposable reader engine, navigation, and viewport state.
 *
 * The authored tale remains in TaleAppStore. This reader state may be rebuilt
 * without losing editor draft data.
 *
 * @param tale - Current document snapshot used to initialize navigation.
 * @param progress - Saved reading progress.
 * @param runtime - Shared application and activity context used for defaults.
 * @returns Isolated tale reader store.
 *
 * @example
 * const store = createTaleReaderStore(tale, progress, { application: "reader", activity: "reading" });
 */
export function createTaleReaderStore(
	tale: Tale,
	progress: SavedReaderProgress,
	runtime: Pick<TaleAppRuntime, "activity" | "application">,
): StoreApi<TaleReaderState> {
	return createStore<TaleReaderState>()(
		devtools(
			(set, get, api) => ({
				...createDebugSlice(set, get, api),
				...createEngineSlice(set, get, api),
				...createHubSlice(set, get, api),
				...createNavigationSlice(tale, progress)(set, get, api),
				...createProgressSlice(tale, progress)(set, get, api),
				...createReaderSlice(set, get, api),
				...createScrollSlice(set, get, api),
				...createUiSlice(runtime)(set, get, api),
			}),
			{
				enabled:
					process.env.NODE_ENV === "development" &&
					process.env.NEXT_PUBLIC_READER_STORE_DEVTOOLS === "true",
				name: "TaleReaderStore",
			},
		),
	);
}

/**
 * Creates lazy derived values for one reader state snapshot.
 *
 * @param state - Current reader state.
 * @returns Read-only reader UI derivations.
 *
 * @example
 * const derived = createTaleReaderDerivedState(store.getState());
 */
export function createTaleReaderDerivedState(
	state: TaleReaderState,
): TaleReaderDerivedState {
	return {
		get hubDocked() {
			return (
				selectIsReaderHubOpen(state) &&
				selectReaderViewportLayout(state) === "desktop"
			);
		},
		get isHubOpen() {
			return selectIsReaderHubOpen(state);
		},
		get showsNavigation() {
			return selectShowsReaderNavigation(state);
		},
		get showsProgress() {
			return selectShowsReaderProgress(state);
		},
		get showsTools() {
			return selectShowsReaderTools(state);
		},
		get viewportLayout() {
			return selectReaderViewportLayout(state);
		},
	};
}
