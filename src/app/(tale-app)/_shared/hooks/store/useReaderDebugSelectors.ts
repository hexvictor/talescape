"use client";

import { useTaleStoreShallow } from "../../contexts/TaleStoreContext";
import { useTaleEditorBridge } from "../../contexts/TaleEditorBridgeContext";
import type { TaleReaderState } from "../../store/createTaleStore";
import type { CompiledReader, LayoutPhase } from "../../types";

type TaleDebugState = {
	activeSegmentIndex: number;
	compiled: CompiledReader | null;
	inspectorControlsOpen: boolean;
	mode: "edit" | "read";
	open: boolean;
	openInspector: ReturnType<typeof useTaleEditorBridge>["openInspector"];
	phase: LayoutPhase;
	seenBlocks: number;
	taleTitle: string | undefined;
	toggleDebug: TaleReaderState["debug"]["toggleOpen"];
	toggleInspectorControls: ReturnType<
		typeof useTaleEditorBridge
	>["toggleInspectorControls"];
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
	const editor = useTaleEditorBridge();
	const reader = useTaleStoreShallow((state) => ({
		activeSegmentIndex: state.debug.activeSegmentIndex,
		compiled: state.reader.compiled,
		open: state.debug.open,
		phase: state.engine.phase,
		seenBlocks: state.progress.data.seenBlockIds.length,
		taleTitle: state.tale.data.title,
		toggleDebug: state.debug.toggleOpen,
	}));
	return {
		...reader,
		inspectorControlsOpen: editor.inspectorControlsOpen,
		mode: editor.enabled ? "edit" : "read",
		openInspector: editor.openInspector,
		toggleInspectorControls: editor.toggleInspectorControls,
	};
}
