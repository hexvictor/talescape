"use client";

import { clamp } from "../services/readerMath";

type ScrollMotion = { cancel: () => void };

type ScrollDriverUpdateListener = () => void;

type TravelEasing = "ease-out" | "linear";

export type ReaderScrollDriver = ReturnType<typeof createReaderScrollDriver>;

const smoothSettledPx = 0.35;
const smoothFollowStrength = 0.15;
const smoothMaximumFollowStrength = 0.28;
const smoothBaseMaxFrameStepPx = 360;
const smoothMaximumFrameStepPx = 3000;
const backlogAccelerationDistancePx = 14000;

/**
 * Resolves adaptive virtual-scroll movement from the remaining target backlog.
 *
 * @param distance - Signed distance between rendered and requested scroll.
 * @returns Signed pixels to advance during the next frame.
 *
 * @example
 * const step = getSmoothFrameStep(4200);
 */
function getSmoothFrameStep(distance: number): number {
	const backlogRatio = clamp(
		Math.abs(distance) / backlogAccelerationDistancePx,
		0,
		1,
	);
	const followStrength =
		smoothFollowStrength +
		(smoothMaximumFollowStrength - smoothFollowStrength) * backlogRatio;
	const maximumFrameStep =
		smoothBaseMaxFrameStepPx +
		(smoothMaximumFrameStepPx - smoothBaseMaxFrameStepPx) * backlogRatio;
	return clamp(distance * followStrength, -maximumFrameStep, maximumFrameStep);
}

/**
 * Creates a virtual scroll driver that eases rendered scroll toward a target.
 *
 * @returns A reader scroll driver used by the input bindings and camera engine.
 *
 * @example
 * const driver = createReaderScrollDriver();
 * driver.setUpdateListener(() => renderAt(driver.getScroll()));
 */
