"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { useTaleStoreInstance } from "../contexts/TaleStoreContext";
import { createReaderScrollEngine } from "../scroll-engine/createReaderScrollEngine";
import { createReaderScrollDriver } from "../scroll-engine/scrollDriver";
import { logReaderDiagnostic } from "../services/readerDiagnostics";
import type { CompiledReader, ViewportSize } from "../types";

export function useReaderScrollEngine({
	compiled,
	onReady,
	requireScrollRoot = false,
	scrollRoot,
	stageRef,
	viewport,
}: {
	compiled: CompiledReader | null;
	onReady: () => void;
	requireScrollRoot?: boolean;
	scrollRoot?: HTMLElement | null;
	stageRef: RefObject<HTMLDivElement | null>;
	viewport: ViewportSize;
}) {
	const store = useTaleStoreInstance();

	useEffect(() => {
		const stage = stageRef.current;
		if (requireScrollRoot && !scrollRoot) return;
		if (!compiled || !stage) return;
		logReaderDiagnostic("useReaderScrollEngine setup", {
			anchors: compiled.anchors.length,
			segments: compiled.segments.length,
			totalScroll: compiled.totalScroll,
			viewport,
		});
		const driver = createReaderScrollDriver({ scrollRoot });
		const cleanup = createReaderScrollEngine({
			compiled,
			driver,
			onReady,
			progress: store.getState().progress.data,
			scrollRoot,
			stage,
			store,
			viewport,
		});
		return () => {
			logReaderDiagnostic("useReaderScrollEngine cleanup", {
				anchors: compiled.anchors.length,
				totalScroll: compiled.totalScroll,
			});
			cleanup();
		};
	}, [
		compiled,
		onReady,
		requireScrollRoot,
		scrollRoot,
		stageRef,
		store,
		viewport,
	]);
}
