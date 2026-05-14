"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ScrollSnapModelApi } from "./scrollSnapModel";

type Driver = {
	getScroll: () => number;
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
	model: ScrollSnapModelApi;
};

export function attachInputBindings({ driver, model }: Args): InputBindingsApi {
	const snapDuration = 0.35;
	const snapEase: gsap.EaseString = "power1.inOut";
	const releaseThreshold = 24;

	let enabled = true;
	let isSnapAnimationRunning = false;
	let isTouchPressing = false;
	let touchStartY: number | null = null;
	let touchLastY: number | null = null;

	// A GSAP tween is the short-lived animation object that moves the
	// virtual scroll value to the next snap point.
	let activeSnapTween: gsap.core.Tween | null = null;
	let snapObserver: ReturnType<typeof ScrollTrigger.observe> | null = null;

	const killTweens = (setNotAnimating = false) => {
		if (activeSnapTween) {
			activeSnapTween.kill();
			activeSnapTween = null;
		}

		if (setNotAnimating) {
			isSnapAnimationRunning = false;
		}
	};

	const gotoIndex = (index: number, forward: boolean) => {
		const items = model.itemsRef.current;
		if (index < 0 || index >= items.length) return;

		isSnapAnimationRunning = true;

		const target = items[index];
		if (!target) {
			isSnapAnimationRunning = false;
			return;
		}

		const targetScroll = forward ? target.start : target.end;

		if (activeSnapTween) {
			activeSnapTween.kill();
			activeSnapTween = null;
		}

		activeSnapTween = driver.scrollTo(targetScroll, {
			duration: snapDuration,
			ease: snapEase,
			onDone: () => {
				activeSnapTween = null;
				isSnapAnimationRunning = false;
			},
		});
	};

	const tryStep = (forward: boolean) => {
		if (!enabled) return false;
		if (isSnapAnimationRunning) return false;

		const items = model.itemsRef.current;
		const current = driver.getScroll();
		const idx = model.getIndexFromScroll(current);
		const currentItem = items[idx];

		if (!currentItem) return false;

		const nextIdx = forward ? idx + 1 : idx - 1;
		const target = items[nextIdx];
		if (!target) return false;
		if (!target.snap) return false;

		const epsilon = ScrollTrigger.isTouch ? 60 : 20;

		if (forward) {
			if (current < currentItem.end - epsilon) return false;
		} else {
			if (current > currentItem.start + epsilon) return false;
		}

		gotoIndex(nextIdx, forward);
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
		if (touchStartY == null || touchLastY == null) return;

		const deltaY = touchStartY - touchLastY;
		const absDeltaY = Math.abs(deltaY);

		touchStartY = null;
		touchLastY = null;

		if (absDeltaY < releaseThreshold) return;

		const forward = deltaY > 0;
		tryStep(forward);
	};

	const initObservers = () => {
		snapObserver = ScrollTrigger.observe({
			type: "wheel,touch",
			wheelSpeed: -1,
			tolerance: 10,
			preventDefault: false,
			debounce: true,
			allowClicks: true,
			onUp: (self) => {
				if (!enabled) return;
				if (ScrollTrigger.isTouch && isTouchPressing) return;

				const didSnap = tryStep(true);
				if (didSnap && self?.event?.preventDefault) {
					self.event.preventDefault();
				}
			},
			onDown: (self) => {
				if (!enabled) return;
				if (ScrollTrigger.isTouch && isTouchPressing) return;

				const didSnap = tryStep(false);
				if (didSnap && self?.event?.preventDefault) {
					self.event.preventDefault();
				}
			},
			onPress: (self) => {
				if (!enabled) return;

				if (ScrollTrigger.isTouch) {
					isTouchPressing = true;
					killTweens(true);

					const clientY = getTouchClientY(self.event);
					touchStartY = clientY ?? null;
					touchLastY = clientY ?? null;
				}

				if (ScrollTrigger.isTouch && isSnapAnimationRunning) {
					self.event.preventDefault();
				}
			},
			onDrag: (self) => {
				if (!enabled) return;
				if (!ScrollTrigger.isTouch) return;

				const clientY = getTouchClientY(self.event);
				if (clientY != null) {
					touchLastY = clientY;
				}
			},
			onRelease: () => {
				const shouldSnap = enabled && ScrollTrigger.isTouch && isTouchPressing;

				isTouchPressing = false;

				if (shouldSnap) {
					handleTouchReleaseSnap();
				} else {
					touchStartY = null;
					touchLastY = null;
				}
			},
		});

		window.addEventListener("pointerdown", onUserPointerDown, {
			passive: true,
		});
		window.addEventListener("mousedown", onUserPointerDown, {
			passive: true,
		});
		window.addEventListener("touchstart", onUserPointerDown, {
			passive: true,
		});
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
		window.removeEventListener("mousedown", onUserPointerDown as EventListener);
		window.removeEventListener(
			"touchstart",
			onUserPointerDown as EventListener,
		);

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