export function createReaderScrollDriver() {
	let activeMotion: ScrollMotion | null = null;
	let currentScroll = window.scrollY;
	let frameId: number | null = null;
	let targetScroll = window.scrollY;
	let updateListener: ScrollDriverUpdateListener | null = null;

	/**
	 * Reads the maximum scrollable timeline distance from the document spacer.
	 *
	 * @returns The maximum scroll value allowed by the current reader layout.
	 *
	 * @example
	 * const max = getMaxScroll();
	 */
	const getMaxScroll = (): number =>
		Math.max(
			0,
			document.documentElement.scrollHeight -
				(window.innerHeight || document.documentElement.clientHeight),
		);

	/**
	 * Notifies the reader engine that the virtual scroll value changed.
	 *
	 * @returns Nothing.
	 *
	 * @example
	 * notifyUpdate();
	 */
	const notifyUpdate = (): void => {
		updateListener?.();
	};

	/**
	 * Stops the current virtual easing loop.
	 *
	 * @returns Nothing.
	 *
	 * @example
	 * stopFrameLoop();
	 */
	const stopFrameLoop = (): void => {
		if (frameId === null) return;
		window.cancelAnimationFrame(frameId);
		frameId = null;
	};

	/**
	 * Starts the virtual easing loop when the target differs from current scroll.
	 *
	 * @returns Nothing.
	 *
	 * @example
	 * startFrameLoop();
	 */
	const startFrameLoop = (): void => {
		if (frameId !== null) return;
		const advance = () => {
			const distance = targetScroll - currentScroll;
			if (Math.abs(distance) <= smoothSettledPx) {
				currentScroll = targetScroll;
				frameId = null;
				notifyUpdate();
				return;
			}
			const frameStep = getSmoothFrameStep(distance);
			currentScroll = clamp(currentScroll + frameStep, 0, getMaxScroll());
			notifyUpdate();
			frameId = window.requestAnimationFrame(advance);
		};
		frameId = window.requestAnimationFrame(advance);
	};

	/**
	 * Reads the currently rendered scroll position.
	 *
	 * @returns The eased virtual scroll value currently shown by the reader.
	 *
	 * @example
	 * const scroll = driver.getScroll();
	 */
	const getScroll = (): number => currentScroll;

	/**
	 * Reads the requested scroll target, including queued smooth movement.
	 *
	 * @returns The target position currently pursued by the driver.
	 *
	 * @example
	 * const target = driver.getTargetScroll();
	 */
	const getTargetScroll = (): number => targetScroll;

	/**
	 * Immediately moves both target and rendered scroll to a value.
	 *
	 * @param value - The scroll value to set.
	 * @returns Nothing.
	 *
	 * @example
	 * driver.setScroll(1200);
	 */
	const setScroll = (value: number): void => {
		const next = clamp(value, 0, getMaxScroll());
		stopFrameLoop();
		currentScroll = next;
		targetScroll = next;
		window.scrollTo({ behavior: "auto", top: next });
		notifyUpdate();
	};

	/**
	 * Cancels any currently running virtual movement.
	 *
	 * @returns Nothing.
	 *
	 * @example
	 * driver.cancelMotion();
	 */
	const cancelMotion = (): void => {
		activeMotion?.cancel();
		activeMotion = null;
		targetScroll = currentScroll;
		stopFrameLoop();
	};

	/**
	 * Moves the target scroll, either instantly or through eased virtual follow.
	 *
	 * @param nextTargetScroll - The scroll target requested by input or navigation.
	 * @param behavior - Whether the movement should be instant or eased.
	 * @returns A cancelable motion handle, or null when no movement is needed.
	 *
	 * @example
	 * driver.scrollTo(3000, "smooth", { duration: 0.4 });
	 */
	const scrollTo = (
		nextTargetScroll: number,
		behavior: ScrollBehavior,
		_options?: { duration?: number },
	): ScrollMotion | null => {
		const next = clamp(nextTargetScroll, 0, getMaxScroll());
		activeMotion?.cancel();
		if (behavior !== "smooth") {
			setScroll(next);
			return null;
		}
		targetScroll = next;
		if (Math.abs(targetScroll - currentScroll) < 1) return null;
		const motion = {
			cancel: () => {
				targetScroll = currentScroll;
				stopFrameLoop();
			},
		};
		activeMotion = motion;
		startFrameLoop();
		return motion;
	};

	/**
	 * Moves the rendered scroll over a fixed duration independently of distance.
	 *
	 * @param nextTargetScroll - Timeline position to reach.
	 * @param durationSeconds - Travel duration in seconds.
	 * @param onComplete - Callback invoked after reaching the target.
	 * @param onCancel - Callback invoked when another input interrupts travel.
	 * @param easing - Progress curve used during fixed-duration travel.
	 * @returns Cancelable travel motion.
	 *
	 * @example
	 * driver.travelTo(8000, 0.7, startArrival);
	 */
	const travelTo = (
		nextTargetScroll: number,
		durationSeconds: number,
		onComplete?: () => void,
		onCancel?: () => void,
		easing: TravelEasing = "ease-out",
	): ScrollMotion => {
		activeMotion?.cancel();
		stopFrameLoop();
		const start = currentScroll;
		const next = clamp(nextTargetScroll, 0, getMaxScroll());
		const distance = next - start;
		const durationMs = Math.max(durationSeconds * 1000, 1);
		const startedAt = performance.now();
		let travelFrame: number | null = null;
		let cancelled = false;

		const motion: ScrollMotion = {
			cancel: () => {
				if (cancelled) return;
				cancelled = true;
				window.cancelAnimationFrame(travelFrame ?? 0);
				travelFrame = null;
				targetScroll = currentScroll;
				onCancel?.();
			},
		};
		activeMotion = motion;
		targetScroll = next;

		const advance = (now: number): void => {
			if (cancelled) return;
			const progress = clamp((now - startedAt) / durationMs, 0, 1);
			const eased = easing === "linear" ? progress : 1 - (1 - progress) ** 3;
			currentScroll = clamp(start + distance * eased, 0, getMaxScroll());
			notifyUpdate();
			if (progress < 1) {
				travelFrame = window.requestAnimationFrame(advance);
				return;
			}
			travelFrame = null;
			activeMotion = null;
			currentScroll = next;
			targetScroll = next;
			notifyUpdate();
			onComplete?.();
		};

		travelFrame = window.requestAnimationFrame(advance);
		return motion;
	};

	return {
		cancelMotion,
		cleanup: () => {
			cancelMotion();
			updateListener = null;
		},
		getMaxScroll,
		getScroll,
		getTargetScroll,
		scrollTo,
		setScroll,
		setUpdateListener: (listener: ScrollDriverUpdateListener | null) => {
			updateListener = listener;
		},
		syncLayout: () => {
			targetScroll = clamp(targetScroll, 0, getMaxScroll());
			currentScroll = clamp(currentScroll, 0, getMaxScroll());
			notifyUpdate();
		},
		travelTo,
	};
}
