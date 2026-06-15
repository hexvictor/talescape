"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReaderViewportState } from "./store/useReaderRuntimeSelectors";
import { useChooseReaderPath } from "./useChooseReaderPath";
import { usePrepareReaderLayout } from "./usePrepareReaderLayout";
import { useReaderHubLayout } from "./useReaderHubLayout";
import { useReaderScrollEngine } from "./useReaderScrollEngine";
import { useViewportSize } from "./useViewportSize";

export function useReaderViewportController() {
	const state = useReaderViewportState();
	const hubLayout = useReaderHubLayout();
	const hubDocked = state.hubOpen && hubLayout === "desktop";
	const viewport = useViewportSize({
		maximumRightInsetPx: hubDocked ? 448 : 0,
		rightInsetRatio: hubDocked ? 0.42 : 0,
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
		stageRef,
		viewport,
	});

	useEffect(() => {
		document.documentElement.classList.add("scrollbar-none");
		document.body.classList.add("scrollbar-none");
		return () => {
			document.documentElement.classList.remove("scrollbar-none");
			document.body.classList.remove("scrollbar-none");
		};
	}, []);

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
