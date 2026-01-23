"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

type Args = {
  taleHubOpenRef: RefObject<boolean>;
  getScroll: () => number;
  setScroll: (v: number) => void;
  killTweens: (setNotAnimating?: boolean) => void;
  snapObserver: any;
};

export function useDragScroll({
  taleHubOpenRef,
  getScroll,
  setScroll,
  killTweens,
  snapObserver,
}: Args) {
  const DRAG_THRESHOLD = 6;
  const DRAG_SENSITIVITY_TOUCH = 1.0;
  const DRAG_SENSITIVITY_MOUSE = 1.25;
  const SNAP_EDGE = 120;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

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

  let dragging = false;
  let dragStarted = false;
  let dragStartScroll = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let lastDragForward: boolean | null = null;

  // throttle scroll writes
  let pendingScroll: number | null = null;
  const applyPendingScroll = () => {
    if (pendingScroll == null) return;
    setScroll(pendingScroll);
    pendingScroll = null;
  };
  const startDragTicker = () => gsap.ticker.add(applyPendingScroll);
  const stopDragTicker = () => {
    gsap.ticker.remove(applyPendingScroll);
    pendingScroll = null;
  };

  const isTouchDevice = !!ScrollTrigger.isTouch;

  const dragObserver = ScrollTrigger.observe({
    type: "pointer,touch",
    tolerance: 0,
    preventDefault: isTouchDevice,
    allowClicks: true,

    onPress: (self) => {
      if (taleHubOpenRef.current) return;

      if (isSelectableZone(self.event.target)) return;
      if (selectionIsActive()) return;
      if (isInteractiveTarget(self.event.target)) return;

      // key: disable snap while finger is down
      snapObserver.disable();

      if (isTouchDevice && self.event?.preventDefault)
        self.event.preventDefault();

      killTweens(true);

      dragging = true;
      dragStarted = false;

      dragStartScroll = getScroll();
      dragStartX = self.x;
      dragStartY = self.y;

      lastDragForward = null;

      startDragTicker();
    },

    onDrag: (self) => {
      if (taleHubOpenRef.current) return;

      if (selectionIsActive()) return;
      if (!dragging) return;
      if (isInteractiveTarget(self.event.target)) return;

      const dx = self.x - dragStartX;
      const dy = self.y - dragStartY;

      if (!dragStarted) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        dragStarted = true;
        if (isTouchDevice && self.event?.preventDefault)
          self.event.preventDefault();
      } else {
        if (isTouchDevice && self.event?.preventDefault)
          self.event.preventDefault();
      }

      const useX = Math.abs(dx) > Math.abs(dy);
      const dominantDelta = useX ? dx : dy;

      lastDragForward = dominantDelta < 0;

      const sensitivity = isTouchDevice
        ? DRAG_SENSITIVITY_TOUCH
        : DRAG_SENSITIVITY_MOUSE;

      const max = ScrollTrigger.maxScroll(window);
      const next = clamp(
        dragStartScroll + -dominantDelta * sensitivity,
        0,
        max,
      );

      pendingScroll = next;
    },

    onRelease: () => {
      if (taleHubOpenRef.current) return;

      stopDragTicker();

      dragging = false;

      const didDrag = dragStarted;
      dragStarted = false;

      // re-enable snap after finger lift
      snapObserver.enable();

      if (!didDrag) return;

      // Your release snapping remains handled by your snap observer wheel/touch
      // and by any "proximity snap" you implement elsewhere.
      // If you still want proximity snap-on-release, say so and I’ll add it here
      // using your itemsRef (keeping it isolated).
      lastDragForward = null;
    },
  });

  const cleanup = () => {
    stopDragTicker();
    dragObserver.kill();
  };

  return { dragObserver, cleanup };
}
