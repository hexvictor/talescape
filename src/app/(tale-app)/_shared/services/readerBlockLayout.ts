import type {
	Anchor,
	Direction,
	Point,
	ResolvedBlockSize,
	ResolvedTaleBlock,
	ViewportSize,
} from "../types";
import { directionVector, getReadingCamera } from "./readerGeometry";

type BlockBounds = {
	bottom: number;
	left: number;
	right: number;
	top: number;
};

/**
 * Prevents a block-edge destination from intersecting earlier route geometry.
 *
 * @param point - Candidate visual anchor point.
 * @param size - Destination block dimensions.
 * @param direction - Direction from which the destination is presented.
 * @param existingAnchors - Previously compiled route anchors.
 * @returns Visual anchor point shifted to the nearest unoccupied position.
 *
 * @example
 * const point = resolveNonOverlappingBlockPoint(candidate, size, "down", anchors);
 */
export function resolveNonOverlappingBlockPoint(
	point: Point,
	size: ResolvedBlockSize,
	direction: Direction,
	existingAnchors: readonly Anchor[],
): Point {
	const vector = directionVector(direction);
	const primaryAxis =
		Math.abs(vector.x) >= Math.abs(vector.y) ? "horizontal" : "vertical";
	const resolved = { ...point };

	for (let pass = 0; pass <= existingAnchors.length; pass++) {
		const candidate = getBlockBounds(resolved, size);
		let shift = 0;
		for (const anchor of existingAnchors) {
			const existing = getAnchorBounds(anchor);
			if (primaryAxis === "horizontal") {
				if (
					!rangesOverlap(
						candidate.top,
						candidate.bottom,
						existing.top,
						existing.bottom,
					)
				)
					continue;
				if (vector.x > 0 && boundsOverlap(candidate, existing)) {
					shift = Math.max(shift, existing.right - candidate.left);
				}
				if (vector.x < 0 && boundsOverlap(candidate, existing)) {
					shift = Math.min(shift, existing.left - candidate.right);
				}
			} else {
				if (
					!rangesOverlap(
						candidate.left,
						candidate.right,
						existing.left,
						existing.right,
					)
				)
					continue;
				if (vector.y > 0 && boundsOverlap(candidate, existing)) {
					shift = Math.max(shift, existing.bottom - candidate.top);
				}
				if (vector.y < 0 && boundsOverlap(candidate, existing)) {
					shift = Math.min(shift, existing.top - candidate.bottom);
				}
			}
		}
		if (Math.abs(shift) < 0.01) return resolved;
		if (primaryAxis === "horizontal") resolved.x += shift;
		else resolved.y += shift;
	}

	return resolved;
}

/**
 * Places a block against the bounds of the panel group visible in the previous
 * camera viewport.
 *
 * @param point - Candidate point from ordinary block/camera placement.
 * @param size - Destination block dimensions.
 * @param direction - Authored placement direction.
 * @param existingAnchors - Previously compiled route anchors.
 * @returns Candidate point adjusted to the visible panel-group edge.
 *
 * @example
 * const point = resolveGroupEdgeBlockPoint(candidate, size, "left", anchors);
 */
