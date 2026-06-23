"use client";

import type { TaleInspectorTarget } from "~/app/(tale-app)/_shared/types";
import { createDerivedStoreHooks } from "~/stores/createDerivedStoreHooks";
import { useTaleEditorStoreInstance } from "../contexts/TaleEditorStoreContext";
import {
	type TaleEditorDerivedState,
	type TaleEditorState,
	createTaleEditorDerivedState,
} from "../store/taleEditorStore";

const taleEditorStoreHooks = createDerivedStoreHooks<
	TaleEditorState,
	TaleEditorDerivedState
>(useTaleEditorStoreInstance, createTaleEditorDerivedState);

/**
 * Selects canonical or lazy derived state from the tale editor store.
 *
 * @param selector - Selector receiving editor state and derivations.
 * @returns Selected editor value.
 *
 * @example
 * const hasSelection = useTaleEditorStore((state) => state.derived.hasGraphSelection);
 */
export const useTaleEditorStore = taleEditorStoreHooks.useStore;

/**
 * Selects a shallow-equal object from the editor-specific tale store.
 *
 * @param selector - Selector returning an object or tuple.
 * @returns Stable shallow-equal editor selection.
 *
 * @example
 * const { rightPanelOpen, previewWidth } = useTaleEditorStoreShallow((state) => state.editorWorkspace);
 */
export const useTaleEditorStoreShallow = taleEditorStoreHooks.useStoreShallow;

type TaleEditorOverlayState = {
	closeInspector: TaleEditorState["editor"]["closeInspector"];
	closeSecondaryInspector: TaleEditorState["editor"]["closeSecondaryInspector"];
	inspector: TaleInspectorTarget | null;
	secondaryInspector: TaleInspectorTarget | null;
};

/**
 * Selects state required by the editor overlay.
 *
 * @returns Stable editor overlay state.
 *
 * @example
 * const { inspector, mode } = useTaleEditorOverlayState();
 */
export function useTaleEditorOverlayState(): TaleEditorOverlayState {
	return useTaleEditorStoreShallow((state) => ({
		closeInspector: state.editor.closeInspector,
		closeSecondaryInspector: state.editor.closeSecondaryInspector,
		inspector: state.editor.inspector,
		secondaryInspector: state.editor.secondaryInspector,
	}));
}
