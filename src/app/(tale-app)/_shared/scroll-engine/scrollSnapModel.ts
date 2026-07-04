import { resolveSnapSettings } from "../services/readerSnapSettings";
import type { SnapPoint } from "../types";
import type { TaleSnapConfig } from "../types";
import type { ViewportSize } from "../types";

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
 * @param viewport - Viewport used to resolve viewport-relative capture minimums.
 * @returns Snap target resolver used by the input controller.
 *
 * @example
 * const snapModel = createReaderSnapModel(compiled.snapPoints, viewport);
 */
export function createReaderSnapModel(
	points: SnapPoint[],
	viewport: ViewportSize,
) {
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
				.sort(
					(left, right) =>
						Math.abs(left.scroll - scroll) - Math.abs(right.scroll - scroll),
				)[0] ?? null;
		if (!nearest) return null;
		const settings = resolveSnapSettings(
			nearest.settings,
			defaults.scrollSnap,
			viewport,
		);
		if (Math.abs(nearest.scroll - scroll) > settings.capturePx) {
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
					scroll >= point.transitionStart &&
					scroll <= point.transitionEnd &&
					(direction === 1
						? point.type === "block-start"
						: point.type === "block-end"),
			) ?? null;
		if (!match) return null;
		const settings = resolveSnapSettings(
			match.settings,
			defaults.snap,
			viewport,
		);
		return {
			delayMs: settings.delayMs,
			durationSeconds: settings.durationSeconds,
			forced: true,
			scroll: match.scroll,
		};
	}

	return { getSnapTarget };
}
