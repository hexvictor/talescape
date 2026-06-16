"use client";

import type { CSSProperties, RefObject } from "react";
import type { Anchor, BlockSize, Tale, ViewportSize } from "../../../types";
import { ReaderBlockContent } from "../ReaderBlock/ReaderBlockContent";

/**
 * Renders content-sized blocks offscreen using the same content structure as
 * the live reader.
 *
 * @param props - Measurement layer properties.
 * @param props.blockIds - Block ids requiring intrinsic measurement.
 * @param props.rootRef - Ref consumed by the measurement service.
 * @param props.tale - Formatted tale data.
 * @param props.viewport - Effective reader viewport dimensions.
 * @returns Offscreen measurement layer.
 */
export function ReaderMeasurementLayer({
	blockIds,
	rootRef,
	tale,
	viewport,
}: {
	blockIds: string[];
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
		>
			{blockIds.flatMap((blockId) => {
				const anchor = getMeasurementAnchor(tale, blockId);
				if (!anchor || anchor.block.size.mode !== "content") return [];
				return [
					<article
						key={anchor.block.id}
						data-reader-measure-block={anchor.block.id}
						data-reader-component="ReaderMeasurementLayer"
						data-reader-role="measurement-block"
						className="relative flex items-center justify-center overflow-visible"
						style={{
							background: anchor.block.resolved.background,
							border: anchor.block.style?.border,
							borderRadius: anchor.block.style?.borderRadius,
							boxShadow: anchor.block.style?.boxShadow,
							clipPath: anchor.block.style?.clipPath,
							color: anchor.block.style?.color,
							...getMeasurementBlockStyle(anchor.block.size, viewport),
						}}
					>
						<ReaderBlockContent
							anchor={anchor}
							mode="measure"
							onChoosePath={() => {}}
						/>
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
 * @param blockId - Block being measured.
 * @returns Measurement anchor or null when relationships are incomplete.
 */
function getMeasurementAnchor(tale: Tale, blockId: string): Anchor | null {
	const block = tale.indexMap.blocksById[blockId];
	const branch = block && tale.indexMap.branchesById[block.branchId];
	const entry = block && tale.indexMap.entriesById[block.entryId];
	const page = block && tale.indexMap.pagesById[block.pageId];
	const part = block && tale.indexMap.partsById[block.partId];
	if (!block || !branch || !entry || !page || !part) return null;
	return {
		block,
		branch,
		cameraFramingOffset: { x: 0, y: 0 },
		cameraPoint: { x: 0, y: 0 },
		entry,
		height: 0,
		id: block.id,
		page,
		part,
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
	size: Extract<BlockSize, { mode: "content" }>,
	viewport: ViewportSize,
): CSSProperties {
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