export function resolveGroupEdgeBlockPoint(
	point: Point,
	size: ResolvedBlockSize,
	direction: Direction,
	existingAnchors: readonly Anchor[],
	options: {
		crossAxisAlignment?: "center" | "end" | "start";
		horizontalAlignment?: "center" | "end" | "start";
		referenceCamera?: Point;
		viewport?: ViewportSize;
	} = {},
): Point {
	const vector = directionVector(direction);
	const previous = existingAnchors.at(-1);
	if (!previous || !options.referenceCamera || !options.viewport) return point;

	const viewportBounds = getBlockBounds(
		options.referenceCamera,
		options.viewport,
	);
	const framedAnchors = getPlacementPanelGroup(
		existingAnchors,
		direction,
		viewportBounds,
		options.viewport,
	);
	const groupBounds = getCombinedBounds(
		framedAnchors.length > 0 ? framedAnchors : [previous],
	);
	const previousBounds = getAnchorBounds(previous);
	const resolved = { ...point };

	if (vector.x > 0) resolved.x += groupBounds.right - previousBounds.right;
	if (vector.x < 0) resolved.x += groupBounds.left - previousBounds.left;
	if (vector.y > 0) resolved.y += groupBounds.bottom - previousBounds.bottom;
	if (vector.y < 0) resolved.y += groupBounds.top - previousBounds.top;

	if (vector.y !== 0 && vector.x === 0) {
		resolved.x = alignWithinBounds(
			groupBounds.left,
			groupBounds.right,
			size.width,
			options.horizontalAlignment ?? options.crossAxisAlignment ?? "center",
		);
	}
	if (vector.x !== 0 && vector.y === 0) {
		resolved.y = alignWithinBounds(
			groupBounds.top,
			groupBounds.bottom,
			size.height,
			options.crossAxisAlignment ?? "center",
		);
	}

	return resolved;
}

/**
 * Finds the contiguous panel row or column ending at the previous block.
 *
 * Cardinal group placement must be based on authored block geometry rather
 * than the exit camera. Otherwise a half-height row framed in a full viewport
 * makes the following block start at the viewport edge and leaves a gap.
 */
function getPlacementPanelGroup(
	anchors: readonly Anchor[],
	direction: Direction,
	viewportBounds: BlockBounds,
	viewport: ViewportSize,
): Anchor[] {
	const vector = directionVector(direction);
	const previous = anchors.at(-1);
	if (!previous) return [];
	if (vector.x !== 0 && vector.y !== 0) {
		return anchors.filter((anchor) =>
			boundsOverlap(getAnchorBounds(anchor), viewportBounds),
		);
	}

	const group = [previous];
	let groupBounds = getAnchorBounds(previous);
	const gapTolerance =
		(vector.y !== 0 ? viewport.width : viewport.height) * 0.05;
	let changed = true;

	while (changed) {
		changed = false;
		for (const anchor of anchors) {
			if (group.includes(anchor)) continue;
			const bounds = getAnchorBounds(anchor);
			const sharesPanelBand =
				vector.y !== 0
					? rangesOverlap(
							bounds.top,
							bounds.bottom,
							groupBounds.top,
							groupBounds.bottom,
						)
					: rangesOverlap(
							bounds.left,
							bounds.right,
							groupBounds.left,
							groupBounds.right,
						);
			const crossAxisGap =
				vector.y !== 0
					? getRangeGap(
							bounds.left,
							bounds.right,
							groupBounds.left,
							groupBounds.right,
						)
					: getRangeGap(
							bounds.top,
							bounds.bottom,
							groupBounds.top,
							groupBounds.bottom,
						);
			if (!sharesPanelBand || crossAxisGap > gapTolerance) continue;

			group.push(anchor);
			groupBounds = combineBounds(groupBounds, bounds);
			changed = true;
		}
	}

	return group;
}

/**
 * Aligns a size inside a reference span on one world axis.
 *
 * @param center - Reference span center.
 * @param referenceSize - Reference span size.
 * @param size - Destination size.
 * @param alignment - Start, center, or end placement inside the span.
 * @returns Destination center on the same axis.
 *
 * @example
 * const x = alignWithinAxis(camera.x, viewport.width, block.width, "start");
 */
function alignWithinAxis(
	center: number,
	referenceSize: number,
	size: number,
	alignment: "center" | "end" | "start",
): number {
	if (alignment === "start") {
		return center - referenceSize / 2 + size / 2;
	}
	if (alignment === "end") {
		return center + referenceSize / 2 - size / 2;
	}
	return center;
}

/** Aligns a destination inside an authored panel-group span. */
function alignWithinBounds(
	start: number,
	end: number,
	size: number,
	alignment: "center" | "end" | "start",
): number {
	return alignWithinAxis((start + end) / 2, end - start, size, alignment);
}

