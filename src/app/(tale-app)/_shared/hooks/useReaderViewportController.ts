"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReaderViewportState } from "./store/useReaderRuntimeSelectors";
import { useChooseReaderPath } from "./useChooseReaderPath";
import { usePrepareReaderLayout } from "./usePrepareReaderLayout";
import { useReaderHubLayout } from "./useReaderHubLayout";
import { useReaderScrollEngine } from "./useReaderScrollEngine";
import { useViewportSize } from "./useViewportSize";

type ReaderViewportControllerOptions = {
	embedded?: boolean;
	viewportRoot: HTMLElement | null;
};

/**
 * Orchestrates reader viewport refs, layout preparation, and scroll engine setup.
 *
 * @param options - Viewport controller options.
 * @param options.embedded - Whether the reader runs inside an editor scroll pane.
 * @param options.viewportRoot - Optional embedded scroll root.
 * @returns Reader viewport render dependencies and callbacks.
 *
 * @example
 * const controller = useReaderViewportController({ embedded: true, viewportRoot });
 */
export function useReaderViewportController({
	embedded = false,
	viewportRoot,
}: ReaderViewportControllerOptions) {
	const state = useReaderViewportState();
	const hubLayout = useReaderHubLayout();
	const hubDocked = !embedded && state.hubOpen && hubLayout === "desktop";
	const viewport = useViewportSize({
		maximumRightInsetPx: hubDocked ? 448 : 0,
		rightInsetRatio: hubDocked ? 0.42 : 0,
		root: embedded ? viewportRoot : null,
	});
	const measurementRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const choosePath = useChooseReaderPath();

	usePrepareReaderLayout(measurementRef, viewport);

	const finishRestoring = useCallback(() => {
		state.setProgress(97);
		state.setPhase("preparing-motion");
	}, [state.setPhase, state.setProgress]);

	useReaderScrollEngine({
		compiled: state.compiled,
		onReady: finishRestoring,
		requireScrollRoot: embedded,
		scrollRoot: embedded ? viewportRoot : null,
		stageRef,
		viewport,
	});

	useEffect(() => {
		if (embedded) return;
		document.documentElement.classList.add("scrollbar-none");
		document.body.classList.add("scrollbar-none");
		return () => {
			document.documentElement.classList.remove("scrollbar-none");
			document.body.classList.remove("scrollbar-none");
		};
	}, [embedded]);

	return {
		choosePath,
		compiled: state.compiled,
		hubDocked,
		measurementBlockIds: state.measurementBlockIds,
		measurementRef,
		stageRef,
		tale: state.tale,
		viewport,
	};
}
