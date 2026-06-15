"use client";

import { useReaderStoreShallow } from "../../contexts/ReaderStoreContext";
import type { TaleReaderState } from "../../store/createReaderStore";
import type { ReaderInspectorTarget, ReaderMode, Tale } from "../../types";

type ReaderEditorOverlayState = {
	closeInspector: TaleReaderState["editor"]["closeInspector"];
	closeSecondaryInspector: TaleReaderState["editor"]["closeSecondaryInspector"];
	inspector: ReaderInspectorTarget | null;
	mode: ReaderMode;
	secondaryInspector: ReaderInspectorTarget | null;
};

/**
 * Selects state required by the editor overlay.
 *
 * @returns Stable editor overlay state.
 *
 * @example
 * const { inspector, mode } = useReaderEditorOverlayState();
 */
export function useReaderEditorOverlayState(): ReaderEditorOverlayState {
	return useReaderStoreShallow((state) => ({
		closeInspector: state.editor.closeInspector,
		closeSecondaryInspector: state.editor.closeSecondaryInspector,
		inspector: state.editor.inspector,
		mode: state.editor.mode,
		secondaryInspector: state.editor.secondaryInspector,
	}));
}

type InspectorButtonState = {
	inspectorControlsOpen: boolean;
	mode: ReaderMode;
	openInspector: TaleReaderState["editor"]["openInspector"];
	openSecondaryInspector: TaleReaderState["editor"]["openSecondaryInspector"];
};

/**
 * Selects editor state required by inline inspector buttons.
 *
 * @returns Stable inspector button state.
 *
 * @example
 * const { mode, openInspector } = useInspectorButtonState();
 */
export function useInspectorButtonState(): InspectorButtonState {
	return useReaderStoreShallow((state) => ({
		inspectorControlsOpen: state.editor.inspectorControlsOpen,
		mode: state.editor.mode,
		openInspector: state.editor.openInspector,
		openSecondaryInspector: state.editor.openSecondaryInspector,
	}));
}

type InspectorEditingState = {
	requestRecompile: TaleReaderState["engine"]["requestRecompile"];
	scrollApi: TaleReaderState["scroll"]["api"];
	setData: TaleReaderState["tale"]["setData"];
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
	return useReaderStoreShallow((state) => ({
		requestRecompile: state.engine.requestRecompile,
		scrollApi: state.scroll.api,
		setData: state.tale.setData,
		tale: state.tale.data,
	}));
}
