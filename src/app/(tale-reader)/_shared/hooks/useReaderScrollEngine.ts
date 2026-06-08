"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { useReaderStoreInstance } from "../contexts/ReaderStoreContext";
import { createReaderScrollEngine } from "../scroll-engine/createReaderScrollEngine";
import { createReaderScrollDriver } from "../scroll-engine/scrollDriver";
import { logReaderDiagnostic } from "../services/readerDiagnostics";
import type { CompiledReader, ViewportSize } from "../types";

export function useReaderScrollEngine({
	compiled,
	onReady,
	stageRef,
	viewport,
}: {
	compiled: CompiledReader | null;
	onReady: () => void;
	stageRef: RefObject<HTMLDivElement | null>;
	viewport: ViewportSize;
}) {
	const store = useReaderStoreInstance();

	useEffect(() => {
		const stage = stageRef.current;
		if (!compiled || !stage) return;
		logReaderDiagnostic("useReaderScrollEngine setup", {
			anchors: compiled.anchors.length,
			segments: compiled.segments.length,
			totalScroll: compiled.totalScroll,
			viewport,
		});
		const driver = createReaderScrollDriver();
		const cleanup = createReaderScrollEngine({
			compiled,
			driver,
			onReady,
			progress: store.getState().progress.data,
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
	}, [compiled, onReady, stageRef, store, viewport]);
}
