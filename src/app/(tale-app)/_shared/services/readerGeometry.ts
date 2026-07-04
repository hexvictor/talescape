import type {
	Anchor,
	BlockFlow,
	Direction,
	Point,
	ResolvedTaleBlock,
	StackPlacementPosition,
	ViewportSize,
} from "../types";
import { clamp, lerpPoint } from "./readerMath";

export function getReadingCamera(
	anchor: Anchor,
	progress: number,
	viewport: ViewportSize,
) {
	const offset = getReadingContentOffset(anchor, progress, viewport);
	return {
		x: anchor.cameraPoint.x + offset.x,
		y: anchor.cameraPoint.y + offset.y,
	};
}

/**
 * Resolves the physical world position of the next block.
 *
 * @param previous - Previous compiled block anchor.
 * @param nextBlock - Destination block configuration.
 * @param nextSize - Destination block dimensions.
 * @param viewport - Active camera viewport dimensions.
 * @returns Destination block center in world coordinates.
 *
 * @example
 * const point = getNextPoint(previous, block, size, viewport);
 */
export function getNextPoint(
	previous: Anchor,
	nextBlock: ResolvedTaleBlock,
	nextSize: { height: number; width: number },
	viewport: ViewportSize,
): Point {
	const flow = nextBlock.transition.flow;
	const exitCamera = getReadingCamera(previous, 1, viewport);
	if (flow.type === "stack") {
		const placement = flow.placement ?? "blockEdge";
		const referenceCenter =
			placement === "cameraEdge" ||
			placement === "blockEdgeWithViewportAlignment"
				? exitCamera
				: previous.point;
		const referenceSize =
			placement === "cameraEdge" ||
			placement === "blockEdgeWithViewportAlignment"
				? { height: viewport.height, width: viewport.width }
				: { height: previous.height, width: previous.width };
		return getStackedBlockPoint(referenceCenter, referenceSize, nextSize, {
			fallback: flow.alignment,
			horizontalPlacement: flow.horizontalPlacement,
			horizontalPosition: flow.horizontalPosition,
			verticalPlacement: flow.verticalPlacement,
			verticalPosition: flow.verticalPosition,
		});
	}

	const spacing = resolveSpacing(flow.spacing, viewport);
	if (flow.placement === "cameraEdge") {
		return getCameraViewportEdgePoint(
			exitCamera,
			viewport,
			nextSize,
			flow.direction,
			spacing,
			flow.alignment,
		);
	}
	if (
		flow.placement === "blockEdgeWithViewportAlignment" ||
		flow.placement === "groupEdge"
	) {
		return getBlockEdgeWithViewportAlignmentPoint(
			previous,
			exitCamera,
			viewport,
			nextSize,
			flow.direction,
			spacing,
			flow.alignment,
		);
	}
	return getAdjacentBlockPoint(
		previous.point,
		{ height: previous.height, width: previous.width },
		nextSize,
		flow.direction,
		spacing,
		flow.alignment,
	);
}

/**
 * Places a stacked block over a reference block or camera rectangle.
 *
 * @param referenceCenter - Center point of the block or camera rectangle.
 * @param referenceSize - Size of the reference rectangle.
 * @param nextSize - Destination block dimensions.
 * @param alignment - How the destination aligns inside the reference rectangle.
 * @returns Destination block center in world coordinates.
 *
 * @example
 * const point = getStackedBlockPoint(camera, viewport, size, { horizontalPlacement: "end", verticalPlacement: "start" });
 */
function getStackedBlockPoint(
	referenceCenter: Point,
	referenceSize: { height: number; width: number },
	nextSize: { height: number; width: number },
	alignment: {
		fallback?: StackPlacementPosition;
		horizontalPlacement?: StackPlacementPosition;
		horizontalPosition?: number;
		verticalPlacement?: StackPlacementPosition;
		verticalPosition?: number;
	} = {},
): Point {
	return {
		x: alignWithinReferenceAxis(
			referenceCenter.x,
			referenceSize.width,
			nextSize.width,
			resolveStackPlacementPosition(
				alignment.horizontalPlacement,
				alignment.horizontalPosition,
				alignment.fallback,
			),
		),
		y: alignWithinReferenceAxis(
			referenceCenter.y,
			referenceSize.height,
			nextSize.height,
			resolveStackPlacementPosition(
				alignment.verticalPlacement,
				alignment.verticalPosition,
				alignment.fallback,
			),
		),
	};
}

