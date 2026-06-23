import { devtools } from "zustand/middleware";
import { type StoreApi, createStore } from "zustand/vanilla";
import {
	type EditorGraphSlice,
	createEditorGraphSlice,
} from "./slices/editorGraphSlice";
import { type EditorSlice, createEditorSlice } from "./slices/editorSlice";
import {
	type EditorWorkspaceSlice,
	createEditorWorkspaceSlice,
} from "./slices/editorWorkspaceSlice";

export type TaleEditorState = EditorSlice &
	EditorGraphSlice &
	EditorWorkspaceSlice;

export type TaleEditorDerivedState = {
	readonly hasGraphSelection: boolean;
	readonly usesGraphFocus: boolean;
};

/**
 * Creates independent editor selection, graph, and pane-layout state.
 *
 * @returns Editor store independent from document and reader stores.
 *
 * @example
 * const store = createTaleEditorStore();
 */
export function createTaleEditorStore(): StoreApi<TaleEditorState> {
	return createStore<TaleEditorState>()(
		devtools(
			(set, get, api) => ({
				...createEditorSlice(set, get, api),
				...createEditorGraphSlice(set, get, api),
				...createEditorWorkspaceSlice(set, get, api),
			}),
			{
				enabled:
					process.env.NODE_ENV === "development" &&
					process.env.NEXT_PUBLIC_READER_STORE_DEVTOOLS === "true",
				name: "TaleEditorStore",
			},
		),
	);
}

/**
 * Creates lazy editor derivations for one state snapshot.
 *
 * @param state - Current editor state.
 * @returns Read-only editor values derived from canonical state.
 *
 * @example
 * const derived = createTaleEditorDerivedState(store.getState());
 */
export function createTaleEditorDerivedState(
	state: TaleEditorState,
): TaleEditorDerivedState {
	return {
		get hasGraphSelection() {
			return Boolean(
				state.editor.selectedBlockId ||
					state.editor.selectedBranchId ||
					state.editorGraph.selectedPathId,
			);
		},
		get usesGraphFocus() {
			return state.editorGraph.focusMode !== "off";
		},
	};
}
