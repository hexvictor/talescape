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
type DragSource = "desktop" | "touch";
type DragDelta = {
	direction: ScrollDirection;
	value: number;
};

const idleSnapRetryDelayMs = 50;
const nativeScrollListenerOptions = {
	capture: true,
	passive: true,
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
	let isPointerDragPressing = false;
	let isTouchPressing = false;
	let nativeScrollStopTimerId: number | null = null;
	let nativeScrollLastValue = 0;
	let touchReleaseTimerId: number | null = null;
	let activeDragSource: DragSource | null = null;
	let touchDragStartedScroll = 0;
	let touchStartX: number | null = null;
	let touchStartY: number | null = null;
	let touchLastX: number | null = null;
	let touchLastY: number | null = null;
	let touchBurstDirection: ScrollDirection | null = null;
	let touchBurstCount = 0;
	let touchBurstLastAt = 0;
	let touchBurstStartedScroll = 0;
	let touchMoveDirection: ScrollDirection | null = null;
	let touchMoveCount = 0;
	let keyboardDirection: KeyboardDirection | null = null;
	let keyboardBurstDirection: KeyboardDirection | null = null;
	let keyboardBurstCount = 0;
	let keyboardBurstLastAt = 0;
	let keyboardBurstStartedScroll = 0;
	let keyboardStepCount = 0;
	let keyboardHoldTimerId: number | null = null;
	let keyboardStopTimerId: number | null = null;
	let keyboardTweenTargetScroll: number | null = null;
	let snapAfterKeyboardTween: KeyboardDirection | null = null;
	let wheelBurstDirection: ScrollDirection | null = null;
	let wheelBurstCount = 0;
	let wheelBurstStartedScroll = 0;
	let wheelStopTimerId: number | null = null;

	// A GSAP tween is the short-lived animation object that moves the
	// virtual scroll value to the next snap point.
	let activeSnapTween: gsap.core.Tween | null = null;
	let keyboardTween: gsap.core.Tween | null = null;
	let wheelTween: gsap.core.Tween | null = null;
	let gestureObserver: ReturnType<typeof ScrollTrigger.observe> | null = null;
	let wheelObserver: ReturnType<typeof ScrollTrigger.observe> | null = null;

	const clearKeyboardHoldTimer = () => {
		if (keyboardHoldTimerId == null) return;

		window.clearInterval(keyboardHoldTimerId);
		keyboardHoldTimerId = null;
	};

	const resetKeyboardHold = () => {
		clearKeyboardHoldTimer();
		keyboardDirection = null;
		keyboardStepCount = 0;
		keyboardTweenTargetScroll = null;
	};

	const clearKeyboardStopTimer = () => {
		if (keyboardStopTimerId == null) return;

		window.clearTimeout(keyboardStopTimerId);
		keyboardStopTimerId = null;
	};

	const resetKeyboardBurst = () => {
		clearKeyboardStopTimer();
		keyboardBurstDirection = null;
		keyboardBurstCount = 0;
		keyboardBurstLastAt = 0;
		keyboardBurstStartedScroll = 0;
	};

	const clearTouchReleaseTimer = () => {
		if (touchReleaseTimerId == null) return;

		window.clearTimeout(touchReleaseTimerId);
		touchReleaseTimerId = null;
	};

	const resetTouchDrag = () => {
		activeDragSource = null;
		touchDragStartedScroll = 0;
		touchStartX = null;
		touchStartY = null;
		touchLastX = null;
		touchLastY = null;
		touchMoveDirection = null;
		touchMoveCount = 0;
	};

	const resetTouchBurst = () => {
		touchBurstDirection = null;
		touchBurstCount = 0;
		touchBurstLastAt = 0;
		touchBurstStartedScroll = 0;
	};

	const getDragFreeGestureCount = (source: DragSource) => {
		const settings = getSettings();
		return source === "desktop"
			? settings.desktopDragFreeGestureCount
			: settings.touchDragFreeGestureCount;
	};

	const getDragFreeScrollEnabled = (source: DragSource) => {
		const settings = getSettings();
		return source === "desktop"
			? settings.desktopDragFreeScrollEnabled
			: settings.touchDragFreeScrollEnabled;
	};

	const getDragWindowMs = (source: DragSource) => {
		const settings = getSettings();
		return source === "desktop"
			? settings.desktopDragWindowMs
			: settings.touchDragWindowMs;
	};

	const getDragStopSnapDelayMs = (source: DragSource) => {
		const settings = getSettings();
		return source === "desktop"
			? settings.desktopDragStopSnapDelayMs
			: settings.touchDragStopSnapDelayMs;
	};

	const getDragBaseMultiplier = (source: DragSource) => {
		const settings = getSettings();
		return source === "desktop"
			? settings.desktopDragBaseMultiplier
			: settings.touchDragBaseMultiplier;
	};

	const getDragRepeatMultiplier = (source: DragSource) => {
		const settings = getSettings();
		return source === "desktop"
			? settings.desktopDragRepeatMultiplier
			: settings.touchDragRepeatMultiplier;
	};

	const getDragHorizontalMultiplier = (source: DragSource) => {
		return source === "touch" ? getSettings().touchDragHorizontalMultiplier : 1;
	};

	const scheduleTouchBurstReset = (source: DragSource) => {
		clearTouchReleaseTimer();

		touchReleaseTimerId = window.setTimeout(() => {
			touchReleaseTimerId = null;
			resetTouchBurst();
		}, getDragWindowMs(source));
	};

	const clearWheelStopTimer = () => {
		if (wheelStopTimerId == null) return;

		window.clearTimeout(wheelStopTimerId);
		wheelStopTimerId = null;
	};

	const clearNativeScrollStopTimer = () => {
		if (nativeScrollStopTimerId == null) return;

		window.clearTimeout(nativeScrollStopTimerId);
		nativeScrollStopTimerId = null;
	};

	const resetNativeScroll = () => {
		clearNativeScrollStopTimer();
		nativeScrollLastValue = driver.getScroll();
	};

	const resetWheelBurst = () => {
		wheelBurstDirection = null;
		wheelBurstCount = 0;
		wheelBurstStartedScroll = 0;
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
		keyboardTweenTargetScroll = null;
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
		isPointerDragPressing = false;
		isTouchPressing = false;
		resetKeyboardHold();
		resetKeyboardBurst();
		clearTouchReleaseTimer();
		resetTouchDrag();
		snapAfterKeyboardTween = null;
		clearWheelStopTimer();
		resetNativeScroll();
		resetWheelBurst();

		if (setNotAnimating) {
			isSnapAnimationRunning = false;
		}
	};

	const interruptForUserInput = () => {
		killSnapTween();
		killKeyboardTween();
		killWheelTween();
		isPointerDragPressing = false;
		isTouchPressing = false;
		resetKeyboardHold();
		resetKeyboardBurst();
		snapAfterKeyboardTween = null;
		clearWheelStopTimer();
		resetNativeScroll();
		resetWheelBurst();
		isSnapAnimationRunning = false;
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
		const burstThreshold = getSettings().wheelFreeScrollEventCount;
		if (getSettings().wheelFreeScrollEnabled || burstCount > burstThreshold) {
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

	const getKeyboardIdleSnapTarget = (
		direction: KeyboardDirection,
		burstCount: number,
		burstStartedScroll: number,
	): ScrollSnapItem | null => {
		const current = driver.getScroll();
		if (
			getSettings().keyboardFreeScrollEnabled ||
			burstCount > getSettings().keyboardBurstFreeScrollCount
		) {
			return model.getBestVisibleSnapItem(direction, current);
		}

		const adjacentItem = model.getAdjacentItem(direction, burstStartedScroll);
		return adjacentItem?.snap ? adjacentItem : null;
	};

	const tryKeyboardIdleSnap = (
		direction: KeyboardDirection,
		burstCount: number,
		burstStartedScroll: number,
	) => {
		if (!enabled) return false;
		if (isSnapAnimationRunning) return false;

		const target = getKeyboardIdleSnapTarget(
			direction,
			burstCount,
			burstStartedScroll,
		);
		if (!target) return false;

		gotoSnapItem(target, direction > 0);
		return true;
	};

	const tryNativeScrollIdleSnap = (direction: ScrollDirection) => {
		if (!enabled) return false;
		if (isSnapAnimationRunning) return false;

		const target = model.getBestVisibleSnapItem(direction, driver.getScroll());
		if (!target) return false;

		gotoSnapItem(target, direction > 0);
		return true;
	};

	const getTouchIdleSnapTarget = (
		direction: ScrollDirection,
		gestureCount: number,
		source: DragSource,
	): ScrollSnapItem | null => {
		const current = driver.getScroll();
		if (
			getDragFreeScrollEnabled(source) ||
			gestureCount > getDragFreeGestureCount(source)
		) {
			return model.getBestVisibleSnapItem(direction, current);
		}

		return null;
	};

	const tryTouchIdleSnap = (
		direction: ScrollDirection,
		gestureCount: number,
		source: DragSource,
	) => {
		if (!enabled) return false;
		if (isSnapAnimationRunning) return false;

		const target = getTouchIdleSnapTarget(direction, gestureCount, source);
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

	const scrollByKeyboard = (direction: KeyboardDirection) => {
		if (!enabled) return;

		if (isSnapAnimationRunning) {
			killSnapTween();
			isSnapAnimationRunning = false;
		}

		const current = driver.getScroll();
		const baseScroll = keyboardTweenTargetScroll ?? current;
		const max = ScrollTrigger.maxScroll(window);
		const {
			keyboardAccelerationPx,
			keyboardBaseStepPx,
			keyboardBurstFreeScrollCount,
			keyboardMaxStepPx,
			keyboardRepeatMultiplier,
		} = getSettings();
		const accelerationCount = Math.max(0, keyboardStepCount);
		const baseStep =
			keyboardBaseStepPx + accelerationCount * keyboardAccelerationPx;
		const exponent = Math.max(
			0,
			keyboardStepCount + 1 - keyboardBurstFreeScrollCount,
		);
		const multiplier = keyboardRepeatMultiplier ** exponent;
		const step = Math.min(keyboardMaxStepPx, baseStep * multiplier);
		const target = Math.max(0, Math.min(max, baseScroll + direction * step));

		keyboardStepCount += 1;

		if (Math.abs(target - current) < 1) return;

		keyboardTweenTargetScroll = target;
		killKeyboardTween();
		keyboardTweenTargetScroll = target;

		const tween = driver.scrollTo(target, {
			duration: getSettings().keyboardDuration,
			ease: getSettings().keyboardEase,
			onDone: () => {
				keyboardTweenTargetScroll = null;
				finishKeyboardTween(direction);
			},
		});

		keyboardTween = tween;

		if (!tween) {
			keyboardTweenTargetScroll = null;
			finishKeyboardTween(direction);
		}
	};

	const registerKeyboardBurstPress = (direction: KeyboardDirection) => {
		const now = performance.now();
		const current = driver.getScroll();
		const isSameBurst =
			keyboardBurstDirection === direction &&
			now - keyboardBurstLastAt <= getSettings().keyboardBurstWindowMs;

		if (!isSameBurst) {
			keyboardBurstDirection = direction;
			keyboardBurstCount = 0;
			keyboardBurstStartedScroll = current;
		}

		keyboardBurstCount += 1;
		keyboardBurstLastAt = now;

		return keyboardBurstCount;
	};

	const scrollByKeyboardBurst = (
		direction: KeyboardDirection,
		burstCount: number,
	) => {
		if (!enabled) return;

		if (isSnapAnimationRunning) {
			killSnapTween();
			isSnapAnimationRunning = false;
		}

		const current = driver.getScroll();
		const baseScroll = keyboardTweenTargetScroll ?? current;
		const max = ScrollTrigger.maxScroll(window);
		const {
			keyboardAccelerationPx,
			keyboardBaseStepPx,
			keyboardBurstFreeScrollCount,
			keyboardMaxStepPx,
			keyboardRepeatMultiplier,
		} = getSettings();
		const accelerationCount = Math.max(0, burstCount - 1);
		const baseStep =
			keyboardBaseStepPx + accelerationCount * keyboardAccelerationPx;
		const exponent = Math.max(0, burstCount - keyboardBurstFreeScrollCount);
		const multiplier = keyboardRepeatMultiplier ** exponent;
		const step = Math.min(keyboardMaxStepPx, baseStep * multiplier);
		const target = Math.max(0, Math.min(max, baseScroll + direction * step));

		if (Math.abs(target - current) < 1) return;

		keyboardTweenTargetScroll = target;
		killKeyboardTween();
		keyboardTweenTargetScroll = target;

		const tween = driver.scrollTo(target, {
			duration: getSettings().keyboardDuration,
			ease: getSettings().keyboardEase,
			onDone: () => {
				keyboardTween = null;
				keyboardTweenTargetScroll = null;
			},
		});

		keyboardTween = tween;

		if (!tween) {
			keyboardTween = null;
			keyboardTweenTargetScroll = null;
		}
	};

	const scheduleKeyboardStopSnap = (
		direction: KeyboardDirection,
		delayMs = getSettings().keyboardStopSnapDelayMs,
	) => {
		clearKeyboardStopTimer();

		keyboardStopTimerId = window.setTimeout(() => {
			if (keyboardTween) {
				keyboardStopTimerId = null;
				scheduleKeyboardStopSnap(direction, idleSnapRetryDelayMs);
				return;
			}

			const burstCount = keyboardBurstCount;
			const burstStartedScroll = keyboardBurstStartedScroll;

			keyboardStopTimerId = null;
			resetKeyboardBurst();

			tryKeyboardIdleSnap(direction, burstCount, burstStartedScroll);
		}, delayMs);
	};

	const scrollByWheel = (direction: ScrollDirection, deltaY: number) => {
		const magnitude = Math.abs(deltaY);
		if (magnitude < 1) return;

		if (wheelBurstDirection !== direction) {
			wheelBurstDirection = direction;
			wheelBurstCount = 0;
			wheelBurstStartedScroll = 0;
		}

		const current = driver.getScroll();

		if (wheelBurstCount === 0) {
			wheelBurstStartedScroll = current;
		}

		wheelBurstCount += 1;

		const {
			wheelAccelerationPx,
			wheelBaseStepPx,
			wheelMaxStepPx,
			wheelRepeatMultiplier,
		} = getSettings();

		const magnitudeStep = Math.min(wheelAccelerationPx, magnitude * 0.5);
		const accelerationCount = Math.max(0, wheelBurstCount - 1);
		const baseStep =
			wheelBaseStepPx + accelerationCount * wheelAccelerationPx + magnitudeStep;
		const exponent = Math.max(
			0,
			wheelBurstCount - getSettings().wheelFreeScrollEventCount,
		);
		const multiplier = wheelRepeatMultiplier ** exponent;
		const step = Math.min(wheelMaxStepPx, baseStep * multiplier);
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

	const scheduleWheelStopSnap = (
		direction: ScrollDirection,
		delayMs = getSettings().wheelStopSnapDelayMs,
	) => {
		clearWheelStopTimer();

		wheelStopTimerId = window.setTimeout(() => {
			if (wheelTween) {
				wheelStopTimerId = null;
				scheduleWheelStopSnap(direction, idleSnapRetryDelayMs);
				return;
			}

			const burstCount = wheelBurstCount;
			const burstStartedScroll = wheelBurstStartedScroll;

			wheelStopTimerId = null;
			resetWheelBurst();

			tryWheelIdleSnap(direction, burstCount, burstStartedScroll);
		}, delayMs);
	};

	const scheduleNativeScrollStopSnap = (
		direction: ScrollDirection,
		delayMs = getSettings().wheelStopSnapDelayMs,
	) => {
		clearNativeScrollStopTimer();

		nativeScrollStopTimerId = window.setTimeout(() => {
			if (activeSnapTween || keyboardTween || wheelTween) {
				nativeScrollStopTimerId = null;
				scheduleNativeScrollStopSnap(direction, idleSnapRetryDelayMs);
				return;
			}

			nativeScrollStopTimerId = null;
			resetNativeScroll();

			tryNativeScrollIdleSnap(direction);
		}, delayMs);
	};

	const stopKeyboardHold = (shouldSnap = false) => {
		const direction = keyboardDirection;

		resetKeyboardHold();

		if (!shouldSnap || direction == null) return;

		if (getSettings().keyboardFreeScrollEnabled) {
			snapAfterKeyboardTween = null;
			scheduleKeyboardStopSnap(direction);
			return;
		}

		snapAfterKeyboardTween = direction;

		if (!keyboardTween) {
			finishKeyboardTween(direction);
		}
	};

	const startKeyboardHold = (direction: KeyboardDirection) => {
		stopKeyboardHold(false);

		if (
			!getSettings().keyboardFreeScrollEnabled &&
			tryStep(direction > 0, { immediate: true })
		) {
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

		const burstCount = registerKeyboardBurstPress(direction);

		if (burstCount > getSettings().keyboardBurstFreeScrollCount) {
			stopKeyboardHold(false);
			snapAfterKeyboardTween = null;
			scrollByKeyboardBurst(direction, burstCount);
			scheduleKeyboardStopSnap(direction);
			return;
		}

		if (isSnapAnimationRunning) return;
		if (keyboardDirection === direction) return;

		startKeyboardHold(direction);
	};

	const onKeyboardUp = (event: KeyboardEvent) => {
		const direction = getKeyboardDirection(event.key);
		if (direction == null) return;
		if (keyboardDirection !== direction) {
			if (keyboardBurstDirection === direction) {
				event.preventDefault();
			}

			return;
		}

		event.preventDefault();
		stopKeyboardHold(true);
	};

	const onWindowBlur = () => {
		stopKeyboardHold(false);
		resetKeyboardBurst();
	};

	const getTouchClientPoint = (event: Event) => {
		if ("touches" in event) {
			const touch = (event as TouchEvent).touches[0];
			return touch ? { x: touch.clientX, y: touch.clientY } : null;
		}

		if (
			"clientX" in event &&
			"clientY" in event &&
			typeof event.clientX === "number" &&
			typeof event.clientY === "number"
		) {
			return { x: event.clientX, y: event.clientY };
		}

		return null;
	};

	const getCombinedDragDelta = (
		deltaX: number,
		deltaY: number,
		source: DragSource,
	): DragDelta => {
		const weightedDeltaX = deltaX * getDragHorizontalMultiplier(source);
		const absX = Math.abs(weightedDeltaX);
		const absY = Math.abs(deltaY);
		if (absX < 1 && absY < 1) {
			return { direction: 1, value: 0 };
		}

		if (Math.abs(weightedDeltaX) < 1) {
			const direction: ScrollDirection = deltaY > 0 ? 1 : -1;
			return { direction, value: direction * absY };
		}

		if (Math.abs(deltaY) < 1) {
			const direction: ScrollDirection = weightedDeltaX > 0 ? 1 : -1;
			return { direction, value: direction * absX };
		}

		const xDirection: ScrollDirection = weightedDeltaX > 0 ? 1 : -1;
		const yDirection: ScrollDirection = deltaY > 0 ? 1 : -1;
		if (xDirection === yDirection) {
			return { direction: xDirection, value: xDirection * (absX + absY) };
		}

		const direction = absX >= absY ? xDirection : yDirection;
		const dominantMagnitude = Math.max(absX, absY);
		const secondaryMagnitude = Math.min(absX, absY);
		return {
			direction,
			value:
				direction * Math.max(0, dominantMagnitude - secondaryMagnitude * 0.25),
		};
	};

	const shouldIgnorePointerPress = (event: Event) => {
		if (!enabled) return true;
		if (
			"button" in event &&
			typeof event.button === "number" &&
			event.button !== 0
		) {
			return true;
		}

		const target = event.target as HTMLElement | null;
		return (
			!!(target && isSelectableZone(target)) ||
			selectionIsActive() ||
			!!(target && isInteractiveTarget(target))
		);
	};

	const shouldIgnoreWheel = (event: Event) => {
		const wheelEvent = event as WheelEvent;
		return (
			!enabled ||
			!isReaderWheelTarget(event.target) ||
			(ScrollTrigger.isTouch && isTouchPressing) ||
			wheelEvent.ctrlKey ||
			wheelEvent.metaKey ||
			Math.abs(wheelEvent.deltaY) < 1 ||
			isInteractiveTarget(event.target) ||
			selectionIsActive()
		);
	};

	const scrollByDrag = (delta: number, source: DragSource) => {
		if (Math.abs(delta) < 1) return;

		const current = driver.getScroll();
		const max = ScrollTrigger.maxScroll(window);
		const direction: ScrollDirection = delta > 0 ? 1 : -1;
		if (touchMoveDirection !== direction) {
			touchMoveDirection = direction;
			touchMoveCount = 0;
		}

		touchMoveCount += 1;

		const moveRepeatCount = Math.floor(touchMoveCount / 4);
		const gestureRepeatCount =
			touchBurstDirection === direction ? touchBurstCount : 0;
		const repeatCount = Math.max(moveRepeatCount, gestureRepeatCount);
		const exponent = Math.max(0, repeatCount - getDragFreeGestureCount(source));
		const repeatMultiplier = getDragRepeatMultiplier(source) ** exponent;
		const step = delta * getDragBaseMultiplier(source) * repeatMultiplier;
		const next = Math.max(0, Math.min(max, current + step));

		if (Math.abs(next - current) < 1) return;

		driver.setScroll(next);
	};

	const scheduleTouchStopSnap = (
		direction: ScrollDirection,
		gestureCount: number,
		source: DragSource,
		delayMs = getDragStopSnapDelayMs(source),
	) => {
		clearTouchReleaseTimer();

		touchReleaseTimerId = window.setTimeout(() => {
			if (activeSnapTween || keyboardTween || wheelTween) {
				touchReleaseTimerId = null;
				scheduleTouchStopSnap(
					direction,
					gestureCount,
					source,
					idleSnapRetryDelayMs,
				);
				return;
			}

			touchReleaseTimerId = null;
			resetTouchBurst();

			tryTouchIdleSnap(direction, gestureCount, source);
		}, delayMs);
	};

	const handleTouchReleaseSnap = () => {
		const source =
			activeDragSource ?? (ScrollTrigger.isTouch ? "touch" : "desktop");
		const startedScroll = touchDragStartedScroll;

		if (
			touchStartX == null ||
			touchStartY == null ||
			touchLastX == null ||
			touchLastY == null
		) {
			resetTouchDrag();
			return;
		}

		const dragDelta = getCombinedDragDelta(
			touchStartX - touchLastX,
			touchStartY - touchLastY,
			source,
		);
		const absDelta = Math.abs(dragDelta.value);
		const direction = dragDelta.direction;

		resetTouchDrag();

		if (absDelta < getSettings().releaseThreshold) return;

		const now = performance.now();
		const isSameTouchBurst =
			touchBurstDirection === direction &&
			now - touchBurstLastAt <= getDragWindowMs(source);

		if (!isSameTouchBurst) {
			touchBurstDirection = direction;
			touchBurstCount = 0;
			touchBurstStartedScroll = startedScroll;
		}

		touchBurstCount += 1;
		touchBurstLastAt = now;

		const gestureCount = touchBurstCount;
		const gestureStartedScroll = touchBurstStartedScroll;
		const shouldFreeScroll =
			getDragFreeScrollEnabled(source) ||
			gestureCount > getDragFreeGestureCount(source);

		clearTouchReleaseTimer();

		if (!shouldFreeScroll) {
			const adjacentItem = model.getAdjacentItem(
				direction,
				gestureStartedScroll,
			);

			if (adjacentItem?.snap) {
				scheduleTouchBurstReset(source);
				gotoSnapItem(adjacentItem, direction > 0);
				return;
			}

			scheduleTouchBurstReset(source);
			return;
		}

		scheduleTouchStopSnap(direction, gestureCount, source);
	};

	const handleWheelInput = (event: WheelEvent, deltaY: number) => {
		if (!enabled) return;
		if (!isReaderWheelTarget(event.target)) return;
		if (ScrollTrigger.isTouch && isTouchPressing) return;
		if (event.ctrlKey || event.metaKey) return;
		if (isInteractiveTarget(event.target)) return;
		if (selectionIsActive()) return;

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
		const burstThreshold = getSettings().wheelFreeScrollEventCount;
		const freeScrollEnabled = getSettings().wheelFreeScrollEnabled;

		if (isSnapAnimationRunning) {
			if (
				!freeScrollEnabled &&
				!didChangeDirection &&
				nextBurstCount <= burstThreshold
			) {
				wheelBurstDirection = direction;
				wheelBurstCount = nextBurstCount;
				scheduleWheelBurstReset();
				return;
			}

			killSnapTween();
			isSnapAnimationRunning = false;
		}

		if (
			!freeScrollEnabled &&
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

	const onNativeScroll = () => {
		if (!enabled) return;
		if (activeSnapTween || keyboardTween || wheelTween) return;
		if (isTouchPressing || isPointerDragPressing) return;

		const current = driver.getScroll();
		const deltaY = current - nativeScrollLastValue;
		if (Math.abs(deltaY) < 1) return;

		const direction: ScrollDirection = deltaY > 0 ? 1 : -1;

		nativeScrollLastValue = current;
		scheduleNativeScrollStopSnap(direction);
	};

	const initObservers = () => {
		gestureObserver = ScrollTrigger.observe({
			type: "touch,pointer",
			tolerance: 10,
			preventDefault: false,
			debounce: true,
			allowClicks: true,
			onPress: (self) => {
				if (!enabled) return;
				if (shouldIgnorePointerPress(self.event)) return;

				clearTouchReleaseTimer();
				interruptForUserInput();

				if (ScrollTrigger.isTouch) {
					isTouchPressing = true;

					const point = getTouchClientPoint(self.event);
					activeDragSource = "touch";
					touchStartX = point?.x ?? null;
					touchStartY = point?.y ?? null;
					touchLastX = point?.x ?? null;
					touchLastY = point?.y ?? null;
					touchDragStartedScroll = driver.getScroll();
				} else {
					isPointerDragPressing = true;

					const point = getTouchClientPoint(self.event);
					activeDragSource = "desktop";
					touchStartX = point?.x ?? null;
					touchStartY = point?.y ?? null;
					touchLastX = point?.x ?? null;
					touchLastY = point?.y ?? null;
					touchDragStartedScroll = driver.getScroll();
				}

				if (ScrollTrigger.isTouch && isSnapAnimationRunning) {
					killSnapTween();
					isSnapAnimationRunning = false;
				}
			},
			onDrag: (self) => {
				if (!enabled) return;

				const point = getTouchClientPoint(self.event);
				if (point == null || touchLastX == null || touchLastY == null) {
					return;
				}

				const dragDelta = getCombinedDragDelta(
					touchLastX - point.x,
					touchLastY - point.y,
					ScrollTrigger.isTouch ? "touch" : "desktop",
				);

				if (ScrollTrigger.isTouch && isTouchPressing) {
					if (self.event.cancelable) {
						self.event.preventDefault();
					}
					scrollByDrag(dragDelta.value, "touch");
				} else if (isPointerDragPressing) {
					if (self.event.cancelable) {
						self.event.preventDefault();
					}
					scrollByDrag(dragDelta.value, "desktop");
				}

				touchLastX = point.x;
				touchLastY = point.y;
			},
			onRelease: () => {
				const shouldSnap =
					enabled &&
					((ScrollTrigger.isTouch && isTouchPressing) || isPointerDragPressing);

				isTouchPressing = false;
				isPointerDragPressing = false;

				if (shouldSnap) {
					handleTouchReleaseSnap();
				} else {
					resetTouchDrag();
				}
			},
		});

		wheelObserver = ScrollTrigger.observe({
			type: "wheel",
			target: window,
			capture: true,
			preventDefault: true,
			debounce: false,
			ignoreCheck: (event) => shouldIgnoreWheel(event),
			onWheel: (self) => {
				const event = self.event as WheelEvent;
				handleWheelInput(event, event.deltaY);
			},
		});

		nativeScrollLastValue = driver.getScroll();
		window.addEventListener(
			"scroll",
			onNativeScroll,
			nativeScrollListenerOptions,
		);

		window.addEventListener("keydown", onKeyboardDown);
		window.addEventListener("keyup", onKeyboardUp);
		window.addEventListener("blur", onWindowBlur);
	};

	initObservers();

	const disable = () => {
		enabled = false;
		killTweens(true);
		resetNativeScroll();
		resetTouchBurst();
		gestureObserver?.disable();
		wheelObserver?.disable();
	};

	const enable = () => {
		enabled = true;
		nativeScrollLastValue = driver.getScroll();
		gestureObserver?.enable();
		wheelObserver?.enable();
	};

	const cleanup = () => {
		killTweens(true);
		resetNativeScroll();
		resetTouchBurst();

		window.removeEventListener(
			"scroll",
			onNativeScroll,
			nativeScrollListenerOptions,
		);
		window.removeEventListener("keydown", onKeyboardDown);
		window.removeEventListener("keyup", onKeyboardUp);
		window.removeEventListener("blur", onWindowBlur);

		gestureObserver?.kill();
		gestureObserver = null;
		wheelObserver?.kill();
		wheelObserver = null;
	};

	return {
		disable,
		enable,
		killTweens,
		cleanup,
	};
}
