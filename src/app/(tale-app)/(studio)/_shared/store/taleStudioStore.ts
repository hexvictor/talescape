import { devtools } from "zustand/middleware";
import { type StoreApi, createStore } from "zustand/vanilla";
import {
	type EditorGraphSlice,
	createEditorGraphSlice,
} from "./slices/editorGraphSlice";
import {
	type EditorLayoutSlice,
	createEditorLayoutSlice,
} from "./slices/editorLayoutSlice";
import {
	type StudioSelectionSlice,
	createStudioSelectionSlice,
} from "./slices/studioSelectionSlice";

export type TaleStudioState = StudioSelectionSlice &
	EditorGraphSlice &
	EditorLayoutSlice;

export type TaleStudioDerivedState = {
	readonly hasGraphSelection: boolean;
	readonly usesGraphFocus: boolean;
};

/**
 * Creates independent Tale Studio selection, graph, and editor layout state.
 *
 * @returns Studio store independent from document and reader stores.
 *
 * @example
 * const store = createTaleStudioStore();
 */
export function createTaleStudioStore(): StoreApi<TaleStudioState> {
	return createStore<TaleStudioState>()(
		devtools(
			(set, get, api) => ({
				...createStudioSelectionSlice(set, get, api),
				...createEditorGraphSlice(set, get, api),
				...createEditorLayoutSlice(set, get, api),
			}),
			{
				name: "TaleStudioStore",
			},
		),
	);
}

/**
 * Creates lazy Tale Studio derivations for one state snapshot.
 *
 * @param state - Current Tale Studio state.
 * @returns Read-only Studio values derived from canonical state.
 *
 * @example
 * const derived = createTaleStudioDerivedState(store.getState());
 */
export function createTaleStudioDerivedState(
	state: TaleStudioState,
): TaleStudioDerivedState {
	return {
		get hasGraphSelection() {
			return Boolean(
				state.studioSelection.selectedBlockId ||
					state.studioSelection.selectedBranchId ||
					state.editorGraph.selectedPathId,
			);
		},
		get usesGraphFocus() {
			return state.editorGraph.focusMode !== "off";
		},
	};
}
