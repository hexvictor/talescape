"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

import { LoremIpsum } from "lorem-ipsum";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";

const lorem = new LoremIpsum({
  sentencesPerParagraph: { max: 6, min: 3 },
  wordsPerSentence: { max: 12, min: 5 },
});

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

type Axis = "x" | "y";
type DirX = "right" | "left";
type DirY = "down" | "up";

type PinnedMeta = {
  section: HTMLElement;
  track: HTMLElement;
  axis: Axis;
  direction: DirX | DirY;
  getTravel: () => number;
  getST: () => ScrollTrigger | null;
  getFromTo: () => { fromVal: number; toVal: number };
};

type Item = {
  el: HTMLElement;
  start: number;
  end: number;
  snap: boolean;
};

export default function ScrollPageMixedFixed() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // keep the real smoother instance (we’ll pause it when the drawer opens)
  const smootherRef = useRef<any>(null);

  // drawer state + a ref so GSAP handlers can read it without rerender concerns
  const [detailOpen, setDetailOpen] = useState(false);
  const detailOpenRef = useRef(false);

  const detailText = useMemo(() => lorem.generateParagraphs(6), []);

  useGSAP(
    () => {
      // IMPORTANT: mobile address bar resizing causes constant refresh/recalc -> snap glitches.
      ScrollTrigger.config({
        ignoreMobileResize: true,
      });

      // ---------- SCROLL SMOOTHER ----------
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        smoothTouch: 0.15,
        effects: true,
        normalizeScroll: true,
      });

      smootherRef.current = smoother;

      // Use unified scroll getters/setters.
      const getScroll = () =>
        smootherRef.current &&
        typeof smootherRef.current.scrollTop === "function"
          ? smootherRef.current.scrollTop()
          : ScrollTrigger.scroll();

      const setScroll = (v: number) => {
        if (
          smootherRef.current &&
          typeof smootherRef.current.scrollTop === "function"
        ) {
          smootherRef.current.scrollTop(v);
        } else {
          ScrollTrigger.scroll(v);
        }
      };

      // ---------- PINNED TRACK SECTIONS ----------
      const pinnedMeta = new Map<HTMLElement, PinnedMeta>();
      const pinnedSections = gsap.utils.toArray<HTMLElement>(".pinned-section");

      for (const section of pinnedSections) {
        const track = section.querySelector<HTMLElement>(".scroll-track");
        if (!track) continue;

        const axis = (section.dataset.axis ?? "x") as Axis;
        const direction =
          section.dataset.direction ??
          (axis === "x" ? ("right" as DirX) : ("down" as DirY));

        const getTravel = () =>
          axis === "x"
            ? Math.max(0, track.scrollWidth - window.innerWidth)
            : Math.max(0, track.scrollHeight - window.innerHeight);

        const getFromTo = () => {
          const travel = getTravel();

          if (axis === "x") {
            const fromVal = direction === "right" ? 0 : -travel;
            const toVal = direction === "right" ? -travel : 0;
            return { fromVal, toVal };
          }

          // Y axis: keep “true reverse up” behavior
          const fromVal = direction === "down" ? 0 : -travel;
          const toVal = direction === "down" ? -travel : 0;
          return { fromVal, toVal };
        };

        gsap.fromTo(
          track,
          { [axis]: getFromTo().fromVal } as gsap.TweenVars,
          {
            [axis]: getFromTo().toVal,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${getTravel()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          } as gsap.TweenVars,
        );

        pinnedMeta.set(section, {
          section,
          track,
          axis,
          direction: direction as any,
          getTravel,
          getFromTo,
          getST: () =>
            ScrollTrigger.getAll().find((t) => t.trigger === section) ?? null,
        });
      }

      // ---------- SNAP / SWIPE ----------
      const ITEM_SELECTOR = "[data-snap='true'], [data-snap='false']";

      const SNAP_DURATION = 0.35;
      const SNAP_EASE: gsap.EaseString = "power1.inOut";

      const ARROW_DURATION = 0.18;
      const ARROW_EASE: gsap.EaseString = "power2.out";
      const ARROW_DELTA = 220;

      // Drag tuning
      const DRAG_THRESHOLD = 6; // px before it becomes a drag
      const DRAG_SENSITIVITY_TOUCH = 1.0;
      const DRAG_SENSITIVITY_MOUSE = 1.25;
      const SNAP_EDGE = 120; // px proximity to boundary needed to snap on drag release

      const clamp = (v: number, min: number, max: number) =>
        Math.max(min, Math.min(max, v));

      const navST = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: () => ScrollTrigger.maxScroll(window),
      });

      // ---- helpers to map elements inside pinned tracks ----
      const offsetWithin = (
        el: HTMLElement,
        ancestor: HTMLElement,
        axis: Axis,
      ) => {
        let cur: HTMLElement | null = el;
        let acc = 0;

        while (cur && cur !== ancestor) {
          acc += axis === "x" ? cur.offsetLeft : cur.offsetTop;
          cur = cur.offsetParent as HTMLElement | null;
        }

        return cur === ancestor ? acc : 0;
      };

      const getNormalFlowStart = (el: HTMLElement) => {
        const temp = ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "+=1",
        });

        const pos = temp.start as number;
        temp.kill();
        return pos;
      };

      const getNormalFlowEnd = (el: HTMLElement) => {
        const start = getNormalFlowStart(el);
        const extra = Math.max(0, el.offsetHeight - window.innerHeight);
        return start + extra;
      };

      const mapPinnedOffsetToScroll = (
        pinnedSection: HTMLElement,
        el: HTMLElement,
        offsetAlongTrack: number,
      ) => {
        const meta = pinnedMeta.get(pinnedSection);
        if (!meta) return null;

        const st = meta.getST();
        if (!st) return null;

        const start = st.start as number;
        const end = st.end as number;

        const travel = meta.getTravel();
        if (!travel) return start;

        if (!el.closest(".scroll-track")) return start;

        const target = -offsetAlongTrack;

        const { fromVal, toVal } = meta.getFromTo();
        const denom = toVal - fromVal;
        if (!denom) return start;

        const p = clamp((target - fromVal) / denom, 0, 1);
        return start + p * (end - start);
      };

      const getPinnedRange = (
        el: HTMLElement,
        pinnedSection: HTMLElement,
      ): { start: number; end: number } | null => {
        const meta = pinnedMeta.get(pinnedSection);
        if (!meta) return null;

        const track = meta.track;
        if (!el.closest(".scroll-track")) return null;

        const offsetStart = offsetWithin(el, track, meta.axis);

        const viewportSize =
          meta.axis === "x" ? window.innerWidth : window.innerHeight;
        const elSize = meta.axis === "x" ? el.offsetWidth : el.offsetHeight;
        const extra = Math.max(0, elSize - viewportSize);
        const offsetEnd = offsetStart + extra;

        const startScroll = mapPinnedOffsetToScroll(
          pinnedSection,
          el,
          offsetStart,
        );
        const endScroll = mapPinnedOffsetToScroll(pinnedSection, el, offsetEnd);

        if (startScroll == null || endScroll == null) return null;
        return { start: startScroll, end: Math.max(startScroll, endScroll) };
      };

      const getRangeForEl = (el: HTMLElement) => {
        const pinnedSection = el.closest(
          ".pinned-section",
        ) as HTMLElement | null;
        if (pinnedSection) {
          const range = getPinnedRange(el, pinnedSection);
          if (range) return range;
        }
        return { start: getNormalFlowStart(el), end: getNormalFlowEnd(el) };
      };

      // ---- state ----
      let animating = false;
      let items: Item[] = [];
      let snapTween: gsap.core.Tween | null = null;
      let arrowTween: gsap.core.Tween | null = null;

      // THIS is the key flag: while finger-dragging, do NOT allow snap observer to run.
      let isDragging = false;

      const killSnapTween = (setNotAnimating = false) => {
        if (snapTween) {
          snapTween.kill();
          snapTween = null;
        }
        if (setNotAnimating) animating = false;
      };

      const killArrowTween = () => {
        if (arrowTween) {
          arrowTween.kill();
          arrowTween = null;
        }
      };

      const rebuildItems = () => {
        const els = gsap.utils.toArray<HTMLElement>(ITEM_SELECTOR);
        const max = ScrollTrigger.maxScroll(window);

        const mapped = els.map((el) => {
          const { start, end } = getRangeForEl(el);
          const val = el.dataset.snap;
          const snap = val === "true";

          return {
            el,
            start: clamp(start, 0, max),
            end: clamp(end, 0, max),
            snap,
          } satisfies Item;
        });

        mapped.sort((a, b) => a.start - b.start);

        const unique: Item[] = [];
        for (const it of mapped) {
          const last = unique[unique.length - 1];
          if (!last || Math.abs(it.start - last.start) > 1) {
            unique.push(it);
          } else {
            last.end = Math.max(last.end, it.end);
            last.snap = last.snap || it.snap;
          }
        }

        items = unique;
      };

      const getIndexFromScroll = () => {
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
        if (index < 0 || index >= items.length) return;

        animating = true;
        killArrowTween();

        const target = items[index];
        const targetScroll = forward ? target.start : target.end;

        killSnapTween();
        snapTween = tweenScrollTo(
          targetScroll,
          SNAP_DURATION,
          SNAP_EASE,
          () => {
            snapTween = null;
            animating = false;
          },
        ) as gsap.core.Tween;
      };

      const tryStep = (forward: boolean): boolean => {
        if (animating) return false;

        const idx = getIndexFromScroll();
        const cur = getScroll();
        const curItem = items[idx];
        if (!curItem) return false;

        const nextIdx = forward ? idx + 1 : idx - 1;
        const target = items[nextIdx];
        if (!target) return false;

        // Only snap if the TARGET is snap=true
        if (!target.snap) return false;

        // Gating: don’t leave current item until reaching its boundary
        const EPS = ScrollTrigger.isTouch ? 60 : 20;
        if (forward) {
          if (cur < curItem.end - EPS) return false;
        } else {
          if (cur > curItem.start + EPS) return false;
        }

        gotoIndex(nextIdx, forward);
        return true;
      };

      // Wheel/touch snap
      const myObserver = ScrollTrigger.observe({
        type: "wheel,touch",
        wheelSpeed: -1,
        tolerance: 10,
        preventDefault: false,
        debounce: true,

        onUp: (self) => {
          if (detailOpenRef.current) return;
          if (isDragging) return; // <-- IMPORTANT
          const didSnap = tryStep(true);
          if (didSnap && self?.event?.preventDefault)
            self.event.preventDefault();
        },

        onDown: (self) => {
          if (detailOpenRef.current) return;
          if (isDragging) return; // <-- IMPORTANT
          const didSnap = tryStep(false);
          if (didSnap && self?.event?.preventDefault)
            self.event.preventDefault();
        },

        onPress: (self) => {
          if (detailOpenRef.current) return;
          if (isDragging) return; // <-- IMPORTANT
          if (ScrollTrigger.isTouch && animating) self.event.preventDefault();
        },
      });

      // Arrow keys smooth nudge
      const nudgeSmooth = (forward: boolean) => {
        killSnapTween(true);

        const cur = getScroll();
        const target = cur + (forward ? ARROW_DELTA : -ARROW_DELTA);

        arrowTween = tweenScrollTo(target, ARROW_DURATION, ARROW_EASE, () => {
          arrowTween = null;
        }) as gsap.core.Tween;
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (detailOpenRef.current) return;

        const k = e.key;

        const forward = k === "ArrowDown" || k === "ArrowRight";
        const reverse = k === "ArrowUp" || k === "ArrowLeft";
        if (!forward && !reverse) return;

        e.preventDefault();

        const didSnap = forward ? tryStep(true) : tryStep(false);
        if (!didSnap) nudgeSmooth(forward);
      };

      // ---------- SELECTION GUARDS ----------
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

      const clearSelection = () => {
        const sel = window.getSelection?.();
        if (sel && !sel.isCollapsed) sel.removeAllRanges();
      };

      const onGlobalPointerDownCapture = (e: PointerEvent) => {
        if (detailOpenRef.current) return;

        const target = e.target as HTMLElement | null;
        if (!target) return;

        if (isSelectableZone(target)) return;
        clearSelection();
      };

      // ---------- DRAG ANYWHERE ----------
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

      // throttle scroll writes (mobile smoothness)
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
          if (detailOpenRef.current) return;

          if (isSelectableZone(self.event.target)) return;
          if (selectionIsActive()) return;
          if (isInteractiveTarget(self.event.target)) return;

          // While finger is down, disable snap observer so it cannot fight the drag.
          isDragging = true;
          myObserver.disable();

          if (isTouchDevice && self.event?.preventDefault)
            self.event.preventDefault();

          killArrowTween();
          killSnapTween(true);

          dragging = true;
          dragStarted = false;

          dragStartScroll = getScroll();
          dragStartX = self.x;
          dragStartY = self.y;

          lastDragForward = null;

          startDragTicker();
        },

        onDrag: (self) => {
          if (detailOpenRef.current) return;

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
          if (detailOpenRef.current) return;

          stopDragTicker();

          dragging = false;

          const didDrag = dragStarted;
          dragStarted = false;

          // Re-enable snap observer after finger lift.
          isDragging = false;
          myObserver.enable();

          if (!didDrag) return;

          const forward = lastDragForward ?? true;
          lastDragForward = null;

          const idx = getIndexFromScroll();
          const cur = getScroll();
          const curItem = items[idx];
          if (!curItem) return;

          if (forward) {
            const next = items[idx + 1];

            if (next?.snap && cur >= curItem.end - SNAP_EDGE) {
              gotoIndex(idx + 1, true);
              return;
            }

            if (curItem.snap && Math.abs(cur - curItem.start) <= SNAP_EDGE) {
              gotoIndex(idx, true);
              return;
            }
          } else {
            const prev = items[idx - 1];

            if (prev?.snap && cur <= curItem.start + SNAP_EDGE) {
              gotoIndex(idx - 1, false);
              return;
            }

            if (curItem.snap && Math.abs(cur - curItem.end) <= SNAP_EDGE) {
              gotoIndex(idx, false);
              return;
            }
          }
        },
      });

      const onUserPointerDown = () => {
        if (detailOpenRef.current) return;
        killArrowTween();
        killSnapTween(true);
      };

      ScrollTrigger.refresh();
      rebuildItems();

      const onRefresh = () => {
        killArrowTween();
        killSnapTween(true);
        rebuildItems();
      };

      ScrollTrigger.addEventListener("refresh", onRefresh);

      window.addEventListener("pointerdown", onUserPointerDown, {
        passive: true,
      });
      window.addEventListener("mousedown", onUserPointerDown, {
        passive: true,
      });
      window.addEventListener("touchstart", onUserPointerDown, {
        passive: true,
      });

      window.addEventListener("pointerdown", onGlobalPointerDownCapture, {
        passive: true,
        capture: true,
      });

      window.addEventListener("keydown", onKeyDown, { passive: false });

      return () => {
        ScrollTrigger.removeEventListener("refresh", onRefresh);

        window.removeEventListener("pointerdown", onUserPointerDown);
        window.removeEventListener("mousedown", onUserPointerDown);
        window.removeEventListener("touchstart", onUserPointerDown);

        window.removeEventListener("pointerdown", onGlobalPointerDownCapture, {
          capture: true,
        } as any);

        window.removeEventListener("keydown", onKeyDown);

        killArrowTween();
        killSnapTween(true);

        stopDragTicker();

        dragObserver.kill();
        myObserver.kill();
        navST.kill();

        for (const t of ScrollTrigger.getAll()) t.kill();

        smootherRef.current?.kill?.();
        smootherRef.current = null;
      };
    },
    { scope: wrapperRef },
  );

  const onOpenChange = (open: boolean) => {
    setDetailOpen(open);
    detailOpenRef.current = open;

    const s = smootherRef.current;
    if (s && typeof s.paused === "function") {
      s.paused(open);
    }

    if (open) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  };

  return (
    <>
      <div
        id="smooth-wrapper"
        ref={wrapperRef}
        className="min-h-screen select-none"
        style={{ touchAction: "none", overscrollBehavior: "none" }}
      >
        <div
          id="smooth-content"
          className="select-none"
          style={{ touchAction: "none" }}
        >
          {/* INTRO */}
          <section
            className="flex h-screen items-center justify-center bg-indigo-700 text-white"
            data-snap="true"
          >
            <h1 className="font-bold text-5xl">Intro (Vertical)</h1>
          </section>

          {/* HORIZONTAL RIGHT */}
          <section
            className="pinned-section relative h-screen overflow-hidden bg-orange-500"
            data-axis="x"
            data-direction="right"
            data-snap="false"
          >
            <div className="scroll-track flex w-max">
              <Panel label="A" />

              <div
                className="flex h-screen w-[2000px] items-center justify-center bg-green-950"
                data-snap="false"
              >
                <div className="rounded-xl bg-white p-16 font-bold text-4xl text-black">
                  Long B
                </div>
              </div>

              <div
                className="flex h-screen w-screen items-center justify-center bg-purple-800 text-white"
                data-snap="false"
              >
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-10">
                  <p className="select-text leading-relaxed">
                    {lorem.generateParagraphs(3)}
                  </p>

                  <div className="flex">
                    <Button
                      type="button"
                      onClick={() => onOpenChange(true)}
                      className="select-none"
                    >
                      More info →
                    </Button>
                  </div>
                </div>
              </div>

              <Panel label="C" />
            </div>
          </section>

          {/* VERTICAL DOWN */}
          <section
            className="pinned-section relative h-[1000px] overflow-hidden bg-cyan-600 text-white"
            data-axis="y"
            data-direction="down"
            data-snap="true"
          >
            <h2 className="pointer-events-none absolute top-8 left-8 z-10 font-semibold text-4xl">
              Vertical Section
            </h2>

            <div className="scroll-track">
              <Panel label="Vertical 1" snap />

              <div
                className="flex h-[2000px] w-screen items-center justify-center bg-red-800 text-white"
                data-snap="true"
              >
                {lorem.generateParagraphs(3)}
              </div>

              <Panel label="Vertical 2" snap />

              <div
                className="flex h-[2000px] w-screen items-center justify-center bg-purple-800 text-white"
                data-snap="true"
              >
                {lorem.generateParagraphs(3)}
              </div>

              <Panel label="Vertical 3" snap />
            </div>
          </section>

          {/* HORIZONTAL LEFT */}
          <section
            className="pinned-section relative h-screen overflow-hidden bg-pink-600"
            data-axis="x"
            data-direction="left"
            data-snap="true"
          >
            <div className="scroll-track flex w-max">
              <Panel label="E" snap />
              <Panel label="D" snap />

              <div
                className="flex h-screen w-screen items-center justify-center bg-purple-800 text-white"
                data-snap="true"
              >
                {lorem.generateParagraphs(3)}
              </div>
            </div>
          </section>

          {/* VERTICAL UP */}
          <section
            className="pinned-section relative h-screen overflow-hidden bg-slate-900 text-white"
            data-axis="y"
            data-direction="up"
            data-snap="true"
          >
            <div className="scroll-track">
              <Panel label="Upside 3" snap />
              <Panel label="Upside 2" snap />
              <Panel label="Upside 1" snap />
            </div>
          </section>

          {/* OUTRO */}
          <section
            className="flex h-screen items-center justify-center bg-black text-white"
            data-snap="true"
          >
            <h2 className="font-semibold text-4xl">Outro</h2>
          </section>
        </div>
      </div>

      <Drawer
        open={detailOpen}
        onOpenChange={onOpenChange}
        direction="right"
        dismissible={false}
      >
        {/* ---------- DETAIL “PAGE” INSIDE DRAWER ---------- */}
        <DrawerContent className="m-0 h-[100svh] w-screen rounded-none border-0 bg-neutral-950 p-0">
          <div className="relative h-[100svh] w-screen bg-neutral-950 text-white">
            {/* Top bar (fixed + safe area) */}
            <div className="fixed top-0 right-0 left-0 z-50 border-white/10 border-b bg-neutral-950/90 px-4 backdrop-blur">
              <div className="flex items-center justify-between py-3 pt-[calc(env(safe-area-inset-top)+12px)]">
                <DrawerHeader className="p-0">
                  <DrawerTitle className="font-semibold text-base">
                    More information
                  </DrawerTitle>
                </DrawerHeader>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                  className="select-none"
                >
                  ← Return
                </Button>
              </div>
            </div>

            {/* Scrollable detail content (stable vh + safe-area bottom) */}
            <div className="h-[100svh] overflow-y-auto pb-[env(safe-area-inset-bottom)] pt-[calc(env(safe-area-inset-top)+64px)]">
              <section className="flex min-h-[100svh] items-center justify-center px-6">
                <div className="mx-auto w-full max-w-3xl space-y-4">
                  <h3 className="font-bold text-3xl">Details view</h3>
                  <p className="text-white/80 leading-relaxed">{detailText}</p>
                  <p className="select-text text-white/80 leading-relaxed">
                    This is a separate scroll area (inside the Drawer). Your
                    main GSAP page is paused while this is open.
                  </p>
                </div>
              </section>

              <section className="flex min-h-[100svh] items-center justify-center bg-white/5 px-6">
                <div className="mx-auto w-full max-w-3xl space-y-4">
                  <h4 className="font-semibold text-2xl">More sections</h4>
                  <p className="text-white/80 leading-relaxed">
                    Add as many sections as you want here. If you want the
                    *exact* pinned horizontal/vertical GSAP behavior inside the
                    drawer too, you’d set up a second ScrollTrigger “scroller”
                    bound to this overflow container (different setup than
                    window/ScrollSmoother).
                  </p>
                </div>
              </section>

              <section className="flex min-h-[100svh] items-center justify-center px-6">
                <div className="mx-auto w-full max-w-3xl space-y-4">
                  <h4 className="font-semibold text-2xl">End</h4>
                  <p className="text-white/80 leading-relaxed">
                    Close with the Return button (top-right).
                  </p>
                </div>
              </section>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

/* ---------- Helper ---------- */

function Panel({ label, snap }: { label: string; snap?: boolean }) {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center"
      data-snap={snap ? "true" : "false"}
    >
      <div className="rounded-xl bg-white p-16 font-bold text-4xl text-black">
        {label}
      </div>
    </div>
  );
}