/**
 * Resolves one stacked placement axis to a normalized position inside the
 * reference rectangle.
 *
 * @param placement - Named start, center, or end placement.
 * @param position - Explicit normalized placement from 0 to 1.
 * @param fallback - Legacy single-axis placement used by older data.
 * @returns Normalized placement along one reference axis.
 *
 * @example
 * const x = resolveStackPlacementPosition("end", undefined, "center");
 */
function resolveStackPlacementPosition(
	placement?: StackPlacementPosition,
	position?: number,
	fallback: StackPlacementPosition = "center",
): number {
	if (typeof position === "number" && Number.isFinite(position)) {
		return clamp(position, 0, 1);
	}
	const resolved = placement ?? fallback;
	if (resolved === "start") return 0;
	if (resolved === "end") return 1;
	return 0.5;
}

/**
 * Uses the previous block edge for travel distance and the previous camera
 * viewport for perpendicular alignment.
 *
 * @param previous - Previous block anchor and physical dimensions.
 * @param cameraPoint - Previous camera center at the end of reading.
 * @param viewport - Previous camera viewport dimensions.
 * @param nextSize - Destination block dimensions.
 * @param direction - Placement direction from the previous block.
 * @param spacing - Pixel spacing resolved for each axis.
 * @param alignment - Start, center, or end viewport alignment.
 * @returns Destination block center in world coordinates.
 *
 * @example
 * const point = getBlockEdgeWithViewportAlignmentPoint(previous, camera, viewport, size, "right", spacing, "start");
 */
export function getBlockEdgeWithViewportAlignmentPoint(
	previous: Pick<Anchor, "height" | "point" | "width">,
	cameraPoint: Point,
	viewport: ViewportSize,
	nextSize: { height: number; width: number },
	direction: Direction,
	spacing: Point,
	alignment: "center" | "end" | "start" = "center",
): Point {
	const blockEdgePoint = getAdjacentBlockPoint(
		previous.point,
		{ height: previous.height, width: previous.width },
		nextSize,
		direction,
		spacing,
		alignment,
	);
	const viewportAlignedPoint = getCameraViewportEdgePoint(
		cameraPoint,
		viewport,
		nextSize,
		direction,
		spacing,
		alignment,
	);
	const vector = directionVector(direction);
	return {
		x: vector.x === 0 ? viewportAlignedPoint.x : blockEdgePoint.x,
		y: vector.y === 0 ? viewportAlignedPoint.y : blockEdgePoint.y,
	};
}

/**
 * Places a destination block directly beside the previous block.
 *
 * @param previousPoint - Previous block center in world coordinates.
 * @param previousSize - Previous block dimensions.
 * @param nextSize - Destination block dimensions.
 * @param direction - Placement direction from previous to destination.
 * @param spacing - Pixel spacing resolved for each axis.
 * @param alignment - Cross-axis edge alignment.
 * @returns Destination block center in world coordinates.
 *
 * @example
 * const point = getAdjacentBlockPoint(previous, previousSize, nextSize, "right", spacing, "start");
 */
export function getAdjacentBlockPoint(
	previousPoint: Point,
	previousSize: { height: number; width: number },
	nextSize: { height: number; width: number },
	direction: Direction,
	spacing: Point,
	alignment: "center" | "end" | "start" = "center",
): Point {
	const vector = directionVector(direction);
	const horizontalDistance =
		(previousSize.width + nextSize.width) / 2 + Math.abs(vector.x) * spacing.x;
	const verticalDistance =
		(previousSize.height + nextSize.height) / 2 +
		Math.abs(vector.y) * spacing.y;
	const point = {
		x: previousPoint.x + Math.sign(vector.x) * horizontalDistance,
		y: previousPoint.y + Math.sign(vector.y) * verticalDistance,
	};
	if (vector.x !== 0 && vector.y === 0) {
		point.y = alignCrossAxis(
			previousPoint.y,
			previousSize.height,
			nextSize.height,
			alignment,
		);
	}
	if (vector.y !== 0 && vector.x === 0) {
		point.x = alignCrossAxis(
			previousPoint.x,
			previousSize.width,
			nextSize.width,
			alignment,
		);
	}
	return point;
}

/**
 * Aligns a destination block along the axis perpendicular to its placement.
 *
 * @param previousCenter - Previous block center on the cross axis.
 * @param previousSize - Previous block size on the cross axis.
 * @param nextSize - Destination block size on the cross axis.
 * @param alignment - Start, center, or end edge alignment.
 * @returns Destination center on the cross axis.
 *
 * @example
 * const y = alignCrossAxis(500, 400, 200, "start");
 */
