import type { Point } from "../types";

export function lerpPoint(from: Point, to: Point, progress: number): Point {
	return {
		x: lerp(from.x, to.x, progress),
		y: lerp(from.y, to.y, progress),
	};
}

export function lerp(from: number, to: number, progress: number) {
	return from + (to - from) * progress;
}

function ease(value: number) {
	return 1 - (1 - value) ** 3;
}

export function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}
