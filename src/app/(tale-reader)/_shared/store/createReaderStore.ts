import { devtools } from "zustand/middleware";
import { type StateCreator, createStore } from "zustand/vanilla";
import type { ReaderMode, SavedReaderProgress, Tale } from "../types";
import { type DebugSlice, createDebugSlice } from "./slices/debugSlice";
import { type EditorSlice, createEditorSlice } from "./slices/editorSlice";
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
	EditorSlice &
	EngineSlice &
	HubSlice &
	NavigationSlice &
	ProgressSlice &
	ReaderSlice &
	ScrollSlice &
	UiSlice;

/**
 * Creates the isolated Zustand store used by one tale reader instance.
 *
 * @param tale - The formatted tale structure loaded from the database.
 * @param progress - The saved progress used to initialize navigation state.
 * @param mode - Whether the route is reading or editing the tale.
 * @returns A vanilla Zustand store for the reader context.
 *
 * @example
 * const store = createReaderStore(tale, progress);
 */
export function createReaderStore(
	tale: Tale,
	progress: SavedReaderProgress,
	mode: ReaderMode = "read",
) {
	const initializer: StateCreator<TaleReaderState> = (set, get, api) => ({
		...createTaleSlice(tale)(set, get, api),
		...createDebugSlice(set, get, api),
		...createEditorSlice(mode)(set, get, api),
		...createEngineSlice(set, get, api),
		...createHubSlice(set, get, api),
		...createNavigationSlice(tale, progress)(set, get, api),
		...createProgressSlice(tale, progress)(set, get, api),
		...createReaderSlice(set, get, api),
		...createScrollSlice(set, get, api),
		...createUiSlice(set, get, api),
	});

	return createStore<TaleReaderState>()(
		devtools(initializer, {
			enabled:
				process.env.NODE_ENV === "development" &&
				process.env.NEXT_PUBLIC_READER_STORE_DEVTOOLS === "true",
			name: "TaleReaderStore",
		}),
	);
}
