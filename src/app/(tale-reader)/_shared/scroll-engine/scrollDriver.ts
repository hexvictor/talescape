"use client";

import { clamp } from "../services/readerMath";

type ScrollMotion = { cancel: () => void };

type ScrollDriverUpdateListener = () => void;

export type ReaderScrollDriver = ReturnType<typeof createReaderScrollDriver>;

const smoothSettledPx = 0.35;
const smoothFollowStrength = 0.18;
const smoothMaxFrameStepPx = 520;

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
			const frameStep = clamp(
				distance * smoothFollowStrength,
				-smoothMaxFrameStepPx,
				smoothMaxFrameStepPx,
			);
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

	return {
		cancelMotion,
		cleanup: () => {
			cancelMotion();
			updateListener = null;
		},
		getMaxScroll,
		getScroll,
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
	};
}