function alignCrossAxis(
	previousCenter: number,
	previousSize: number,
	nextSize: number,
	alignment: "center" | "end" | "start" = "center",
): number {
	if (alignment === "start") {
		return previousCenter - previousSize / 2 + nextSize / 2;
	}
	if (alignment === "end") {
		return previousCenter + previousSize / 2 - nextSize / 2;
	}
	return previousCenter;
}

/**
 * Aligns a stacked block inside a reference rectangle using a normalized
 * position from 0 to 1.
 *
 * @param referenceCenter - Reference rectangle center on one axis.
 * @param referenceSize - Reference rectangle size on one axis.
 * @param nextSize - Destination block size on one axis.
 * @param position - Normalized destination position inside the reference.
 * @returns Destination center on one world axis.
 *
 * @example
 * const x = alignWithinReferenceAxis(0, 1000, 200, 1);
 */
function alignWithinReferenceAxis(
	referenceCenter: number,
	referenceSize: number,
	nextSize: number,
	position: number,
): number {
	const available = Math.max(referenceSize - nextSize, 0);
	return (
		referenceCenter - referenceSize / 2 + nextSize / 2 + available * position
	);
}

/**
 * Places a destination block directly beside the previous camera viewport.
 *
 * @param cameraPoint - Previous camera center at the end of reading.
 * @param viewport - Previous camera viewport dimensions.
 * @param nextSize - Destination block dimensions.
 * @param direction - Placement direction from the camera viewport.
 * @param spacing - Pixel spacing resolved for each axis.
 * @param alignment - Cross-axis viewport edge alignment.
 * @returns Destination block center in reader world coordinates.
 *
 * @example
 * const point = getCameraViewportEdgePoint(camera, viewport, size, "right", spacing, "start");
 */
export function getCameraViewportEdgePoint(
	cameraPoint: Point,
	viewport: ViewportSize,
	nextSize: { height: number; width: number },
	direction: Direction,
	spacing: Point,
	alignment: "center" | "end" | "start" = "center",
): Point {
	return getAdjacentBlockPoint(
		cameraPoint,
		{ height: viewport.height, width: viewport.width },
		nextSize,
		direction,
		spacing,
		alignment,
	);
}

/**
 * Converts configured block spacing into horizontal and vertical pixels.
 *
 * @param spacing - Optional px or viewport-relative spacing.
 * @param viewport - Current viewport dimensions.
 * @returns Pixel spacing for each layout axis.
 *
 * @example
 * const spacing = resolveSpacing(flow.spacing, viewport);
 */
function resolveSpacing(
	spacing: Extract<BlockFlow, { type: "linear" }>["spacing"],
	viewport: ViewportSize,
): Point {
	if (!spacing) return { x: 0, y: 0 };
	if (spacing.unit === "px") {
		return { x: spacing.value, y: spacing.value };
	}
	return {
		x: viewport.width * spacing.value,
		y: viewport.height * spacing.value,
	};
}

function getReadingCameraOffset(
	size: { height: number; width: number },
	block: ResolvedTaleBlock,
	progress: number,
	viewport: ViewportSize,
	readingPathPoints?: Point[],
) {
	if (readingPathPoints?.length) {
		return pointAlongPath(readingPathPoints, progress);
	}
	const extraX = Math.max(0, size.width - viewport.width);
	const extraY = Math.max(0, size.height - viewport.height);
	const cameraPath = block.reading.cameraPath;
	if (cameraPath?.mode === "custom" && cameraPath.points.length > 0) {
		const points = cameraPath.points.map((point) => ({
			x: -extraX / 2 + clamp(point.x * viewport.width, 0, extraX),
			y: -extraY / 2 + clamp(point.y * viewport.height, 0, extraY),
		}));
		return pointAlongPath(points, progress);
	}
	const direction = getCameraDirection(block, cameraPath);
	const vector = direction ? directionVector(direction) : { x: 0, y: 1 };
	const xProgress =
		vector.x === 0 ? 0.5 : vector.x > 0 ? progress : 1 - progress;
	const yProgress =
		vector.y === 0 ? 0.5 : vector.y > 0 ? progress : 1 - progress;
	return {
		x: -extraX / 2 + extraX * xProgress,
		y: -extraY / 2 + extraY * yProgress,
	};
}

/**
 * Resolves the content movement offset along a block reading path.
 *
 * @param anchor - Compiled block anchor.
 * @param progress - Reading progress from 0 to 1.
 * @param viewport - Current reader viewport dimensions.
 * @returns Content offset in world pixels.
 *
 * @example
 * const offset = getReadingContentOffset(anchor, 0.5, viewport);
 */
