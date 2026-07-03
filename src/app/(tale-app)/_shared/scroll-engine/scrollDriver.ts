"use client";

import { gsap } from "gsap";
import { clamp } from "../services/readerMath";

type ScrollMotion = { cancel: () => void };

type ScrollDriverUpdateListener = () => void;

type TravelEasing = "ease-out" | "linear";

export type ReaderScrollDriver = ReturnType<typeof createReaderScrollDriver>;

type ReaderScrollDriverOptions = {
	maxScroll?: number;
	scrollRoot?: HTMLElement | null;
};

const smoothScrollMinimumDurationSeconds = 0.18;
const smoothScrollMaximumDurationSeconds = 0.56;
const smoothScrollDistanceForMaximumDurationPx = 2200;

/**
 * Resolves ordinary smooth-scroll tween duration from requested duration and distance.
 *
 * @param distancePx - Absolute distance between current and target scroll.
 * @param requestedDurationSeconds - Optional duration requested by the input adapter.
 * @returns Duration in seconds for a non-travel smooth scroll tween.
 *
 * @example
 * const duration = getSmoothScrollDuration(420, 0.18);
 */
function getSmoothScrollDuration(
	distancePx: number,
	requestedDurationSeconds?: number,
): number {
	const distanceRatio = clamp(
		distancePx / smoothScrollDistanceForMaximumDurationPx,
		0,
		1,
	);
	const distanceDuration =
		smoothScrollMinimumDurationSeconds +
		(smoothScrollMaximumDurationSeconds - smoothScrollMinimumDurationSeconds) *
			distanceRatio;
	const maximumDuration = Math.max(
		smoothScrollMaximumDurationSeconds,
		requestedDurationSeconds ?? 0,
	);
	return clamp(
		Math.max(requestedDurationSeconds ?? 0, distanceDuration),
		smoothScrollMinimumDurationSeconds,
		maximumDuration,
	);
}

/**
 * Creates the GSAP-backed virtual scroll driver used by the reader camera.
 *
 * The driver owns one virtual scroll value. Native document scrolling is not
 * allowed to drive the reader camera, which prevents native-scroll correction
 * from fighting the timeline engine.
 *
 * @param options - Driver options.
 * @param options.maxScroll - Maximum compiled timeline scroll.
 * @param options.scrollRoot - Optional reader root used only for initial native-position recovery.
 * @returns A reader scroll driver used by the input bindings and camera engine.
 *
 * @example
 * const driver = createReaderScrollDriver({ maxScroll: compiled.totalScroll });
 * driver.setUpdateListener(() => renderAt(driver.getScroll()));
 */
