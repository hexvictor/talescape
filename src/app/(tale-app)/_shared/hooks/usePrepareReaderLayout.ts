"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import {
	useTaleReaderStoreInstance,
	useTaleReaderStoreShallow,
} from "../contexts/TaleReaderStoreContext";
import { compileReader, getCompiledSceneIds } from "../services/readerCompiler";
import {
	countReaderDiagnostic,
	logReaderDiagnostic,
} from "../services/readerDiagnostics";
import {
	measureBlocks,
	measureFrames,
	waitForReaderAssets,
} from "../services/readerMeasurement";
import { getTaleScenes } from "../services/taleLookups";
import type {
	CompiledReader,
	ResolvedSceneSize,
	ResolvedTaleScene,
	Tale,
	ViewportSize,
} from "../types";

function getMeasurementCacheKey(
	block: ResolvedTaleScene,
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
	layoutVariantKey: string,
	viewport: ViewportSize,
	revision: number,
	selectedBranchIds: string[],
	snapModeOverride: string,
): string {
	return [
		layoutVariantKey,
		revision,
		viewport.width,
		viewport.height,
		selectedBranchIds.join(">"),
		snapModeOverride,
	].join("|");
}

export function usePrepareReaderLayout(
	measurementRef: RefObject<HTMLDivElement | null>,
	tale: Tale,
	layoutVariantKey: string,
	viewport: ViewportSize,
) {
	const store = useTaleReaderStoreInstance();
	const measurementCacheRef = useRef<Record<string, ResolvedSceneSize>>({});
	const frameMeasurementCacheRef = useRef<Record<string, ResolvedSceneSize>>(
		{},
	);
	const compiledCacheRef = useRef<Record<string, CompiledReader>>({});
	const {
		revision,
		selectedBranchIds,
		setCompiled,
		setMeasurementSceneIds,
		setPhase,
		setProgress,
		setReady,
		setStatus,
		snapModeOverride,
	} = useTaleReaderStoreShallow((state) => ({
		snapModeOverride: state.inputSettings.snapModeOverride,
		revision: state.engine.revision,
		selectedBranchIds: state.navigation.selectedBranchIds,
		setCompiled: state.reader.setCompiled,
		setMeasurementSceneIds: state.reader.setMeasurementSceneIds,
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
			const resolvedTale = tale;
			if (!currentState.reader.compiled) setReady(false);
			setStatus("measuring");
			const routeSceneIds = getCompiledSceneIds(
				resolvedTale,
				selectedBranchIds,
			);
			const allSceneIds = getTaleScenes(resolvedTale).map((block) => block.id);
			countReaderDiagnostic("layout preparation started", {
				sceneCount: routeSceneIds.length,
				revision,
			});
			logReaderDiagnostic("layout preparation", {
				sceneCount: routeSceneIds.length,
				revision,
				selectedBranchIds,
				viewport,
			});
			const contentSceneIds = allSceneIds.filter(
				(sceneId) =>
					resolvedTale.indexMap.scenesById[sceneId]?.size.mode === "content",
			);
			const manualSceneIds = allSceneIds.filter(
				(sceneId) =>
					resolvedTale.indexMap.scenesById[sceneId]?.size.mode !== "content",
			);
			const missingContentSceneIds = contentSceneIds.filter((sceneId) => {
				const block = resolvedTale.indexMap.scenesById[sceneId];
				if (!block) return false;
				return !measurementCacheRef.current[
					getMeasurementCacheKey(block, viewport, revision)
				];
			});
			// Explicit-size Scenes do not need an intrinsic Scene measurement, but
			// their Frames still do when a Frame derives its active span from its
			// own content. Previously those Frames fell back to Scene travel.
			const frameMeasurementSceneIds = allSceneIds.filter((sceneId) => {
				const scene = resolvedTale.indexMap.scenesById[sceneId];
				return Boolean(
					scene?.frameIds.some(
						(frameId) =>
							resolvedTale.indexMap.framesById[frameId]?.progression?.mode ===
							"content",
					),
				);
			});
			const measurementSceneIds = [
				...new Set([...missingContentSceneIds, ...frameMeasurementSceneIds]),
			];
			setMeasurementSceneIds(measurementSceneIds);
			setPhase("preparing-structure");
			setProgress(38);
			await new Promise<void>((resolve) =>
				window.requestAnimationFrame(() => resolve()),
			);
			if (cancelled) return;

			if (measurementSceneIds.length > 0) {
				setPhase("waiting-for-assets");
				setProgress(52);
				await waitForReaderAssets(measurementRef.current);
				if (cancelled) return;
			}
			const measuredFrameSizes = measureFrames(measurementRef.current);
			Object.assign(frameMeasurementCacheRef.current, measuredFrameSizes);

			setPhase("measuring-layout");
			setProgress(68);
			const sizes = measureBlocks(resolvedTale, manualSceneIds, viewport, null);
			if (missingContentSceneIds.length > 0) {
				const measuredContentSizes = measureBlocks(
					resolvedTale,
					missingContentSceneIds,
					viewport,
					measurementRef.current,
				);
				for (const sceneId of missingContentSceneIds) {
					const block = resolvedTale.indexMap.scenesById[sceneId];
					const size = measuredContentSizes[sceneId];
					if (!block || !size) continue;
					measurementCacheRef.current[
						getMeasurementCacheKey(block, viewport, revision)
					] = size;
				}
			}
			for (const sceneId of contentSceneIds) {
				const block = resolvedTale.indexMap.scenesById[sceneId];
				if (!block) continue;
				const cachedSize =
					measurementCacheRef.current[
						getMeasurementCacheKey(block, viewport, revision)
					];
				if (cachedSize) sizes[sceneId] = cachedSize;
			}
			if (cancelled) return;

			setMeasurementSceneIds([]);
			setPhase("compiling-reader");
			setProgress(82);
			setStatus("compiling");
			const compiledCacheKey = getCompiledRouteCacheKey(
				layoutVariantKey,
				viewport,
				revision,
				selectedBranchIds,
				snapModeOverride,
			);
			const compiled =
				compiledCacheRef.current[compiledCacheKey] ??
				compileReader(
					resolvedTale,
					selectedBranchIds,
					sizes,
					viewport,
					snapModeOverride === "default" ? null : snapModeOverride,
					frameMeasurementCacheRef.current,
				);
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
			setMeasurementSceneIds([]);
			logReaderDiagnostic("layout preparation cancelled or replaced", {
				revision,
			});
		};
	}, [
		measurementRef,
		revision,
		selectedBranchIds,
		setCompiled,
		setMeasurementSceneIds,
		setPhase,
		setProgress,
		setReady,
		setStatus,
		snapModeOverride,
		store,
		tale,
		layoutVariantKey,
		viewport,
	]);
}