function getReadingContentOffset(
	anchor: Anchor,
	progress: number,
	viewport: ViewportSize,
): Point {
	return getReadingCameraOffset(
		{ height: anchor.height, width: anchor.width },
		anchor.block,
		progress,
		viewport,
		anchor.readingPathPoints,
	);
}

/**
 * Calculates how far the camera can travel inside a block on its reading path.
 *
 * @param anchor - The measured block anchor.
 * @param viewport - Current viewport dimensions.
 * @returns Pixel travel distance across the configured reading path.
 *
 * @example
 * const distance = getReadingTravelDistance(anchor, viewport);
 */
export function getReadingTravelDistance(
	anchor: Anchor,
	viewport: ViewportSize,
) {
	const start = getReadingCameraOffset(
		{ height: anchor.height, width: anchor.width },
		anchor.block,
		0,
		viewport,
		anchor.readingPathPoints,
	);
	const end = getReadingCameraOffset(
		{ height: anchor.height, width: anchor.width },
		anchor.block,
		1,
		viewport,
		anchor.readingPathPoints,
	);
	return Math.hypot(end.x - start.x, end.y - start.y);
}

/**
 * Compiles viewport-relative camera path points into pixel offsets.
 *
 * @param size - Measured block dimensions.
 * @param block - Block containing camera path configuration.
 * @param viewport - Current viewport dimensions.
 * @returns Pixel offsets used directly during scroll rendering.
 *
 * @example
 * const points = compileReadingPathPoints(size, block, viewport);
 */
export function compileReadingPathPoints(
	size: { height: number; width: number },
	block: ResolvedTaleBlock,
	viewport: ViewportSize,
): Point[] {
	const extraX = Math.max(0, size.width - viewport.width);
	const extraY = Math.max(0, size.height - viewport.height);
	const cameraPath = block.reading.cameraPath;
	if (cameraPath?.mode === "custom" && cameraPath.points.length > 0) {
		return cameraPath.points.map((point) => ({
			x: -extraX / 2 + clamp(point.x * viewport.width, 0, extraX),
			y: -extraY / 2 + clamp(point.y * viewport.height, 0, extraY),
		}));
	}

	const direction = getCameraDirection(block, cameraPath);
	const vector = direction ? directionVector(direction) : { x: 0, y: 1 };
	const offsetAt = (progress: number): Point => {
		const xProgress =
			vector.x === 0 ? 0.5 : vector.x > 0 ? progress : 1 - progress;
		const yProgress =
			vector.y === 0 ? 0.5 : vector.y > 0 ? progress : 1 - progress;
		return {
			x: -extraX / 2 + extraX * xProgress,
			y: -extraY / 2 + extraY * yProgress,
		};
	};
	return [offsetAt(0), offsetAt(1)];
}

function getCameraDirection(
	block: ResolvedTaleBlock,
	cameraPath: ResolvedTaleBlock["reading"]["cameraPath"],
) {
	if (cameraPath?.mode === "straight") return cameraPath.direction;
	const direction = flowDirection(block.resolved.flow);
	if (cameraPath?.mode !== "reverse-flow" || !direction) return direction;
	return oppositeDirection(direction);
}

function oppositeDirection(direction: Direction): Direction {
	const opposites: Record<Direction, Direction> = {
		down: "up",
		"down-left": "up-right",
		"down-right": "up-left",
		left: "right",
		right: "left",
		up: "down",
		"up-left": "down-right",
		"up-right": "down-left",
	};
	return opposites[direction];
}

function pointAlongPath(points: Point[], progress: number) {
	if (points.length === 1) return points[0] ?? { x: 0, y: 0 };
	const scaledProgress = clamp(progress, 0, 1) * (points.length - 1);
	const index = Math.min(points.length - 2, Math.floor(scaledProgress));
	return lerpPoint(
		points[index] ?? { x: 0, y: 0 },
		points[index + 1] ?? points[index] ?? { x: 0, y: 0 },
		scaledProgress - index,
	);
}

export function directionVector(direction: Direction) {
	const vectors: Record<Direction, { x: number; y: number }> = {
		down: { x: 0, y: 1 },
		"down-left": { x: -0.82, y: 0.82 },
		"down-right": { x: 0.82, y: 0.82 },
		left: { x: -1, y: 0 },
		right: { x: 1, y: 0 },
		up: { x: 0, y: -1 },
		"up-left": { x: -0.82, y: -0.82 },
		"up-right": { x: 0.82, y: -0.82 },
	};
	return vectors[direction];
}

export function flowDirection(flow: BlockFlow): Direction | null {
	return flow.type === "linear" ? flow.direction : null;
}
