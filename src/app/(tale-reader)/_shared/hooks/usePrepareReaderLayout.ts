"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { useReaderStoreInstance } from "../contexts/ReaderStoreContext";
import { setResolvedAnchors } from "../services/formatTale";
import { compileReader, getCompiledBlockIds } from "../services/readerCompiler";
import {
	countReaderDiagnostic,
	logReaderDiagnostic,
} from "../services/readerDiagnostics";
import {
	measureBlocks,
	waitForReaderAssets,
} from "../services/readerMeasurement";
import type {
	ResolvedBlockSize,
	ResolvedTaleBlock,
	ViewportSize,
} from "../types";
import { usePrepareReaderLayoutState } from "./store/useReaderRuntimeSelectors";

function getMeasurementCacheKey(
	block: ResolvedTaleBlock,
	viewport: ViewportSize,
	revision: number,
) {
	return [
		block.id,
		revision,
		viewport.width,
		viewport.height,
		JSON.stringify(block.size),
	].join("|");
}

export function usePrepareReaderLayout(
	measurementRef: RefObject<HTMLDivElement | null>,
	viewport: ViewportSize,
) {
	const store = useReaderStoreInstance();
	const measurementCacheRef = useRef<Record<string, ResolvedBlockSize>>({});
	const {
		revision,
		selectedBranchIds,
		setCompiled,
		setMeasurementBlockIds,
		setPhase,
		setProgress,
		setReady,
		setStatus,
	} = usePrepareReaderLayoutState();

	useEffect(() => {
		void revision;
		let cancelled = false;
		const prepare = async () => {
			const currentState = store.getState();
			const tale = currentState.tale.data;
			if (!currentState.reader.compiled) setReady(false);
			setStatus("measuring");
			const blockIds = getCompiledBlockIds(tale, selectedBranchIds);
			countReaderDiagnostic("layout preparation started", {
				blockCount: blockIds.length,
				revision,
			});
			logReaderDiagnostic("layout preparation", {
				blockCount: blockIds.length,
				revision,
				selectedBranchIds,
				viewport,
			});
			const contentBlockIds = blockIds.filter(
				(blockId) => tale.indexMap.blocksById[blockId]?.size.mode === "content",
			);
			const manualBlockIds = blockIds.filter(
				(blockId) => tale.indexMap.blocksById[blockId]?.size.mode !== "content",
			);
			const missingContentBlockIds = contentBlockIds.filter((blockId) => {
				const block = tale.indexMap.blocksById[blockId];
				if (!block) return false;
				return !measurementCacheRef.current[
					getMeasurementCacheKey(block, viewport, revision)
				];
			});
			setMeasurementBlockIds(missingContentBlockIds);
			setPhase("preparing-structure");
			setProgress(38);
			await new Promise<void>((resolve) =>
				window.requestAnimationFrame(() => resolve()),
			);
			if (cancelled) return;

			if (missingContentBlockIds.length > 0) {
				setPhase("waiting-for-assets");
				setProgress(52);
				await waitForReaderAssets(measurementRef.current);
				if (cancelled) return;
			}

			setPhase("measuring-layout");
			setProgress(68);
			const sizes = measureBlocks(tale, manualBlockIds, viewport, null);
			if (missingContentBlockIds.length > 0) {
				const measuredContentSizes = measureBlocks(
					tale,
					missingContentBlockIds,
					viewport,
					measurementRef.current,
				);
				for (const blockId of missingContentBlockIds) {
					const block = tale.indexMap.blocksById[blockId];
					const size = measuredContentSizes[blockId];
					if (!block || !size) continue;
					measurementCacheRef.current[
						getMeasurementCacheKey(block, viewport, revision)
					] = size;
				}
			}
			for (const blockId of contentBlockIds) {
				const block = tale.indexMap.blocksById[blockId];
				if (!block) continue;
				const cachedSize =
					measurementCacheRef.current[
						getMeasurementCacheKey(block, viewport, revision)
					];
				if (cachedSize) sizes[blockId] = cachedSize;
			}
			if (cancelled) return;

			setMeasurementBlockIds([]);
			setPhase("compiling-reader");
			setProgress(82);
			setStatus("compiling");
			const compiled = compileReader(tale, selectedBranchIds, sizes, viewport);
			store.getState().tale.setData(setResolvedAnchors(tale, compiled.anchors));
			setCompiled(compiled);
			setPhase("restoring-progress");
			setProgress(94);
			logReaderDiagnostic("layout compiled", {
				anchors: compiled.anchors.length,
				segments: compiled.segments.length,
				totalScroll: compiled.totalScroll,
			});
		};

		void prepare();
		return () => {
			cancelled = true;
			setMeasurementBlockIds([]);
			logReaderDiagnostic("layout preparation cancelled or replaced", {
				revision,
			});
		};
	}, [
		measurementRef,
		revision,
		selectedBranchIds,
		setCompiled,
		setMeasurementBlockIds,
		setPhase,
		setProgress,
		setReady,
		setStatus,
		store,
		viewport,
	]);
}
