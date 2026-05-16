import { devtools } from "zustand/middleware";
import { type StateCreator, createStore } from "zustand/vanilla";
import type { Tale } from "~/server/db/data/tale-reader/types/tales";
import type { ReaderProgressSchema } from "~/server/db/schema";
import { type DebugSlice, createDebugSlice } from "./slices/debugSlice";
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
	UiSlice &
	HubSlice &
	ReaderSlice &
	NavigationSlice &
	ProgressSlice &
	ScrollSlice &
	DebugSlice;

export function createReaderStore(
	initialTale: Tale,
	initialProgress: ReaderProgressSchema,
) {
	const initializer: StateCreator<TaleReaderState> = (set, get, api) => ({
		...createTaleSlice(initialTale)(set, get, api),
		...createUiSlice()(set, get, api),
		...createHubSlice()(set, get, api),
		...createReaderSlice()(set, get, api),
		...createNavigationSlice(initialTale, initialProgress)(set, get, api),
		...createProgressSlice(initialProgress)(set, get, api),
		...createScrollSlice()(set, get, api),
		...createDebugSlice()(set, get, api),
	});

	return createStore<TaleReaderState>()(
		devtools(initializer, { name: "TaleReaderStore" }),
	);
}
