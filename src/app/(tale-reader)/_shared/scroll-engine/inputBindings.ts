"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReaderInputBindingSettings } from "./readerInputSettings";
import type { ScrollSnapItem, ScrollSnapModelApi } from "./scrollSnapModel";

type Driver = {
	getScroll: () => number;
	setScroll: (value: number) => void;
	scrollTo: (
		targetScroll: number,
		opts: { duration: number; ease: gsap.EaseString; onDone?: () => void },
	) => gsap.core.Tween | null;
};

export type InputBindingsApi = {
	disable: () => void;
	enable: () => void;
	killTweens: (setNotAnimating?: boolean) => void;
	cleanup: () => void;
};

type Args = {
	driver: Driver;
	getSettings: () => ReaderInputBindingSettings;
	model: ScrollSnapModelApi;
};

type KeyboardDirection = 1 | -1;
type ScrollDirection = 1 | -1;

const wheelListenerOptions = {
	capture: true,
	passive: false,
} as const;

/**
 * Attaches reader input controls for wheel, touch, pointer interruption, and
 * keyboard navigation.
 *
 * @param driver - Scroll driver used to read the current virtual scroll and
 * animate toward target positions.
 * @param model - Current snap model used to move between snap-enabled blocks.
 *
 * The reader needs custom input handling because pinned sections and branch
 * mounts can make native browser scrolling feel inconsistent. This layer keeps
 * all user input paths tied to the same snap and tween cleanup rules.
 */
