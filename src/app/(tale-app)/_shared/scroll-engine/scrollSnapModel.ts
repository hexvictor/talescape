import { resolveSnapSettings } from "../services/readerSnapSettings";
import type { SnapPoint, TaleSnapConfig, TimelineSegment } from "../types";

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
 * @param segments - Ordered timeline segments used to identify scroll intent.
 * @returns Snap target resolver used by the input controller.
 *
 * @example
 * const snapModel = createReaderSnapModel(
 *   compiled.snapPoints,
 *   compiled.segments,
 * );
 */
export function createReaderSnapModel(
	points: SnapPoint[],
	segments: TimelineSegment[],
) {
	const sorted = [...points].sort((left, right) => left.scroll - right.scroll);

	const getSnapTarget = (
		scroll: number,
		direction: ScrollDirection,
		defaults: TaleSnapConfig,
		fromScroll = scroll,
	): ReaderSnapTarget | null => {
		const transition = getCrossedTransition(
			segments,
			fromScroll,
			scroll,
			direction,
		);
		const transitionTarget = getTransitionTarget(
			transition,
			direction,
			defaults,
		);
		if (transitionTarget) return transitionTarget;
		const intendedBlockId = transition
			? direction === 1
				? transition.toBlockId
				: transition.fromBlockId
			: getCrossedChoiceBlockId(sorted, fromScroll, scroll, direction);
		if (!intendedBlockId) return null;

		const nearest =
			sorted
				.filter((point) => point.blockId === intendedBlockId)
				.filter((point) => point.mode === "scroll-snap")
				.filter((point) => isSnapPointDirectionEnabled(point, direction))
				.sort(
					(left, right) =>
						Math.abs(left.scroll - scroll) - Math.abs(right.scroll - scroll),
				)[0] ?? null;
		if (!nearest) return null;
		const settings = resolveSnapSettings(nearest.settings, defaults.scrollSnap);
		if (!transition && !isSnapCaptured(nearest, scroll, direction, settings)) {
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
	 * @param transition - Direct transition crossed by the proposed movement.
	 * @param direction - Current input direction.
	 * @param defaults - Reader-level snap defaults.
	 * @returns Forced transition snap target, or null outside snap transition ranges.
	 */
	function getTransitionTarget(
		transition: Extract<TimelineSegment, { type: "transition" }> | null,
		direction: ScrollDirection,
		defaults: TaleSnapConfig,
	): ReaderSnapTarget | null {
		if (!transition) return null;
		const blockId =
			direction === 1 ? transition.toBlockId : transition.fromBlockId;
		if (!blockId) return null;
		const match =
			sorted.find(
				(point) =>
					point.blockId === blockId &&
					point.mode === "snap" &&
					point.transitionStart !== undefined &&
					point.transitionEnd !== undefined &&
					isSnapPointDirectionEnabled(point, direction) &&
					(direction === 1
						? point.type === "block-start"
						: point.type === "block-end"),
			) ?? null;
		if (!match) return null;
		const settings = resolveSnapSettings(match.settings, defaults.snap);
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
 * Finds the first transition crossed by one proposed input movement.
 *
 * A movement wholly contained by reading or pause segments returns no
 * transition, regardless of nearby snap-point capture distances.
 */
function getCrossedTransition(
	segments: TimelineSegment[],
	fromScroll: number,
	targetScroll: number,
	direction: ScrollDirection,
): Extract<TimelineSegment, { type: "transition" }> | null {
	const transitions = segments.filter(
		(
			segment,
		): segment is Extract<TimelineSegment, { type: "transition" }> =>
			segment.type === "transition",
	);
	const ordered = direction === 1 ? transitions : transitions.reverse();
	return (
		ordered.find((segment) => {
			return direction === 1
				? fromScroll < segment.end && targetScroll >= segment.start
				: fromScroll > segment.start && targetScroll <= segment.end;
		}) ?? null
	);
}

/**
 * Finds a choice boundary crossed without a following transition.
 */
function getCrossedChoiceBlockId(
	points: SnapPoint[],
	fromScroll: number,
	targetScroll: number,
	direction: ScrollDirection,
): string | null {
	const ordered = direction === 1 ? points : [...points].reverse();
	return (
		ordered.find(
			(point) =>
				point.type === "choice-end" &&
				isSnapPointDirectionEnabled(point, direction) &&
				(direction === 1
					? fromScroll < point.scroll && targetScroll >= point.scroll
					: fromScroll > point.scroll && targetScroll <= point.scroll),
		)?.blockId ?? null
	);
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
	return !hasPixelCapture && !hasFractionCapture;
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
