import { clamp } from "../services/readerMath";
import type {
	Anchor,
	CompiledReader,
	ReaderScrollTargetOptions,
	ViewportSize,
} from "../types";
import type { ReaderScrollDriver } from "./scrollDriver";

const fallbackArrivalViewportSpans = 0.8;
const defaultArrivalDurationSeconds = 0.42;
const defaultTravelDurationSeconds = 0.72;
const travelSecondsPerEstimatedBlock = 0.1;
const maximumTravelDurationSeconds = 4;

type NavigationTarget = {
	approachScroll: number | null;
	targetAnchor: Anchor;
	targetScroll: number;
};

type ReaderNavigationMotionOptions = {
	onNavigationStart: () => void;
	onTravelEnd: () => void;
	onTravelStart: (targetAnchor: Anchor) => void;
};

/**
 * Creates reader navigation modes for ordinary reading, accelerated travel,
 * and instant teleportation.
 *
 * @param compiled - Current compiled reader timeline.
 * @param driver - Scroll driver used to move through the timeline.
 * @param viewport - Current viewport dimensions.
 * @param lifecycle - Hooks used to enable lightweight travel rendering.
 * @returns Navigation methods and cleanup.
 *
 * @example
 * const navigation = createReaderNavigationMotion(compiled, driver, viewport, {
 *   onTravelStart: mountDestination,
 *   onTravelEnd: restoreFullRendering,
 * });
 */
