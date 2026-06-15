"use client";

import { useReaderStoreShallow } from "../../contexts/ReaderStoreContext";
import type { TaleReaderState } from "../../store/createReaderStore";
import type { CompiledReader, LayoutPhase } from "../../types";

type TaleDebugState = {
	activeSegmentIndex: number;
	compiled: CompiledReader | null;
	inspectorControlsOpen: boolean;
	mode: TaleReaderState["editor"]["mode"];
	open: boolean;
	openInspector: TaleReaderState["editor"]["openInspector"];
	phase: LayoutPhase;
	seenBlocks: number;
	taleTitle: string | undefined;
	toggleDebug: TaleReaderState["debug"]["toggleOpen"];
	toggleInspectorControls: TaleReaderState["editor"]["toggleInspectorControls"];
};

/**
 * Selects summary-level state required by the debug shell.
 *
 * @returns Stable debug shell state.
 *
 * @example
 * const { open, phase } = useTaleDebugState();
 */
export function useTaleDebugState(): TaleDebugState {
	return useReaderStoreShallow((state) => ({
		activeSegmentIndex: state.debug.activeSegmentIndex,
		compiled: state.reader.compiled,
		inspectorControlsOpen: state.editor.inspectorControlsOpen,
		mode: state.editor.mode,
		open: state.debug.open,
		openInspector: state.editor.openInspector,
		phase: state.engine.phase,
		seenBlocks: state.progress.data.seenBlockIds.length,
		taleTitle: state.tale.data.title,
		toggleDebug: state.debug.toggleOpen,
		toggleInspectorControls: state.editor.toggleInspectorControls,
	}));
}
