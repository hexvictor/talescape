"use client";

import { useReaderStoreShallow } from "../../contexts/ReaderStoreContext";
import type { TaleReaderState } from "../../store/createReaderStore";
import type { ReaderUiVisibilityMode } from "../../store/slices/uiSlice";
import type { CompiledReader, Direction, LayoutPhase, Tale } from "../../types";

type ReaderViewportState = {
	compiled: CompiledReader | null;
	measurementBlockIds: string[];
	setPhase: TaleReaderState["engine"]["setPhase"];
	setProgress: TaleReaderState["engine"]["setProgress"];
	tale: Tale;
};

/**
 * Selects the runtime values consumed by the reader viewport.
 *
 * @returns Stable viewport runtime state.
 *
 * @example
 * const { compiled, tale } = useReaderViewportState();
 */
export function useReaderViewportState(): ReaderViewportState {
	return useReaderStoreShallow((state) => ({
		compiled: state.reader.compiled,
		measurementBlockIds: state.reader.measurementBlockIds,
		setPhase: state.engine.setPhase,
		setProgress: state.engine.setProgress,
		tale: state.tale.data,
	}));
}

type ReaderOverlayState = {
	scrollCue: Direction | null;
	setVisibilityMode: (mode: ReaderUiVisibilityMode) => void;
	toggleReaderUi: TaleReaderState["ui"]["toggleReaderUi"];
	visibilityMode: ReaderUiVisibilityMode;
};

/**
 * Selects reader overlay visibility and controls.
 *
 * @returns Stable reader overlay state.
 *
 * @example
 * const { visible } = useReaderOverlayState();
 */
export function useReaderOverlayState(): ReaderOverlayState {
	return useReaderStoreShallow((state) => ({
		scrollCue: state.scroll.cue,
		setVisibilityMode: state.ui.setVisibilityMode,
		toggleReaderUi: state.ui.toggleReaderUi,
		visibilityMode: state.ui.visibilityMode,
	}));
}

type ReaderStageState = {
	renderedBlockIds: string[];
	renderRevision: number;
	scrollApi: TaleReaderState["scroll"]["api"];
};

/**
 * Selects mounted-block state used by the reader stage.
 *
 * @returns Stable reader stage state.
 *
 * @example
 * const { renderedBlockIds } = useReaderStageState();
 */
export function useReaderStageState(): ReaderStageState {
	return useReaderStoreShallow((state) => ({
		renderedBlockIds: state.scroll.renderedBlockIds,
		renderRevision: state.scroll.renderRevision,
		scrollApi: state.scroll.api,
	}));
}

type ReaderLoadingState = {
	phase: LayoutPhase;
	ready: boolean;
	setPhase: TaleReaderState["engine"]["setPhase"];
	setReady: TaleReaderState["engine"]["setReady"];
	setStatus: TaleReaderState["engine"]["setStatus"];
	targetProgress: number;
	title: string | undefined;
};

/**
 * Selects state used by the reader loading overlay.
 *
 * @returns Stable reader loading state.
 *
 * @example
 * const { phase, targetProgress } = useReaderLoadingState();
 */
export function useReaderLoadingState(): ReaderLoadingState {
	return useReaderStoreShallow((state) => ({
		phase: state.engine.phase,
		ready: state.engine.ready,
		setPhase: state.engine.setPhase,
		setReady: state.engine.setReady,
		setStatus: state.engine.setStatus,
		targetProgress: state.engine.progress,
		title: state.tale.data.title,
	}));
}

type ReaderMotionReadinessState = {
	phase: LayoutPhase;
	setProgress: TaleReaderState["engine"]["setProgress"];
};

/**
 * Selects state used by the Motion readiness probe.
 *
 * @returns Stable Motion readiness state.
 *
 * @example
 * const { phase } = useReaderMotionReadinessState();
 */
export function useReaderMotionReadinessState(): ReaderMotionReadinessState {
	return useReaderStoreShallow((state) => ({
		phase: state.engine.phase,
		setProgress: state.engine.setProgress,
	}));
}

type PrepareReaderLayoutState = {
	revision: number;
	selectedBranchIds: string[];
	setCompiled: TaleReaderState["reader"]["setCompiled"];
	setMeasurementBlockIds: TaleReaderState["reader"]["setMeasurementBlockIds"];
	setPhase: TaleReaderState["engine"]["setPhase"];
	setProgress: TaleReaderState["engine"]["setProgress"];
	setReady: TaleReaderState["engine"]["setReady"];
	setStatus: TaleReaderState["engine"]["setStatus"];
};

/**
 * Selects state and actions used during reader layout preparation.
 *
 * @returns Stable layout preparation state.
 *
 * @example
 * const { revision, setCompiled } = usePrepareReaderLayoutState();
 */
export function usePrepareReaderLayoutState(): PrepareReaderLayoutState {
	return useReaderStoreShallow((state) => ({
		revision: state.engine.revision,
		selectedBranchIds: state.navigation.selectedBranchIds,
		setCompiled: state.reader.setCompiled,
		setMeasurementBlockIds: state.reader.setMeasurementBlockIds,
		setPhase: state.engine.setPhase,
		setProgress: state.engine.setProgress,
		setReady: state.engine.setReady,
		setStatus: state.engine.setStatus,
	}));
}
