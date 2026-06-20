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
