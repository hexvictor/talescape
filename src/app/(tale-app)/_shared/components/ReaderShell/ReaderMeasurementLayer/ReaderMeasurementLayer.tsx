"use client";

import type { CSSProperties, RefObject } from "react";
import type { Anchor, SceneSize, Tale, ViewportSize } from "../../../types";
import { ReaderSceneContent } from "../ReaderScene/ReaderSceneContent";

/**
 * Renders content-sized scenes offscreen using the same content structure as
 * the live reader.
 *
 * @param props - Measurement layer properties.
 * @param props.sceneIds - Scene ids requiring intrinsic measurement.
 * @param props.rootRef - Ref consumed by the measurement service.
 * @param props.tale - Formatted tale data.
 * @param props.viewport - Effective reader viewport dimensions.
 * @returns Offscreen measurement layer.
 */
export function ReaderMeasurementLayer({
	sceneIds,
	rootRef,
	tale,
	viewport,
}: {
	sceneIds: string[];
	rootRef: RefObject<HTMLDivElement | null>;
	tale: Tale;
	viewport: ViewportSize;
}): React.JSX.Element {
	return (
		<div
			ref={rootRef}
			aria-hidden="true"
			data-reader-component="ReaderMeasurementLayer"
			data-reader-role="measurement-layer"
			className="pointer-events-none fixed top-0 left-[-100000px] opacity-0"
			style={
				{
					"--reader-viewport-height": `${viewport.height}px`,
					"--reader-viewport-width": `${viewport.width}px`,
				} as CSSProperties
			}
		>
			{sceneIds.flatMap((sceneId) => {
				const anchor = getMeasurementAnchor(tale, sceneId);
				const block = tale.indexMap.scenesById[sceneId];
				if (!anchor || !block) return [];
				return [
					<article
						key={anchor.sceneId}
						data-reader-measure-block={anchor.sceneId}
						data-reader-component="ReaderMeasurementLayer"
						data-reader-role="measurement-block"
						className="relative inline-block overflow-visible"
						style={{
							background: block.resolved.background,
							border: block.style?.border,
							borderRadius: block.style?.borderRadius,
							boxShadow: block.style?.boxShadow,
							clipPath: block.style?.clipPath,
							color: block.style?.color,
							...getMeasurementBlockStyle(block.size, viewport),
						}}
					>
						<ReaderSceneContent anchor={anchor} mode="measure" />
					</article>,
				];
			})}
		</div>
	);
}

/**
 * Creates a minimal anchor for offscreen content rendering.
 *
 * @param tale - Formatted tale.
 * @param sceneId - Scene being measured.
 * @returns Measurement anchor or null when relationships are incomplete.
 */
function getMeasurementAnchor(tale: Tale, sceneId: string): Anchor | null {
	const block = tale.indexMap.scenesById[sceneId];
	if (!block) return null;

	// Measurement is structural, not narrative. A Scene can now obtain its
	// page/entry/part through a Keyframe, so requiring those old direct links
	// silently omitted content-responsive Scenes from the measurement pass.
	return {
		sceneId: block.id,
		branchId: block.branchId,
		cameraFramingOffset: { x: 0, y: 0 },
		cameraPoint: { x: 0, y: 0 },
		entryId: "",
		height: 0,
		id: block.id,
		pageId: "",
		partId: "",
		point: { x: 0, y: 0 },
		readingPathPoints: [],
		scroll: 0,
		width: 0,
	};
}

/**
 * Resolves content measurement constraints into CSS pixels.
 *
 * Width constraints are applied before reading scrollHeight so wrapped text
 * produces the same height as the final block.
 *
 * @param size - Content-responsive block size.
 * @param viewport - Effective reader viewport dimensions.
 * @returns CSS constraints for the measurement article.
 */
function getMeasurementBlockStyle(
	size: SceneSize,
	viewport: ViewportSize,
): CSSProperties {
	if (size.mode === "manual") {
		return {
			height: resolveSizeValue(size.height, size.heightUnit, viewport.height),
			width: resolveSizeValue(size.width, size.widthUnit, viewport.width),
			minWidth: resolveSizeValue(
				size.minWidth,
				size.minWidthUnit,
				viewport.width,
			),
			maxWidth: resolveSizeValue(
				size.maxWidth,
				size.maxWidthUnit,
				viewport.width,
			),
			minHeight: resolveSizeValue(
				size.minHeight,
				size.minHeightUnit,
				viewport.height,
			),
			maxHeight: resolveSizeValue(
				size.maxHeight,
				size.maxHeightUnit,
				viewport.height,
			),
		};
	}
	const minWidth = resolveSizeValue(
		size.minWidth,
		size.minWidthUnit,
		viewport.width,
	);
	const maxWidth = resolveSizeValue(
		size.maxWidth,
		size.maxWidthUnit,
		viewport.width,
	);
	const minHeight = resolveSizeValue(
		size.minHeight,
		size.minHeightUnit,
		viewport.height,
	);

	return {
		minHeight,
		minWidth,
		width: maxWidth ?? "max-content",
	};
}

/**
 * Converts a pixel or viewport-relative size into pixels.
 *
 * @param value - Authored size value.
 * @param unit - Authored size unit.
 * @param viewportAxis - Width or height of the effective viewport.
 * @returns Pixel size or undefined when no value is configured.
 */
function resolveSizeValue(
	value: number | undefined,
	unit: "px" | "viewport" | undefined,
	viewportAxis: number,
): number | undefined {
	if (value === undefined) return undefined;
	return unit === "viewport" ? value * viewportAxis : value;
}
