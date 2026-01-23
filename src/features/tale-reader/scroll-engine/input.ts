"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SnapModelApi } from "./snapModel";

type Driver = {
  getScroll: () => number;
  setScroll: (v: number) => void;
  scrollTo: (
    targetScroll: number,
    opts: { duration: number; ease: gsap.EaseString; onDone?: () => void },
  ) => gsap.core.Tween | null;
};

export type InputsApi = {
  disable: () => void;
  enable: () => void;
  killTweens: (setNotAnimating?: boolean) => void;
  cleanup: () => void;
};

type Args = {
  driver: Driver;
  model: SnapModelApi;
};

export function attachInputs({ driver, model }: Args): InputsApi {
  const SNAP_DURATION = 0.35;
  const SNAP_EASE: gsap.EaseString = "power1.inOut";

  // const ARROW_DURATION = 0.18;
  // const ARROW_EASE: gsap.EaseString = "power2.out";
  // const ARROW_DELTA = 220;

  // const DRAG_THRESHOLD = 6;
  // const DRAG_SENSITIVITY_TOUCH = 1.0;
  // const DRAG_SENSITIVITY_MOUSE = 1.25;
  // const SNAP_EDGE = 120;

  let enabled = true;
  let animating = false;

  let snapTween: gsap.core.Tween | null = null;
  // let arrowTween: gsap.core.Tween | null = null;

  let snapObserver: any = null;
  // let dragObserver: any = null;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const killTweens = (setNotAnimating = false) => {
    if (snapTween) {
      snapTween.kill();
      snapTween = null;
    }
    // if (arrowTween) {
    //   arrowTween.kill();
    //   arrowTween = null;
    // }
    if (setNotAnimating) animating = false;
  };

  const gotoIndex = (index: number, forward: boolean) => {
    const items = model.itemsRef.current;
    if (index < 0 || index >= items.length) return;

    animating = true;

    const target = items[index];
    const targetScroll = forward ? target.start : target.end;

    if (snapTween) {
      snapTween.kill();
      snapTween = null;
    }

    snapTween = driver.scrollTo(targetScroll, {
      duration: SNAP_DURATION,
      ease: SNAP_EASE,
      onDone: () => {
        snapTween = null;
        animating = false;
      },
    });
  };

  const tryStep = (forward: boolean) => {
    if (!enabled) return false;
    if (animating) return false;

    const items = model.itemsRef.current;
    const cur = driver.getScroll();

    const idx = model.getIndexFromScroll(cur);
    const curItem = items[idx];
    if (!curItem) return false;

    const nextIdx = forward ? idx + 1 : idx - 1;
    const target = items[nextIdx];
    if (!target) return false;
    if (!target.snap) return false;

    const EPS = ScrollTrigger.isTouch ? 60 : 20;
    if (forward) {
      if (cur < curItem.end - EPS) return false;
    } else {
      if (cur > curItem.start + EPS) return false;
    }

    gotoIndex(nextIdx, forward);
    return true;
  };

  // const nudgeSmooth = (forward: boolean) => {
  //   killTweens(true);
  //
  //   const cur = driver.getScroll();
  //   const target = cur + (forward ? ARROW_DELTA : -ARROW_DELTA);
  //
  //   arrowTween = driver.scrollTo(target, {
  //     duration: ARROW_DURATION,
  //     ease: ARROW_EASE,
  //     onDone: () => {
  //       arrowTween = null;
  //     },
  //   });
  // };

  // const onKeyDown = (e: KeyboardEvent) => {
  //   if (!enabled) return;
  //
  //   const k = e.key;
  //   const forward = k === "ArrowDown" || k === "ArrowRight";
  //   const reverse = k === "ArrowUp" || k === "ArrowLeft";
  //   if (!forward && !reverse) return;
  //
  //   e.preventDefault();
  //
  //   const didSnap = forward ? tryStep(true) : tryStep(false);
  //   if (!didSnap) nudgeSmooth(forward);
  // };

  const selectionIsActive = () => {
    const sel = window.getSelection?.();
    return !!sel && !sel.isCollapsed && sel.toString().length > 0;
  };

  const isSelectableZone = (t: EventTarget | null) => {
    const el = t as HTMLElement | null;
    if (!el) return false;
    return !!el.closest(
      ".select-text, input, textarea, [contenteditable='true']",
    );
  };

  const isInteractiveTarget = (t: EventTarget | null) => {
    const el = t as HTMLElement | null;
    if (!el) return false;
    return !!el.closest(
      "input, textarea, select, button, a, [role='button'], [contenteditable='true']",
    );
  };

  // let isDragging = false;
  // let dragging = false;
  // let dragStarted = false;
  // let dragStartScroll = 0;
  // let dragStartX = 0;
  // let dragStartY = 0;
  // let lastDragForward: boolean | null = null;

  // let pendingScroll: number | null = null;

  // const applyPending = () => {
  //   if (pendingScroll == null) return;
  //   driver.setScroll(pendingScroll);
  //   pendingScroll = null;
  // };

  // const startTicker = () => gsap.ticker.add(applyPending);
  // const stopTicker = () => {
  //   gsap.ticker.remove(applyPending);
  //   pendingScroll = null;
  // };

  const onUserPointerDown = (e: Event) => {
    if (!enabled) return;
    const target = e.target as HTMLElement | null;
    if (target && isSelectableZone(target)) return;
    if (selectionIsActive()) return;
    if (target && isInteractiveTarget(target)) return;
    killTweens(true);
  };

  const initObservers = () => {
    snapObserver = ScrollTrigger.observe({
      type: "wheel,touch",
      wheelSpeed: -1,
      tolerance: 10,
      preventDefault: false,
      debounce: true,
      onUp: (self) => {
        if (!enabled) return;
        const didSnap = tryStep(true);
        if (didSnap && self?.event?.preventDefault) self.event.preventDefault();
      },
      onDown: (self) => {
        if (!enabled) return;
        const didSnap = tryStep(false);
        if (didSnap && self?.event?.preventDefault) self.event.preventDefault();
      },
      onPress: (self) => {
        if (!enabled) return;
        if (ScrollTrigger.isTouch && animating) self.event.preventDefault();
      },
    });

    // const isTouchDevice = !!ScrollTrigger.isTouch;
    //
    // dragObserver = ScrollTrigger.observe({
    //   type: "pointer,touch",
    //   tolerance: 0,
    //   preventDefault: isTouchDevice,
    //   allowClicks: true,
    //
    //   onPress: (self) => {
    //     if (!enabled) return;
    //
    //     if (isSelectableZone(self.event.target)) return;
    //     if (selectionIsActive()) return;
    //     if (isInteractiveTarget(self.event.target)) return;
    //
    //     isDragging = true;
    //     snapObserver?.disable?.();
    //
    //     killTweens(true);
    //
    //     dragging = true;
    //     dragStarted = false;
    //
    //     dragStartScroll = driver.getScroll();
    //     dragStartX = self.x;
    //     dragStartY = self.y;
    //
    //     lastDragForward = null;
    //
    //     startTicker();
    //   },
    //
    //   onDrag: (self) => {
    //     if (!enabled) return;
    //     if (selectionIsActive()) return;
    //     if (!dragging) return;
    //     if (isInteractiveTarget(self.event.target)) return;
    //
    //     const dx = self.x - dragStartX;
    //     const dy = self.y - dragStartY;
    //
    //     if (!dragStarted) {
    //       if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    //       dragStarted = true;
    //     }
    //
    //     const useX = Math.abs(dx) > Math.abs(dy);
    //     const dominantDelta = useX ? dx : dy;
    //
    //     lastDragForward = dominantDelta < 0;
    //
    //     const sensitivity = isTouchDevice
    //       ? DRAG_SENSITIVITY_TOUCH
    //       : DRAG_SENSITIVITY_MOUSE;
    //
    //     const max = ScrollTrigger.maxScroll(window);
    //     const next = clamp(
    //       dragStartScroll + -dominantDelta * sensitivity,
    //       0,
    //       max,
    //     );
    //
    //     pendingScroll = next;
    //   },
    //
    //   onRelease: () => {
    //     if (!enabled) return;
    //
    //     stopTicker();
    //
    //     dragging = false;
    //
    //     const didDrag = dragStarted;
    //     dragStarted = false;
    //
    //     isDragging = false;
    //     snapObserver?.enable?.();
    //
    //     if (!didDrag) return;
    //
    //     const forward = lastDragForward ?? true;
    //     lastDragForward = null;
    //
    //     const items = model.itemsRef.current;
    //     const cur = driver.getScroll();
    //     const idx = model.getIndexFromScroll(cur);
    //     const curItem = items[idx];
    //     if (!curItem) return;
    //
    //     if (forward) {
    //       const next = items[idx + 1];
    //       if (next?.snap && cur >= curItem.end - SNAP_EDGE) {
    //         gotoIndex(idx + 1, true);
    //         return;
    //       }
    //       if (curItem.snap && Math.abs(cur - curItem.start) <= SNAP_EDGE) {
    //         gotoIndex(idx, true);
    //         return;
    //       }
    //     } else {
    //       const prev = items[idx - 1];
    //       if (prev?.snap && cur <= curItem.start + SNAP_EDGE) {
    //         gotoIndex(idx - 1, false);
    //         return;
    //       }
    //       if (curItem.snap && Math.abs(cur - curItem.end) <= SNAP_EDGE) {
    //         gotoIndex(idx, false);
    //         return;
    //       }
    //     }
    //   },
    // });

    // window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("pointerdown", onUserPointerDown, {
      passive: true,
    });
    window.addEventListener("mousedown", onUserPointerDown, { passive: true });
    window.addEventListener("touchstart", onUserPointerDown, { passive: true });
  };

  initObservers();

  const disable = () => {
    enabled = false;
    killTweens(true);
    snapObserver?.disable?.();
    // dragObserver?.disable?.();
  };

  const enable = () => {
    enabled = true;
    snapObserver?.enable?.();
    // dragObserver?.enable?.();
  };

  const cleanup = () => {
    // stopTicker();
    killTweens(true);

    // window.removeEventListener("keydown", onKeyDown as any);
    window.removeEventListener("pointerdown", onUserPointerDown as any);
    window.removeEventListener("mousedown", onUserPointerDown as any);
    window.removeEventListener("touchstart", onUserPointerDown as any);

    snapObserver?.kill?.();
    // dragObserver?.kill?.();

    snapObserver = null;
    // dragObserver = null;
  };

  return { disable, enable, killTweens, cleanup };
}