export function attachInputBindings({
	driver,
	getSettings,
	model,
}: Args): InputBindingsApi {
	let enabled = true;
	let isSnapAnimationRunning = false;
	let isTouchPressing = false;
	let touchDragDirection: ScrollDirection | null = null;
	let touchReleaseTimerId: number | null = null;
	let touchDragStartedAt = 0;
	let touchDragStartedScroll = 0;
	let touchStartY: number | null = null;
	let touchLastY: number | null = null;
	let keyboardDirection: KeyboardDirection | null = null;
	let keyboardStepCount = 0;
	let keyboardHoldTimerId: number | null = null;
	let snapAfterKeyboardTween: KeyboardDirection | null = null;
	let wheelBurstDirection: ScrollDirection | null = null;
	let wheelBurstCount = 0;
	let wheelBurstStartedAt = 0;
	let wheelBurstStartedScroll = 0;
	let wheelSustainedBoostStartCount: number | null = null;
	let wheelStopTimerId: number | null = null;

	// A GSAP tween is the short-lived animation object that moves the
	// virtual scroll value to the next snap point.
	let activeSnapTween: gsap.core.Tween | null = null;
	let keyboardTween: gsap.core.Tween | null = null;
	let wheelTween: gsap.core.Tween | null = null;
	let snapObserver: ReturnType<typeof ScrollTrigger.observe> | null = null;

	const clearKeyboardHoldTimer = () => {
		if (keyboardHoldTimerId == null) return;

		window.clearInterval(keyboardHoldTimerId);
		keyboardHoldTimerId = null;
	};

	const resetKeyboardHold = () => {
		clearKeyboardHoldTimer();
		keyboardDirection = null;
		keyboardStepCount = 0;
	};

	const clearTouchReleaseTimer = () => {
		if (touchReleaseTimerId == null) return;

		window.clearTimeout(touchReleaseTimerId);
		touchReleaseTimerId = null;
	};

	const resetTouchDrag = () => {
		touchDragDirection = null;
		touchDragStartedAt = 0;
		touchDragStartedScroll = 0;
		touchStartY = null;
		touchLastY = null;
	};

	const clearWheelStopTimer = () => {
		if (wheelStopTimerId == null) return;

		window.clearTimeout(wheelStopTimerId);
		wheelStopTimerId = null;
	};

	const resetWheelBurst = () => {
		wheelBurstDirection = null;
		wheelBurstCount = 0;
		wheelBurstStartedAt = 0;
		wheelBurstStartedScroll = 0;
		wheelSustainedBoostStartCount = null;
	};

	const killSnapTween = () => {
		if (!activeSnapTween) return;

		activeSnapTween.kill();
		activeSnapTween = null;
	};

	const killKeyboardTween = () => {
		if (!keyboardTween) return;

		keyboardTween.kill();
		keyboardTween = null;
	};

	const killWheelTween = () => {
		if (!wheelTween) return;

		wheelTween.kill();
		wheelTween = null;
	};

	const killTweens = (setNotAnimating = false) => {
		killSnapTween();
		killKeyboardTween();
		killWheelTween();
		resetKeyboardHold();
		clearTouchReleaseTimer();
		resetTouchDrag();
		snapAfterKeyboardTween = null;
		clearWheelStopTimer();
		resetWheelBurst();

		if (setNotAnimating) {
			isSnapAnimationRunning = false;
		}
	};

	const gotoSnapItem = (target: ScrollSnapItem, forward: boolean) => {
		isSnapAnimationRunning = true;
		resetKeyboardHold();
		killKeyboardTween();
		killWheelTween();

		const targetScroll = forward ? target.start : target.end;

		killSnapTween();
		killKeyboardTween();
		killWheelTween();

		activeSnapTween = driver.scrollTo(targetScroll, {
			duration: getSettings().snapDuration,
			ease: getSettings().snapEase,
			onDone: () => {
				activeSnapTween = null;
				isSnapAnimationRunning = false;
			},
		});

		if (!activeSnapTween) {
			isSnapAnimationRunning = false;
		}
	};

	const getSnapEpsilon = () => (ScrollTrigger.isTouch ? 60 : 20);

	const getDirectionalSnapTarget = (
		direction: ScrollDirection,
		immediate: boolean,
	): ScrollSnapItem | null => {
		const current = driver.getScroll();
		const epsilon = getSnapEpsilon();
		if (!immediate) {
			return model.getNearbySnapItem(direction, current, epsilon);
		}

		const adjacentItem = model.getAdjacentItem(direction, current);
		return adjacentItem?.snap ? adjacentItem : null;
	};

	function tryStep(forward: boolean, opts?: { immediate?: boolean }) {
		if (!enabled) return false;
		if (isSnapAnimationRunning) return false;

		const direction: ScrollDirection = forward ? 1 : -1;
		const target = getDirectionalSnapTarget(direction, !!opts?.immediate);
		if (!target) return false;

		gotoSnapItem(target, forward);
		return true;
	}

	const getWheelIdleSnapTarget = (
		direction: ScrollDirection,
		burstCount: number,
		burstStartedScroll: number,
	): ScrollSnapItem | null => {
		const current = driver.getScroll();
		const burstThreshold = getSettings().wheelSnapBypassBurstCount;
		if (burstCount > burstThreshold) {
			return model.getBestVisibleSnapItem(direction, current);
		}

		const adjacentItem = model.getAdjacentItem(direction, burstStartedScroll);
		return adjacentItem?.snap ? adjacentItem : null;
	};

	const tryWheelIdleSnap = (
		direction: ScrollDirection,
		burstCount: number,
		burstStartedScroll: number,
	) => {
		if (!enabled) return false;
		if (isSnapAnimationRunning) return false;

		const target = getWheelIdleSnapTarget(
			direction,
			burstCount,
			burstStartedScroll,
		);
		if (!target) return false;

		gotoSnapItem(target, direction > 0);
		return true;
	};

	const selectionIsActive = () => {
		const selection = window.getSelection?.();
		return (
			!!selection && !selection.isCollapsed && selection.toString().length > 0
		);
	};

	const isSelectableZone = (target: EventTarget | null) => {
		const el = target as HTMLElement | null;
		if (!el) return false;
		return !!el.closest(
			".select-text, input, textarea, [contenteditable='true']",
		);
	};

	const isInteractiveTarget = (target: EventTarget | null) => {
		const el = target as HTMLElement | null;
		if (!el) return false;
		return !!el.closest(
			"input, textarea, select, button, a, [role='button'], [contenteditable='true']",
		);
	};

	const isReaderWheelTarget = (target: EventTarget | null) => {
		const el = target as HTMLElement | null;
		return !!el?.closest("#smooth-wrapper");
	};

	const getKeyboardDirection = (key: string): KeyboardDirection | null => {
		if (key === "ArrowDown" || key === "ArrowRight") return 1;
		if (key === "ArrowUp" || key === "ArrowLeft") return -1;
		return null;
	};

	const finishKeyboardTween = (direction: KeyboardDirection) => {
		keyboardTween = null;

		if (snapAfterKeyboardTween !== direction) return;

		snapAfterKeyboardTween = null;
		tryStep(direction > 0);
	};

	const getSustainedAcceleration = ({
		accelerationCount,
		accelerationPx,
		boostStartCount,
		multiplier,
	}: {
		accelerationCount: number;
		accelerationPx: number;
		boostStartCount: number | null;
		multiplier: number;
	}) => {
		if (boostStartCount == null) {
			return accelerationCount * accelerationPx;
		}

		const normalCount = Math.min(accelerationCount, boostStartCount);
		const boostedCount = Math.max(0, accelerationCount - normalCount);

		return (
			normalCount * accelerationPx + boostedCount * accelerationPx * multiplier
		);
	};

	const scrollByKeyboard = (direction: KeyboardDirection) => {
		if (!enabled) return;

		if (isSnapAnimationRunning) {
			killSnapTween();
			isSnapAnimationRunning = false;
		}

		const current = driver.getScroll();
		const max = ScrollTrigger.maxScroll(window);
		const {
			keyboardAccelerationPx,
			keyboardBaseStepPx,
			keyboardHoldIntervalMs,
			keyboardMaxStepPx,
			keyboardSustainedAccelerationDelayMs,
			keyboardSustainedAccelerationMultiplier,
		} = getSettings();
		const sustainedBoostStartCount = Math.ceil(
			keyboardSustainedAccelerationDelayMs / keyboardHoldIntervalMs,
		);
		const acceleration = getSustainedAcceleration({
			accelerationCount: keyboardStepCount,
			accelerationPx: keyboardAccelerationPx,
			boostStartCount: sustainedBoostStartCount,
			multiplier: keyboardSustainedAccelerationMultiplier,
		});
		const step = Math.min(keyboardMaxStepPx, keyboardBaseStepPx + acceleration);
		const target = Math.max(0, Math.min(max, current + direction * step));

		keyboardStepCount += 1;

		if (Math.abs(target - current) < 1) return;

		killKeyboardTween();

		const tween = driver.scrollTo(target, {
			duration: getSettings().keyboardDuration,
			ease: getSettings().keyboardEase,
			onDone: () => {
				finishKeyboardTween(direction);
			},
		});

		keyboardTween = tween;

		if (!tween) {
			finishKeyboardTween(direction);
		}
	};

	const scrollByWheel = (direction: ScrollDirection, deltaY: number) => {
		const magnitude = Math.abs(deltaY);
		if (magnitude < 1) return;

		if (wheelBurstDirection !== direction) {
			wheelBurstDirection = direction;
			wheelBurstCount = 0;
			wheelBurstStartedAt = 0;
			wheelBurstStartedScroll = 0;
			wheelSustainedBoostStartCount = null;
		}

		const current = driver.getScroll();

		if (wheelBurstCount === 0) {
			wheelBurstStartedAt = performance.now();
			wheelBurstStartedScroll = current;
		}

		wheelBurstCount += 1;

		const {
			wheelAccelerationPx,
			wheelBaseStepPx,
			wheelMaxStepPx,
			wheelSustainedAccelerationDelayMs,
			wheelSustainedAccelerationMultiplier,
		} = getSettings();
		if (
			wheelSustainedBoostStartCount == null &&
			performance.now() - wheelBurstStartedAt >=
				wheelSustainedAccelerationDelayMs
		) {
			wheelSustainedBoostStartCount = Math.max(0, wheelBurstCount - 1);
		}

		const magnitudeStep = Math.min(wheelAccelerationPx, magnitude * 0.5);
		const accelerationCount = Math.max(0, wheelBurstCount - 1);
		const acceleration = getSustainedAcceleration({
			accelerationCount,
			accelerationPx: wheelAccelerationPx,
			boostStartCount: wheelSustainedBoostStartCount,
			multiplier: wheelSustainedAccelerationMultiplier,
		});
		const step = Math.min(
			wheelMaxStepPx,
			wheelBaseStepPx + acceleration + magnitudeStep,
		);
		const max = ScrollTrigger.maxScroll(window);
		const target = Math.max(0, Math.min(max, current + direction * step));

		if (Math.abs(target - current) < 1) return;

		killWheelTween();

		const tween = driver.scrollTo(target, {
			duration: getSettings().wheelDuration,
			ease: getSettings().wheelEase,
			onDone: () => {
				wheelTween = null;
			},
		});

		wheelTween = tween;

		if (!tween) {
			wheelTween = null;
		}
	};

	const scheduleWheelBurstReset = () => {
		clearWheelStopTimer();

		wheelStopTimerId = window.setTimeout(() => {
			wheelStopTimerId = null;
			resetWheelBurst();
		}, getSettings().wheelStopSnapDelayMs);
	};

	const scheduleWheelStopSnap = (direction: ScrollDirection) => {
		clearWheelStopTimer();

		wheelStopTimerId = window.setTimeout(() => {
			const burstCount = wheelBurstCount;
			const burstStartedScroll = wheelBurstStartedScroll;

			wheelStopTimerId = null;
			resetWheelBurst();

			tryWheelIdleSnap(direction, burstCount, burstStartedScroll);
		}, getSettings().wheelStopSnapDelayMs);
	};

	const stopKeyboardHold = (shouldSnap = false) => {
		const direction = keyboardDirection;

		resetKeyboardHold();

		if (!shouldSnap || direction == null) return;

		snapAfterKeyboardTween = direction;

		if (!keyboardTween) {
			finishKeyboardTween(direction);
		}
	};

	const startKeyboardHold = (direction: KeyboardDirection) => {
		stopKeyboardHold(false);

		if (tryStep(direction > 0, { immediate: true })) {
			return;
		}

		keyboardDirection = direction;
		keyboardStepCount = 0;
		snapAfterKeyboardTween = null;

		scrollByKeyboard(direction);

		keyboardHoldTimerId = window.setInterval(() => {
			scrollByKeyboard(direction);
		}, getSettings().keyboardHoldIntervalMs);
	};

	const onKeyboardDown = (event: KeyboardEvent) => {
		const direction = getKeyboardDirection(event.key);
		if (!enabled || direction == null) return;
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		if (isInteractiveTarget(event.target)) return;
		if (selectionIsActive()) return;

		event.preventDefault();

		if (isSnapAnimationRunning) return;
		if (keyboardDirection === direction) return;

		startKeyboardHold(direction);
	};

	const onKeyboardUp = (event: KeyboardEvent) => {
		const direction = getKeyboardDirection(event.key);
		if (direction == null) return;
		if (keyboardDirection !== direction) return;

		event.preventDefault();
		stopKeyboardHold(true);
	};

	const onWindowBlur = () => {
		stopKeyboardHold(false);
	};

	const getTouchClientY = (event: Event) => {
		if (!("touches" in event)) return null;

		const touch = (event as TouchEvent).touches[0];
		return touch?.clientY ?? null;
	};

	const onUserPointerDown = (event: Event) => {
		if (!enabled) return;

		const target = event.target as HTMLElement | null;
		if (target && isSelectableZone(target)) return;
		if (selectionIsActive()) return;
		if (target && isInteractiveTarget(target)) return;

		killTweens(true);
	};

	const handleTouchReleaseSnap = () => {
		const startedAt = touchDragStartedAt;
		const startedScroll = touchDragStartedScroll;

		if (touchStartY == null || touchLastY == null) {
			resetTouchDrag();
			return;
		}

		const deltaY = touchStartY - touchLastY;
		const absDeltaY = Math.abs(deltaY);
		const direction: ScrollDirection = deltaY > 0 ? 1 : -1;
		const dragDurationMs = Math.max(1, performance.now() - startedAt);
		const dragVelocity = absDeltaY / dragDurationMs;
		const { touchDragGentleDistancePx, touchDragGentleVelocityPxPerMs } =
			getSettings();
		const isGentleDrag =
			absDeltaY <= touchDragGentleDistancePx &&
			dragVelocity <= touchDragGentleVelocityPxPerMs;

		resetTouchDrag();

		if (absDeltaY < getSettings().releaseThreshold) return;

		clearTouchReleaseTimer();

		touchReleaseTimerId = window.setTimeout(() => {
			touchReleaseTimerId = null;

			if (isGentleDrag) {
				const adjacentItem = model.getAdjacentItem(direction, startedScroll);
				if (adjacentItem?.snap) {
					gotoSnapItem(adjacentItem, direction > 0);
				}

				return;
			}

			tryWheelIdleSnap(direction, Number.POSITIVE_INFINITY, startedScroll);
		}, getSettings().touchDragStopSnapDelayMs);
	};

	const onWheelInput = (event: WheelEvent) => {
		if (!enabled) return;
		if (!isReaderWheelTarget(event.target)) return;
		if (ScrollTrigger.isTouch && isTouchPressing) return;
		if (event.ctrlKey || event.metaKey) return;
		if (isInteractiveTarget(event.target)) return;
		if (selectionIsActive()) return;

		const deltaY = event.deltaY;
		if (Math.abs(deltaY) < 1) return;

		if (event.cancelable) {
			event.preventDefault();
		}
		event.stopPropagation();

		const direction: ScrollDirection = deltaY > 0 ? 1 : -1;
		const current = driver.getScroll();

		clearWheelStopTimer();

		const didChangeDirection =
			wheelBurstDirection != null && wheelBurstDirection !== direction;

		if (didChangeDirection) {
			resetWheelBurst();
		}

		if (wheelBurstCount === 0) {
			wheelBurstStartedScroll = current;
		}

		const nextBurstCount = wheelBurstCount + 1;
		const burstThreshold = getSettings().wheelSnapBypassBurstCount;

		if (isSnapAnimationRunning) {
			if (!didChangeDirection && nextBurstCount <= burstThreshold) {
				wheelBurstDirection = direction;
				wheelBurstCount = nextBurstCount;
				scheduleWheelBurstReset();
				return;
			}

			killSnapTween();
			isSnapAnimationRunning = false;
		}

		if (
			nextBurstCount <= burstThreshold &&
			tryStep(direction > 0, {
				immediate: true,
			})
		) {
			wheelBurstDirection = direction;
			wheelBurstCount = nextBurstCount;
			scheduleWheelBurstReset();
			return;
		}

		scrollByWheel(direction, deltaY);
		scheduleWheelStopSnap(direction);
	};

	const initObservers = () => {
		snapObserver = ScrollTrigger.observe({
			type: "touch",
			tolerance: 10,
			preventDefault: false,
			debounce: true,
			allowClicks: true,
			onPress: (self) => {
				if (!enabled) return;

				if (ScrollTrigger.isTouch) {
					isTouchPressing = true;
					killTweens(true);

					const clientY = getTouchClientY(self.event);
					touchStartY = clientY ?? null;
					touchLastY = clientY ?? null;
					touchDragDirection = null;
					touchDragStartedAt = performance.now();
					touchDragStartedScroll = driver.getScroll();
				}

				if (ScrollTrigger.isTouch && isSnapAnimationRunning) {
					self.event.preventDefault();
				}
			},
			onDrag: (self) => {
				if (!enabled) return;
				if (!ScrollTrigger.isTouch) return;

				const clientY = getTouchClientY(self.event);
				if (clientY == null || touchLastY == null) return;

				const deltaY = touchLastY - clientY;
				if (Math.abs(deltaY) >= 1) {
					const max = ScrollTrigger.maxScroll(window);
					const current = driver.getScroll();
					const next = Math.max(
						0,
						Math.min(
							max,
							current + deltaY * getSettings().touchDragScrollMultiplier,
						),
					);

					touchDragDirection = deltaY > 0 ? 1 : -1;
					driver.setScroll(next);
				}

				touchLastY = clientY;
			},
			onRelease: () => {
				const shouldSnap = enabled && ScrollTrigger.isTouch && isTouchPressing;

				isTouchPressing = false;

				if (shouldSnap) {
					handleTouchReleaseSnap();
				} else {
					resetTouchDrag();
				}
			},
		});

		window.addEventListener("pointerdown", onUserPointerDown, {
			passive: true,
		});
		window.addEventListener("wheel", onWheelInput, wheelListenerOptions);
		window.addEventListener("keydown", onKeyboardDown);
		window.addEventListener("keyup", onKeyboardUp);
		window.addEventListener("blur", onWindowBlur);
	};

	initObservers();

	const disable = () => {
		enabled = false;
		killTweens(true);
		snapObserver?.disable();
	};

	const enable = () => {
		enabled = true;
		snapObserver?.enable();
	};

	const cleanup = () => {
		killTweens(true);

		window.removeEventListener(
			"pointerdown",
			onUserPointerDown as EventListener,
		);
		window.removeEventListener("wheel", onWheelInput, wheelListenerOptions);
		window.removeEventListener("keydown", onKeyboardDown);
		window.removeEventListener("keyup", onKeyboardUp);
		window.removeEventListener("blur", onWindowBlur);

		snapObserver?.kill();
		snapObserver = null;
	};

	return {
		disable,
		enable,
		killTweens,
		cleanup,
	};
}
