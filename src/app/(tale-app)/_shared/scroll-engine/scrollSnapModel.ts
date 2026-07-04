import { resolveSnapSettings } from "../services/readerSnapSettings";
import type { SnapPoint } from "../types";
import type { TaleSnapConfig } from "../types";

export type ReaderSnapModel = ReturnType<typeof createReaderSnapModel>;
export type ScrollDirection = -1 | 1;

export type ReaderSnapTarget = {
	delayMs: number;
	durationSeconds: number;
	forced: boolean;
	scroll: number;
};

/**
 * Creates a snap resolver for compiled reader snap points.
 *
 * @param points - Compiled snap points from the current reader route.
 * @returns Snap target resolver used by the input controller.
 *
 * @example
 * const snapModel = createReaderSnapModel(compiled.snapPoints);
 */
export function createReaderSnapModel(points: SnapPoint[]) {
	const sorted = [...points].sort((left, right) => left.scroll - right.scroll);

	const getSnapTarget = (
		scroll: number,
		direction: ScrollDirection,
		defaults: TaleSnapConfig,
	): ReaderSnapTarget | null => {
		const transitionTarget = getTransitionTarget(scroll, direction, defaults);
		if (transitionTarget) return transitionTarget;

		let low = 0;
		let high = sorted.length;
		while (low < high) {
			const middle = (low + high) >> 1;
			if ((sorted[middle]?.scroll ?? Number.POSITIVE_INFINITY) < scroll) {
				low = middle + 1;
			} else {
				high = middle;
			}
		}
		const candidates =
			direction === 1
				? [sorted[low] ?? null, sorted[low + 1] ?? null]
				: [sorted[low - 1] ?? null, sorted[low - 2] ?? null];
		const nearest =
			candidates
				.filter((point): point is SnapPoint => Boolean(point))
				.filter((point) => point.mode === "scroll-snap")
				.filter((point) => isSnapPointDirectionEnabled(point, direction))
				.sort(
					(left, right) =>
						Math.abs(left.scroll - scroll) - Math.abs(right.scroll - scroll),
				)[0] ?? null;
		if (!nearest) return null;
		const settings = resolveSnapSettings(nearest.settings, defaults.scrollSnap);
		if (!isSnapCaptured(nearest, scroll, direction, settings)) {
			return null;
		}
		return {
			delayMs: settings.delayMs,
			durationSeconds: settings.durationSeconds,
			forced: false,
			scroll: nearest.scroll,
		};
	};

	/**
	 * Resolves snap-mode targets when the camera has entered a transition.
	 *
	 * @param scroll - Current target scroll.
	 * @param direction - Current input direction.
	 * @param defaults - Reader-level snap defaults.
	 * @returns Forced transition snap target, or null outside snap transition ranges.
	 */
	function getTransitionTarget(
		scroll: number,
		direction: ScrollDirection,
		defaults: TaleSnapConfig,
	): ReaderSnapTarget | null {
		const match =
			sorted.find(
				(point) =>
					point.mode === "snap" &&
					point.transitionStart !== undefined &&
					point.transitionEnd !== undefined &&
					isSnapPointDirectionEnabled(point, direction) &&
					scroll >= point.transitionStart &&
					scroll <= point.transitionEnd &&
					(direction === 1
						? point.type === "block-start"
						: point.type === "block-end"),
			) ?? null;
		if (!match) return null;
		const settings = resolveSnapSettings(match.settings, defaults.snap);
		if (!isSnapCaptured(match, scroll, direction, settings, true)) {
			return null;
		}
		return {
			delayMs: settings.delayMs,
			durationSeconds: settings.durationSeconds,
			forced: true,
			scroll: match.scroll,
		};
	}

	return { getSnapTarget };
}

/**
 * Checks whether a snap point applies to the current travel direction.
 *
 * @param point - Candidate snap point.
 * @param direction - Current input direction.
 * @returns True when the authored block allows snapping from that side.
 *
 * @example
 * if (isSnapPointDirectionEnabled(point, 1)) snap();
 */
function isSnapPointDirectionEnabled(
	point: SnapPoint,
	direction: ScrollDirection,
): boolean {
	const snapDirection = point.direction ?? "both";
	if (snapDirection === "both") return true;
	return direction === 1
		? snapDirection === "fromPrevious"
		: snapDirection === "fromNext";
}

/**
 * Checks whether a snap point has captured the current target scroll.
 *
 * @param point - Candidate snap point.
 * @param scroll - Current target scroll.
 * @param direction - Current input direction.
 * @param settings - Effective snap settings.
 * @param forceWhenUnset - Whether snap should capture when no threshold is set.
 * @returns True when pixel distance or visible transition fraction captures.
 *
 * @example
 * if (isSnapCaptured(point, scroll, 1, settings)) snap();
 */
function isSnapCaptured(
	point: SnapPoint,
	scroll: number,
	direction: ScrollDirection,
	settings: {
		capturePx: number | null;
		minViewportFraction: number | null;
	},
	forceWhenUnset = false,
): boolean {
	const capturePx = settings.capturePx;
	const minViewportFraction = settings.minViewportFraction;
	const hasPixelCapture = capturePx !== null;
	const hasFractionCapture = minViewportFraction !== null;
	const pixelCaptured =
		capturePx !== null && Math.abs(point.scroll - scroll) <= capturePx;
	const fractionCaptured =
		minViewportFraction !== null &&
		getTransitionVisibleFraction(point, scroll, direction) >=
			Math.max(minViewportFraction, 0);

	if (pixelCaptured || fractionCaptured) return true;
	return forceWhenUnset && !hasPixelCapture && !hasFractionCapture;
}

/**
 * Estimates transition target visibility through timeline progress.
 *
 * @param point - Candidate snap point with optional transition bounds.
 * @param scroll - Current target scroll.
 * @param direction - Current input direction.
 * @returns Visible fraction from 0 to 1, or -1 when unavailable.
 *
 * @example
 * const visible = getTransitionVisibleFraction(point, scroll, 1);
 */
function getTransitionVisibleFraction(
	point: SnapPoint,
	scroll: number,
	direction: ScrollDirection,
): number {
	if (
		point.transitionStart === undefined ||
		point.transitionEnd === undefined
	) {
		return -1;
	}
	const length = point.transitionEnd - point.transitionStart;
	if (length <= 0) return -1;
	const progress = (scroll - point.transitionStart) / length;
	if (direction === 1 && point.type === "block-start") {
		return clamp01(progress);
	}
	if (direction === -1 && point.type === "block-end") {
		return clamp01(1 - progress);
	}
	return -1;
}

/**
 * Clamps a number to normalized progress.
 *
 * @param value - Unbounded progress value.
 * @returns Value clamped between 0 and 1.
 *
 * @example
 * const progress = clamp01(rawProgress);
 */
function clamp01(value: number): number {
	return Math.min(1, Math.max(0, value));
}