export function createReaderNavigationMotion(
	compiled: CompiledReader,
	driver: ReaderScrollDriver,
	viewport: ViewportSize,
	lifecycle: ReaderNavigationMotionOptions,
): {
	cleanup: () => void;
	scrollToBlock: (blockId: string, options?: ReaderScrollTargetOptions) => void;
	scrollToTimelineEdge: (edge: "end" | "start") => void;
} {
	const viewportSpan = Math.max(viewport.width, viewport.height, 1);
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	let navigationRevision = 0;

	const cancelNavigation = (): void => {
		navigationRevision += 1;
		driver.cancelMotion();
		lifecycle.onTravelEnd();
	};

	const startDestinationArrival = (
		targetScroll: number,
		durationSeconds: number,
		revision: number,
	): void => {
		if (revision !== navigationRevision) return;
		lifecycle.onTravelEnd();
		driver.scrollTo(targetScroll, "smooth", {
			duration: durationSeconds,
		});
	};

	const getTravelDuration = (distance: number, duration?: number): number => {
		if (duration !== undefined) return duration;
		const estimatedBlockCount = Math.max(
			1,
			Math.ceil(
				(distance / Math.max(compiled.totalScroll, 1)) *
					compiled.anchors.length,
			),
		);
		return clamp(
			defaultTravelDurationSeconds +
				estimatedBlockCount * travelSecondsPerEstimatedBlock,
			defaultTravelDurationSeconds,
			maximumTravelDurationSeconds,
		);
	};

	const navigateToTarget = (
		target: NavigationTarget,
		options?: ReaderScrollTargetOptions,
	): void => {
		cancelNavigation();
		lifecycle.onNavigationStart();
		const revision = navigationRevision;
		const requestedMotion = options?.motion ?? "reading";
		const motion =
			prefersReducedMotion && requestedMotion === "travel"
				? "instant"
				: requestedMotion;

		if (motion === "instant") {
			driver.setScroll(target.targetScroll);
			return;
		}
		if (motion === "reading") {
			driver.scrollTo(target.targetScroll, "smooth", {
				duration: options?.duration ?? defaultArrivalDurationSeconds,
			});
			return;
		}

		const currentScroll = driver.getScroll();
		if (target.approachScroll === null) {
			const distance = Math.abs(target.targetScroll - currentScroll);
			if (distance < 1) {
				driver.setScroll(target.targetScroll);
				return;
			}
			lifecycle.onTravelStart(target.targetAnchor);
			driver.travelTo(
				target.targetScroll,
				getTravelDuration(distance, options?.duration),
				() => {
					if (revision === navigationRevision) lifecycle.onTravelEnd();
				},
				() => {
					if (revision === navigationRevision) lifecycle.onTravelEnd();
				},
			);
			return;
		}

		const approachDistance = Math.abs(target.approachScroll - currentScroll);
		if (approachDistance < 1) {
			startDestinationArrival(
				target.targetScroll,
				options?.duration ?? defaultArrivalDurationSeconds,
				revision,
			);
			return;
		}

		lifecycle.onTravelStart(target.targetAnchor);
		driver.travelTo(
			target.approachScroll,
			getTravelDuration(approachDistance, options?.duration),
			() =>
				startDestinationArrival(
					target.targetScroll,
					defaultArrivalDurationSeconds,
					revision,
				),
			() => {
				if (revision === navigationRevision) lifecycle.onTravelEnd();
			},
			"linear",
		);
	};

	const scrollToBlock = (
		blockId: string,
		options?: ReaderScrollTargetOptions,
	): void => {
		const anchor = compiled.anchorsByBlockId[blockId];
		if (!anchor) return;
		const targetScroll =
			options?.atChoiceEnd && anchor.block.isChoiceBlock
				? getReadingSegmentEnd(compiled, blockId, anchor.scroll)
				: anchor.scroll;
		const transitionIndex = compiled.transitionIntoByBlockId[blockId];
		const transition =
			transitionIndex === undefined ? null : compiled.segments[transitionIndex];
		const approachScroll =
			!options?.atChoiceEnd &&
			transition?.type === "transition" &&
			transition.start < targetScroll
				? transition.start
				: compiled.anchorIndexByBlockId[blockId] === 0
					? null
					: getFallbackApproach(
							targetScroll,
							driver.getScroll(),
							compiled.totalScroll,
							viewportSpan,
						);
		navigateToTarget(
			{ approachScroll, targetAnchor: anchor, targetScroll },
			options,
		);
	};

	const scrollToTimelineEdge = (edge: "end" | "start"): void => {
		const targetAnchor =
			edge === "start"
				? compiled.anchors[0]
				: compiled.anchors[compiled.anchors.length - 1];
		if (!targetAnchor) return;
		const targetScroll = edge === "start" ? 0 : compiled.totalScroll;
		navigateToTarget(
			{
				approachScroll: null,
				targetAnchor,
				targetScroll,
			},
			{ motion: "travel" },
		);
	};

	return {
		cleanup: cancelNavigation,
		scrollToBlock,
		scrollToTimelineEdge,
	};
}

/**
 * Finds the end of a block's reading segment.
 *
 * @param compiled - Current compiled timeline.
 * @param blockId - Target block identifier.
 * @param fallback - Value returned when the reading segment is unavailable.
 * @returns Reading segment end.
 */
function getReadingSegmentEnd(
	compiled: CompiledReader,
	blockId: string,
	fallback: number,
): number {
	const segmentIndex = compiled.segmentIndexByBlockId[blockId];
	const segment =
		segmentIndex === undefined ? null : compiled.segments[segmentIndex];
	return segment?.type === "reading" ? segment.end : fallback;
}

/**
 * Resolves a short approach point on the current side of a target.
 *
 * @param targetScroll - Final timeline target.
 * @param currentScroll - Current rendered scroll.
 * @param totalScroll - Maximum timeline scroll.
 * @param viewportSpan - Largest viewport dimension.
 * @returns Approach scroll or null when no distinct point exists.
 */
function getFallbackApproach(
	targetScroll: number,
	currentScroll: number,
	totalScroll: number,
	viewportSpan: number,
): number | null {
	const direction = targetScroll >= currentScroll ? 1 : -1;
	const approach = clamp(
		targetScroll - direction * viewportSpan * fallbackArrivalViewportSpans,
		0,
		totalScroll,
	);
	return Math.abs(approach - targetScroll) < 1 ? null : approach;
}
