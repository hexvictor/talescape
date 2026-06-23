"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { useTaleReaderStoreInstance } from "../contexts/TaleReaderStoreContext";
import { useTaleReaderStoreShallow } from "../contexts/TaleReaderStoreContext";
import { useTaleAppStoreInstance } from "../contexts/TaleAppStoreContext";
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
	CompiledReader,
	ResolvedBlockSize,
	ResolvedTaleBlock,
	ViewportSize,
} from "../types";

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

/**
 * Creates a stable key for one compiled route layout.
 *
 * @param viewport - Effective reader viewport dimensions.
 * @param revision - Tale edit revision.
 * @param selectedBranchIds - Currently chosen branch ids.
 * @returns Route compilation cache key.
 *
 * @example
 * const key = getCompiledRouteCacheKey(viewport, revision, ["branch-1"]);
 */
function getCompiledRouteCacheKey(
	viewport: ViewportSize,
	revision: number,
	selectedBranchIds: string[],
): string {
	return [
		revision,
		viewport.width,
		viewport.height,
		selectedBranchIds.join(">"),
	].join("|");
}

export function usePrepareReaderLayout(
	measurementRef: RefObject<HTMLDivElement | null>,
	viewport: ViewportSize,
) {
	const store = useTaleReaderStoreInstance();
	const documentStore = useTaleAppStoreInstance();
	const measurementCacheRef = useRef<Record<string, ResolvedBlockSize>>({});
	const compiledCacheRef = useRef<Record<string, CompiledReader>>({});
	const {
		revision,
		selectedBranchIds,
		setCompiled,
		setMeasurementBlockIds,
		setPhase,
		setProgress,
		setReady,
		setStatus,
	} = useTaleReaderStoreShallow((state) => ({
		revision: state.engine.revision,
		selectedBranchIds: state.navigation.selectedBranchIds,
		setCompiled: state.reader.setCompiled,
		setMeasurementBlockIds: state.reader.setMeasurementBlockIds,
		setPhase: state.engine.setPhase,
		setProgress: state.engine.setProgress,
		setReady: state.engine.setReady,
		setStatus: state.engine.setStatus,
	}));

	useEffect(() => {
		void revision;
		let cancelled = false;
		const prepare = async () => {
			const currentState = store.getState();
			const tale = documentStore.getState().document.tale;
			if (!currentState.reader.compiled) setReady(false);
			setStatus("measuring");
			const routeBlockIds = getCompiledBlockIds(tale, selectedBranchIds);
			const allBlockIds = tale.structure.blocks.map((block) => block.id);
			countReaderDiagnostic("layout preparation started", {
				blockCount: routeBlockIds.length,
				revision,
			});
			logReaderDiagnostic("layout preparation", {
				blockCount: routeBlockIds.length,
				revision,
				selectedBranchIds,
				viewport,
			});
			const contentBlockIds = allBlockIds.filter(
				(blockId) => tale.indexMap.blocksById[blockId]?.size.mode === "content",
			);
			const manualBlockIds = allBlockIds.filter(
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
			const compiledCacheKey = getCompiledRouteCacheKey(
				viewport,
				revision,
				selectedBranchIds,
			);
			const compiled =
				compiledCacheRef.current[compiledCacheKey] ??
				compileReader(tale, selectedBranchIds, sizes, viewport);
			compiledCacheRef.current[compiledCacheKey] = compiled;
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
		documentStore,
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
