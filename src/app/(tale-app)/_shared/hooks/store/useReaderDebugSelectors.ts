"use client";

import type { TaleReaderState } from "../../../(reader)/_shared/stores/createTaleReaderStore";
import { useTaleAppStore } from "../../contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "../../contexts/TaleReaderStoreContext";
import type { CompiledReader, LayoutPhase } from "../../types";

type TaleDebugState = {
	activeSegmentIndex: number;
	compiled: CompiledReader | null;
	open: boolean;
	phase: LayoutPhase;
	seenBlocks: number;
	taleTitle: string | undefined;
	toggleDebug: TaleReaderState["debug"]["toggleOpen"];
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
	const taleTitle = useTaleAppStore((state) => state.document.tale.title);
	const reader = useTaleReaderStoreShallow((state) => ({
		activeSegmentIndex: state.debug.activeSegmentIndex,
		compiled: state.reader.compiled,
		open: state.debug.open,
		phase: state.engine.phase,
		seenBlocks: state.progress.data.seenSceneIds.length,
		toggleDebug: state.debug.toggleOpen,
	}));
	return {
		...reader,
		taleTitle,
	};
}
