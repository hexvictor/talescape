import type {
	TaleStoreExtensionCreator,
	TaleReaderState,
} from "~/app/(tale-app)/_shared/store/createTaleStore";
import {
	type EditorGraphSlice,
	createEditorGraphSlice,
} from "./slices/editorGraphSlice";
import { type EditorSlice, createEditorSlice } from "./slices/editorSlice";
import {
	type EditorWorkspaceSlice,
	createEditorWorkspaceSlice,
} from "./slices/editorWorkspaceSlice";

export type TaleEditorState = TaleReaderState &
	EditorSlice &
	EditorGraphSlice &
	EditorWorkspaceSlice;

/**
 * Creates the slices that exist only in the tale editor store.
 *
 * @param set - Zustand state setter.
 * @param get - Zustand state getter.
 * @param api - Zustand store API.
 * @returns Editor, graph, and workspace state.
 *
 * @example
 * <TaleStoreProvider createExtension={createTaleEditorStoreExtension} />
 */
export const createTaleEditorStoreExtension: TaleStoreExtensionCreator<
	TaleEditorState
> = (set, get, api) => ({
	...createEditorSlice(set, get, api),
	...createEditorGraphSlice(set, get, api),
	...createEditorWorkspaceSlice(set, get, api),
});
