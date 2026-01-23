"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

type Item = { el: HTMLElement; start: number; end: number; snap: boolean };

type Args = {
  taleHubOpenRef: RefObject<boolean>;
  getScroll: () => number;
  setScroll: (v: number) => void;
  itemsRef: RefObject<Item[]>;
};

export function useSnapNavigation({
  taleHubOpenRef,
  getScroll,
  setScroll,
  itemsRef,
}: Args) {
  const SNAP_DURATION = 0.35;
  const SNAP_EASE: gsap.EaseString = "power1.inOut";
  const ARROW_DURATION = 0.18;
  const ARROW_EASE: gsap.EaseString = "power2.out";
  const ARROW_DELTA = 220;

  let animating = false;
  let snapTween: gsap.core.Tween | null = null;
  let arrowTween: gsap.core.Tween | null = null;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const killTweens = (setNotAnimating = false) => {
    snapTween?.kill();
    arrowTween?.kill();
    snapTween = null;
    arrowTween = null;
    if (setNotAnimating) animating = false;
  };

  const getIndexFromScroll = () => {
    const items = itemsRef.current;
    const cur = getScroll();
    const EPS = ScrollTrigger.isTouch ? 60 : 20;

    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (cur >= it.start - EPS && cur <= it.end + EPS) return i;
    }

    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < items.length; i++) {
      const d = Math.abs(items[i].start - cur);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  };

  const tweenScrollTo = (
    targetScroll: number,
    duration: number,
    ease: gsap.EaseString,
    onDone?: () => void,
  ) => {
    const startScroll = getScroll();
    const max = ScrollTrigger.maxScroll(window);
    const clampedTarget = clamp(targetScroll, 0, max);

    if (Math.abs(clampedTarget - startScroll) < 2) {
      onDone?.();
      return null;
    }

    const proxy = { v: startScroll };
    return gsap.to(proxy, {
      v: clampedTarget,
      duration,
      ease,
      overwrite: "auto",
      onUpdate: () => setScroll(proxy.v),
      onComplete: onDone,
    });
  };

  const gotoIndex = (index: number, forward: boolean) => {
    const items = itemsRef.current;
    if (index < 0 || index >= items.length) return;

    animating = true;
    arrowTween?.kill();
    arrowTween = null;

    const target = items[index];
    const targetScroll = forward ? target.start : target.end;

    snapTween?.kill();
    snapTween = tweenScrollTo(targetScroll, SNAP_DURATION, SNAP_EASE, () => {
      snapTween = null;
      animating = false;
    }) as gsap.core.Tween;
  };

  const tryStep = (forward: boolean): boolean => {
    if (animating) return false;

    const items = itemsRef.current;
    const idx = getIndexFromScroll();
    const cur = getScroll();
    const curItem = items[idx];
    if (!curItem) return false;

    const nextIdx = forward ? idx + 1 : idx - 1;
    const target = items[nextIdx];
    if (!target) return false;

    // Only snap if target.snap === true
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

  const snapObserver = ScrollTrigger.observe({
    type: "wheel,touch",
    wheelSpeed: -1,
    tolerance: 10,
    preventDefault: false,
    debounce: true,

    onUp: (self) => {
      if (taleHubOpenRef.current) return;
      const didSnap = tryStep(true);
      if (didSnap && self?.event?.preventDefault) self.event.preventDefault();
    },

    onDown: (self) => {
      if (taleHubOpenRef.current) return;
      const didSnap = tryStep(false);
      if (didSnap && self?.event?.preventDefault) self.event.preventDefault();
    },

    onPress: (self) => {
      if (taleHubOpenRef.current) return;
      if (ScrollTrigger.isTouch && animating) self.event.preventDefault();
    },
  });

  const nudgeSmooth = (forward: boolean) => {
    killTweens(true);

    const cur = getScroll();
    const target = cur + (forward ? ARROW_DELTA : -ARROW_DELTA);

    arrowTween = tweenScrollTo(target, ARROW_DURATION, ARROW_EASE, () => {
      arrowTween = null;
    }) as gsap.core.Tween;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (taleHubOpenRef.current) return;

    const k = e.key;
    const forward = k === "ArrowDown" || k === "ArrowRight";
    const reverse = k === "ArrowUp" || k === "ArrowLeft";
    if (!forward && !reverse) return;

    e.preventDefault();

    const didSnap = forward ? tryStep(true) : tryStep(false);
    if (!didSnap) nudgeSmooth(forward);
  };

  window.addEventListener("keydown", onKeyDown, { passive: false });

  const cleanup = () => {
    window.removeEventListener("keydown", onKeyDown);
    snapObserver.kill();
    killTweens(true);
  };

  return { snapObserver, tryStep, gotoIndex, killTweens, cleanup };
}
