import type {
	Anchor,
	BlockFlow,
	Direction,
	Point,
	ResolvedTaleBlock,
	ViewportSize,
} from "../types";
import { clamp, lerpPoint } from "./readerMath";

export function getReadingCamera(
	anchor: Anchor,
	progress: number,
	viewport: ViewportSize,
) {
	const offset = getReadingCameraOffset(
		{ height: anchor.height, width: anchor.width },
		anchor.block,
		progress,
		viewport,
		anchor.readingPathPoints,
	);
	return {
		x: anchor.cameraPoint.x + offset.x,
		y: anchor.cameraPoint.y + offset.y,
	};
}

export function getNextPoint(
	previous: Anchor,
	nextBlock: ResolvedTaleBlock,
	nextSize: { height: number; width: number },
	nextReadingPathPoints: Point[],
	nextViewportOffset: Point,
	current: Point,
	viewport: ViewportSize,
): Point {
	const flow = nextBlock.transition.flow;
	const exitCamera = getReadingCamera(previous, 1, viewport);
	const entryOffset = getReadingCameraOffset(
		nextSize,
		nextBlock,
		0,
		viewport,
		nextReadingPathPoints,
	);
	if (flow.type === "stack") {
		return {
			x: exitCamera.x - entryOffset.x,
			y: exitCamera.y - entryOffset.y,
		};
	}

	const vector = directionVector(flow.direction);
	const spacing = resolveSpacing(flow.spacing, viewport);
	if (flow.placement === "cameraEdge") {
		return getCameraEdgePoint({
			entryOffset,
			exitCamera,
			spacing,
			vector,
			viewport,
		});
	}
	const previousCenter = {
		x: current.x + previous.viewportOffset.x,
		y: current.y + previous.viewportOffset.y,
	};
	const horizontalDistance =
		(previous.width + nextSize.width) / 2 + Math.abs(vector.x) * spacing.x;
	const verticalDistance =
		(previous.height + nextSize.height) / 2 + Math.abs(vector.y) * spacing.y;
	const point = {
		x:
			previousCenter.x +
			Math.sign(vector.x) * horizontalDistance -
			nextViewportOffset.x,
		y:
			previousCenter.y +
			Math.sign(vector.y) * verticalDistance -
			nextViewportOffset.y,
	};
	if (vector.x !== 0 && vector.y === 0) {
		point.y = exitCamera.y - entryOffset.y;
	}
	if (vector.y !== 0 && vector.x === 0) {
		point.x = exitCamera.x - entryOffset.x;
	}
	return point;
}

/**
 * Places a destination block beside the camera's reading endpoint.
 *
 * @param options - Geometry values for the previous and destination blocks.
 * @returns Destination block center in reader world coordinates.
 *
 * @example
 * const point = getCameraEdgePoint(options);
 */
function getCameraEdgePoint({
	entryOffset,
	exitCamera,
	spacing,
	vector,
	viewport,
}: {
	entryOffset: Point;
	exitCamera: Point;
	spacing: Point;
	vector: Point;
	viewport: ViewportSize;
}): Point {
	const horizontalDistance = viewport.width + Math.abs(vector.x) * spacing.x;
	const verticalDistance = viewport.height + Math.abs(vector.y) * spacing.y;
	return {
		x: exitCamera.x + Math.sign(vector.x) * horizontalDistance - entryOffset.x,
		y: exitCamera.y + Math.sign(vector.y) * verticalDistance - entryOffset.y,
	};
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
