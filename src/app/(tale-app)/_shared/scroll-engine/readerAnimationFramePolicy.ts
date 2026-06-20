import type { ViewportSize } from "../types";

export type ReaderAnimationFramePolicy = {
	isReduced: (scroll: number, frameTimeMs: number) => boolean;
};

/**
 * Creates a velocity-aware policy that reduces detailed animations during fast scrolling.
 *
 * @param viewport - Active reader viewport dimensions.
 * @returns Stateful frame policy with velocity smoothing and hysteresis.
 *
 * @example
 * const policy = createReaderAnimationFramePolicy(viewport);
 * const reduced = policy.isReduced(scroll, performance.now());
 */
export function createReaderAnimationFramePolicy(
	viewport: ViewportSize,
): ReaderAnimationFramePolicy {
	const viewportScale = Math.max(viewport.width, viewport.height, 1);
	const reduceAtPixelsPerSecond = viewportScale * 3;
	const restoreAtPixelsPerSecond = viewportScale * 1.4;
	let previousScroll: number | null = null;
	let previousTimeMs: number | null = null;
	let smoothedVelocity = 0;
	let reduced = false;

	return {
		isReduced(scroll, frameTimeMs): boolean {
			if (previousScroll === null || previousTimeMs === null) {
				previousScroll = scroll;
				previousTimeMs = frameTimeMs;
				return false;
			}
			const elapsedMs = Math.max(frameTimeMs - previousTimeMs, 1);
			const velocity = (Math.abs(scroll - previousScroll) / elapsedMs) * 1000;
			smoothedVelocity = smoothedVelocity * 0.72 + velocity * 0.28;
			previousScroll = scroll;
			previousTimeMs = frameTimeMs;
			if (!reduced && smoothedVelocity >= reduceAtPixelsPerSecond) {
				reduced = true;
			} else if (reduced && smoothedVelocity <= restoreAtPixelsPerSecond) {
				reduced = false;
			}
			return reduced;
		},
	};
}
