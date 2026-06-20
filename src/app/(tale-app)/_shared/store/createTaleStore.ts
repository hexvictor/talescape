import { devtools } from "zustand/middleware";
import { type StateCreator, type StoreApi, createStore } from "zustand/vanilla";
import type { TaleStoreMode, SavedReaderProgress, Tale } from "../types";
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
import { type TaleSlice, createTaleSlice } from "./slices/taleSlice";
import { type UiSlice, createUiSlice } from "./slices/uiSlice";

export type TaleReaderState = TaleSlice &
	DebugSlice &
	EngineSlice &
	HubSlice &
	NavigationSlice &
	ProgressSlice &
	ReaderSlice &
	ScrollSlice &
	UiSlice;

export type TaleStoreExtensionCreator<TState extends TaleReaderState> =
	StateCreator<TState, [], [], Omit<TState, keyof TaleReaderState>>;

/**
 * Creates the isolated Zustand store used by one tale reader or editor runtime.
 *
 * @param tale - The formatted tale structure loaded from the database.
 * @param progress - The saved progress used to initialize navigation state.
 * @param mode - Whether the route is reading or editing the tale.
 * @param createExtension - Optional editor-specific slice creator.
 * @returns A vanilla Zustand store for the shared tale runtime context.
 *
 * @example
 * const store = createTaleStore(tale, progress);
 */
export function createTaleStore<
	TState extends TaleReaderState = TaleReaderState,
>(
	tale: Tale,
	progress: SavedReaderProgress,
	mode: TaleStoreMode = "read",
	createExtension?: TaleStoreExtensionCreator<TState>,
): StoreApi<TState> {
	const initializer: StateCreator<TState> = (set, get, api) => {
		const baseSet = set as unknown as Parameters<
			StateCreator<TaleReaderState>
		>[0];
		const baseGet = get as unknown as Parameters<
			StateCreator<TaleReaderState>
		>[1];
		const baseApi = api as unknown as Parameters<
			StateCreator<TaleReaderState>
		>[2];
		return {
			...createTaleSlice(tale)(baseSet, baseGet, baseApi),
			...createDebugSlice(baseSet, baseGet, baseApi),
			...createEngineSlice(baseSet, baseGet, baseApi),
			...createHubSlice(baseSet, baseGet, baseApi),
			...createNavigationSlice(tale, progress)(baseSet, baseGet, baseApi),
			...createProgressSlice(tale, progress)(baseSet, baseGet, baseApi),
			...createReaderSlice(baseSet, baseGet, baseApi),
			...createScrollSlice(baseSet, baseGet, baseApi),
			...createUiSlice(mode)(baseSet, baseGet, baseApi),
			...(createExtension?.(set, get, api) ?? {}),
		} as TState;
	};

	return createStore<TState>()(
		devtools(initializer, {
			enabled:
				process.env.NODE_ENV === "development" &&
				process.env.NEXT_PUBLIC_READER_STORE_DEVTOOLS === "true",
			name: "TaleStore",
		}),
	);
}