/** Returns the union of a non-empty block-anchor collection. */
function getCombinedBounds(anchors: readonly Anchor[]): BlockBounds {
	const first = getAnchorBounds(anchors[0] as Anchor);
	return anchors
		.slice(1)
		.reduce<BlockBounds>(
			(combined, anchor) => combineBounds(combined, getAnchorBounds(anchor)),
			first,
		);
}

/** Returns the union of two rectangles. */
function combineBounds(first: BlockBounds, second: BlockBounds): BlockBounds {
	return {
		bottom: Math.max(first.bottom, second.bottom),
		left: Math.min(first.left, second.left),
		right: Math.max(first.right, second.right),
		top: Math.min(first.top, second.top),
	};
}

/**
 * Resolves a destination camera base while keeping already visible small blocks framed.
 *
 * @param previous - Previous compiled route anchor.
 * @param block - Destination block.
 * @param point - Destination visual anchor point.
 * @param cameraFramingOffset - Camera offset used to frame a small block.
 * @param size - Destination block dimensions.
 * @param readingPathPoints - Compiled camera offsets for destination reading.
 * @param viewport - Active reader viewport.
 * @returns Camera base point used by reading and transition segments.
 *
 * @example
 * const cameraPoint = resolveBlockCameraPoint(previous, block, point, framing, size, path, viewport);
 */
export function resolveBlockCameraPoint(
	previous: Anchor | null,
	block: ResolvedTaleBlock,
	point: Point,
	cameraFramingOffset: Point,
	size: ResolvedBlockSize,
	readingPathPoints: Point[],
	viewport: ViewportSize,
): Point {
	const flow = block.transition.flow;
	const entryOffset = readingPathPoints[0] ?? { x: 0, y: 0 };
	const previousCamera = previous
		? getReadingCamera(previous, 1, viewport)
		: point;
	const bounds = getBlockBounds(point, size);
	const authoredEntryCamera = {
		x: point.x + entryOffset.x,
		y: point.y + entryOffset.y,
	};
	const target = {
		x: resolveFramedCameraAxis({
			alignment: block.size.horizontalAlignment,
			authoredTarget: authoredEntryCamera.x,
			end: bounds.right,
			framingOffset: cameraFramingOffset.x,
			previousCamera: previousCamera.x,
			start: bounds.left,
			viewportLength: viewport.width,
		}),
		y: resolveFramedCameraAxis({
			alignment: block.size.verticalAlignment,
			authoredTarget: authoredEntryCamera.y,
			end: bounds.bottom,
			framingOffset: cameraFramingOffset.y,
			previousCamera: previousCamera.y,
			start: bounds.top,
			viewportLength: viewport.height,
		}),
	};
	const directionalTarget =
		previous && flow.type === "linear"
			? constrainCameraToTransitionDirection(
					target,
					previousCamera,
					flow.direction,
				)
			: target;
	return {
		x: directionalTarget.x - entryOffset.x,
		y: directionalTarget.y - entryOffset.y,
	};
}

/**
 * Resolves one camera axis from automatic framing or an authored viewport edge.
 *
 * @param options - Block bounds, camera history, and framing preference.
 * @returns Camera coordinate for the block's reading entry.
 *
 * @example
 * const x = resolveFramedCameraAxis(options);
 */
function resolveFramedCameraAxis({
	alignment,
	authoredTarget,
	end,
	framingOffset,
	previousCamera,
	start,
	viewportLength,
}: {
	alignment: "auto" | "bottom" | "center" | "left" | "right" | "top";
	authoredTarget: number;
	end: number;
	framingOffset: number;
	previousCamera: number;
	start: number;
	viewportLength: number;
}): number {
	if (alignment === "auto") {
		return resolveContainedCameraAxis(
			previousCamera,
			start,
			end,
			viewportLength,
			authoredTarget,
		);
	}
	return authoredTarget - framingOffset;
}