export function createReaderScrollDriver({
	maxScroll: initialMaxScroll = 0,
	scrollRoot = null,
}: ReaderScrollDriverOptions = {}) {
	let activeMotion: ScrollMotion | null = null;
	let activeTween: gsap.core.Tween | null = null;
	let maxScroll = Math.max(0, initialMaxScroll);
	let currentScroll = clamp(getNativeScroll(scrollRoot), 0, maxScroll);
	let targetScroll = currentScroll;
	let updateListener: ScrollDriverUpdateListener | null = null;
	const virtualScroll = { value: currentScroll };

	/**
	 * Reads the maximum virtual timeline distance.
	 *
	 * @returns The maximum scroll value allowed by the current reader layout.
	 *
	 * @example
	 * const max = getMaxScroll();
	 */
	const getMaxScroll = (): number => maxScroll;

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
	 * Stops the active GSAP tween without changing the virtual scroll value.
	 *
	 * @returns Nothing.
	 *
	 * @example
	 * stopTween();
	 */
	const stopTween = (): void => {
		activeTween?.kill();
		activeTween = null;
	};

	/**
	 * Applies a virtual scroll value and notifies the reader engine.
	 *
	 * @param value - Next virtual scroll value.
	 * @returns Nothing.
	 *
	 * @example
	 * setCurrentScroll(120);
	 */
	const setCurrentScroll = (value: number): void => {
		currentScroll = clamp(value, 0, getMaxScroll());
		virtualScroll.value = currentScroll;
		notifyUpdate();
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
		activeMotion?.cancel();
		activeMotion = null;
		stopTween();
		targetScroll = next;
		setCurrentScroll(next);
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
		stopTween();
	};

	/**
	 * Moves the target scroll, either instantly or through GSAP easing.
	 *
	 * @param nextTargetScroll - The scroll target requested by input or navigation.
	 * @param behavior - Whether the movement should be instant or eased.
	 * @param options - Optional smooth movement duration.
	 * @returns A cancelable motion handle, or null when no movement is needed.
	 *
	 * @example
	 * driver.scrollTo(3000, "smooth", { duration: 0.4 });
	 */
	const scrollTo = (
		nextTargetScroll: number,
		behavior: ScrollBehavior,
		options?: { duration?: number },
	): ScrollMotion | null => {
		const next = clamp(nextTargetScroll, 0, getMaxScroll());
		activeMotion?.cancel();
		activeMotion = null;
		if (behavior !== "smooth") {
			setScroll(next);
			return null;
		}
		targetScroll = next;
		if (Math.abs(targetScroll - currentScroll) < 1) return null;

		const durationSeconds = getSmoothScrollDuration(
			Math.abs(targetScroll - currentScroll),
			options?.duration,
		);
		let cancelled = false;
		const motion = {
			cancel: () => {
				if (cancelled) return;
				cancelled = true;
				targetScroll = currentScroll;
				stopTween();
				if (activeMotion === motion) activeMotion = null;
			},
		};

		activeMotion = motion;
		stopTween();
		virtualScroll.value = currentScroll;
		activeTween = gsap.to(virtualScroll, {
			duration: durationSeconds,
			ease: "power2.out",
			onComplete: () => {
				if (cancelled) return;
				activeTween = null;
				if (activeMotion === motion) activeMotion = null;
				targetScroll = next;
				setCurrentScroll(next);
			},
			onUpdate: () => setCurrentScroll(virtualScroll.value),
			overwrite: true,
			value: next,
		});
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
		activeMotion = null;
		stopTween();
		const next = clamp(nextTargetScroll, 0, getMaxScroll());
		let cancelled = false;

		const motion: ScrollMotion = {
			cancel: () => {
				if (cancelled) return;
				cancelled = true;
				stopTween();
				targetScroll = currentScroll;
				if (activeMotion === motion) activeMotion = null;
				onCancel?.();
			},
		};

		activeMotion = motion;
		targetScroll = next;
		virtualScroll.value = currentScroll;
		activeTween = gsap.to(virtualScroll, {
			duration: Math.max(durationSeconds, 0.01),
			ease: easing === "linear" ? "none" : "power3.out",
			onComplete: () => {
				if (cancelled) return;
				activeTween = null;
				if (activeMotion === motion) activeMotion = null;
				targetScroll = next;
				setCurrentScroll(next);
				onComplete?.();
			},
			onUpdate: () => setCurrentScroll(virtualScroll.value),
			overwrite: true,
			value: next,
		});
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
		setMaxScroll: (value: number) => {
			maxScroll = Math.max(0, value);
			targetScroll = clamp(targetScroll, 0, getMaxScroll());
			setCurrentScroll(clamp(currentScroll, 0, getMaxScroll()));
		},
		setScroll,
		setUpdateListener: (listener: ScrollDriverUpdateListener | null) => {
			updateListener = listener;
		},
		syncLayout: () => {
			targetScroll = clamp(targetScroll, 0, getMaxScroll());
			setCurrentScroll(clamp(currentScroll, 0, getMaxScroll()));
		},
		travelTo,
	};
}

/**
 * Reads native scroll once so refresh/browser restore does not produce a jump
 * before the engine applies the saved virtual reader position.
 *
 * @param scrollRoot - Optional scoped scroll element.
 * @returns Current native scroll offset.
 *
 * @example
 * const scroll = getNativeScroll(scrollRoot);
 */
function getNativeScroll(scrollRoot: HTMLElement | null): number {
	return scrollRoot ? scrollRoot.scrollTop : window.scrollY;
}
