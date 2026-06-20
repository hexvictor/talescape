"use client";

import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
import { useShallow } from "zustand/react/shallow";
import { useTaleStoreInstance } from "~/app/(tale-app)/_shared/contexts/TaleStoreContext";
import type { TaleInspectorTarget, Tale } from "~/app/(tale-app)/_shared/types";
import type { TaleEditorState } from "../store/taleEditorStore";

/**
 * Selects one value from the editor-specific tale store.
 *
 * @param selector - Selector receiving the complete editor state.
 * @returns Selected editor store value.
 *
 * @example
 * const previewOpen = useTaleEditorStore((state) => state.editorWorkspace.previewOpen);
 */
export function useTaleEditorStore<T>(
	selector: (state: TaleEditorState) => T,
): T {
	const store = useTaleStoreInstance() as unknown as StoreApi<TaleEditorState>;
	return useStore(store, selector);
}

/**
 * Selects a shallow-equal object from the editor-specific tale store.
 *
 * @param selector - Selector returning an object or tuple.
 * @returns Stable shallow-equal editor selection.
 *
 * @example
 * const { previewOpen, surface } = useTaleEditorStoreShallow((state) => state.editorWorkspace);
 */
export function useTaleEditorStoreShallow<T>(
	selector: (state: TaleEditorState) => T,
): T {
	return useTaleEditorStore(useShallow(selector));
}

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

type InspectorEditingState = {
	requestRecompile: TaleEditorState["engine"]["requestRecompile"];
	scrollApi: TaleEditorState["scroll"]["api"];
	setData: TaleEditorState["tale"]["setData"];
	tale: Tale;
};

/**
 * Selects shared state required by block and fragment inspectors.
 *
 * @returns Stable inspector editing state.
 *
 * @example
 * const { tale, setData } = useInspectorEditingState();
 */
export function useInspectorEditingState(): InspectorEditingState {
	return useTaleEditorStoreShallow((state) => ({
		requestRecompile: state.engine.requestRecompile,
		scrollApi: state.scroll.api,
		setData: state.tale.setData,
		tale: state.tale.data,
	}));
}