/**
 * Prevents placement preferences from reversing a linear camera transition.
 *
 * Placement remains the preferred camera target. When that target sits behind
 * the previous camera on a transition axis, the camera stays at its previous
 * coordinate instead of briefly travelling against the authored direction.
 *
 * @param target - Preferred destination camera coordinate.
 * @param previousCamera - Camera coordinate at the end of the previous block.
 * @param direction - Destination block transition direction.
 * @returns Directionally valid destination camera coordinate.
 *
 * @example
 * const target = constrainCameraToTransitionDirection(preferred, previous, "right");
 */
function constrainCameraToTransitionDirection(
	target: Point,
	previousCamera: Point,
	direction: Direction,
): Point {
	const vector = directionVector(direction);
	return {
		x:
			vector.x > 0
				? Math.max(target.x, previousCamera.x)
				: vector.x < 0
					? Math.min(target.x, previousCamera.x)
					: target.x,
		y:
			vector.y > 0
				? Math.max(target.y, previousCamera.y)
				: vector.y < 0
					? Math.min(target.y, previousCamera.y)
					: target.y,
	};
}

/**
 * Returns world bounds for a positioned block.
 *
 * @param point - Visual anchor point.
 * @param size - Block dimensions.
 * @returns Axis-aligned world bounds.
 */
function getBlockBounds(
	point: Point,
	size: { height: number; width: number },
): BlockBounds {
	return {
		bottom: point.y + size.height / 2,
		left: point.x - size.width / 2,
		right: point.x + size.width / 2,
		top: point.y - size.height / 2,
	};
}

/**
 * Returns world bounds for an existing anchor.
 *
 * @param anchor - Compiled route anchor.
 * @returns Axis-aligned world bounds.
 */
function getAnchorBounds(anchor: Anchor): BlockBounds {
	return getBlockBounds(anchor.point, {
		height: anchor.height,
		width: anchor.width,
	});
}

/**
 * Keeps the previous camera when a destination fits inside it, otherwise moves minimally.
 *
 * @param previousCamera - Previous camera coordinate.
 * @param start - Destination leading edge.
 * @param end - Destination trailing edge.
 * @param viewportLength - Camera viewport length on this axis.
 * @param oversizedTarget - Authored camera target for oversized content.
 * @returns Camera coordinate for the destination entry.
 */
function resolveContainedCameraAxis(
	previousCamera: number,
	start: number,
	end: number,
	viewportLength: number,
	oversizedTarget: number,
): number {
	if (end - start > viewportLength) return oversizedTarget;
	const minimum = end - viewportLength / 2;
	const maximum = start + viewportLength / 2;
	return Math.min(Math.max(previousCamera, minimum), maximum);
}

/**
 * Checks whether two ranges overlap by a visible amount.
 *
 * @param firstStart - First range start.
 * @param firstEnd - First range end.
 * @param secondStart - Second range start.
 * @param secondEnd - Second range end.
 * @returns Whether the ranges overlap.
 */
function rangesOverlap(
	firstStart: number,
	firstEnd: number,
	secondStart: number,
	secondEnd: number,
): boolean {
	return firstStart < secondEnd - 0.01 && firstEnd > secondStart + 0.01;
}

/** Returns whether two spans overlap or meet at an edge. */
function getRangeGap(
	firstStart: number,
	firstEnd: number,
	secondStart: number,
	secondEnd: number,
): number {
	return Math.max(0, firstStart - secondEnd, secondStart - firstEnd);
}

/**
 * Checks whether two block rectangles overlap.
 *
 * @param first - First block bounds.
 * @param second - Second block bounds.
 * @returns Whether both axes overlap.
 */
function boundsOverlap(first: BlockBounds, second: BlockBounds): boolean {
	return (
		rangesOverlap(first.left, first.right, second.left, second.right) &&
		rangesOverlap(first.top, first.bottom, second.top, second.bottom)
	);
}
