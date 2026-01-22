"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum({
  sentencesPerParagraph: { max: 6, min: 3 },
  wordsPerSentence: { max: 12, min: 5 },
});

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

type Smoother = {
  kill: () => void;
};

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
  const smootherRef = useRef<Smoother | null>(null);

  useGSAP(
    () => {
      // ---------- SCROLL SMOOTHER ----------
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        smoothTouch: 0.15,
        effects: true,
        normalizeScroll: true,
      }) as unknown as Smoother;

      smootherRef.current = smoother;

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

          // X axis keeps true direction behavior
          if (axis === "x") {
            const fromVal = direction === "right" ? 0 : -travel;
            const toVal = direction === "right" ? -travel : 0;
            return { fromVal, toVal };
          }

          // Y axis (keep your current “true reverse up” behavior)
          // down: 0 -> -travel
          // up:   -travel -> 0
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

      // Smooth arrow scrolling settings
      const ARROW_DURATION = 0.18;
      const ARROW_EASE: gsap.EaseString = "power2.out";
      const ARROW_DELTA = 220; // feel free to tune (180–320)

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

        // align element start with viewport start
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
        const cur = navST.scroll();
        const EPS = 20;

        // prefer containment
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          if (cur >= it.start - EPS && cur <= it.end + EPS) return i;
        }

        // fallback: closest start
        let best = 0;
        let bestDist = Infinity;
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
        const startScroll = navST.scroll();
        const max = ScrollTrigger.maxScroll(window);
        const clampedTarget = clamp(targetScroll, 0, max);

        if (Math.abs(clampedTarget - startScroll) < 2) {
          onDone?.();
          return;
        }

        const proxy = { v: startScroll };

        // IMPORTANT: overwrite so repeated keydown feels continuous, not stuttery
        return gsap.to(proxy, {
          v: clampedTarget,
          duration,
          ease,
          overwrite: "auto",
          onUpdate: () => navST.scroll(proxy.v),
          onComplete: onDone,
        });
      };

      const gotoIndex = (index: number, forward: boolean) => {
        if (index < 0 || index >= items.length) return;

        animating = true;
        killArrowTween(); // don’t fight arrow tween

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

      // Returns true if snapped
      const tryStep = (forward: boolean): boolean => {
        if (animating) return false;

        const idx = getIndexFromScroll();
        const cur = navST.scroll();
        const curItem = items[idx];
        if (!curItem) return false;

        const nextIdx = forward ? idx + 1 : idx - 1;
        const target = items[nextIdx];
        if (!target) return false;

        // Only snap if target is snap=true
        if (!target.snap) return false;

        // Gating: don’t leave current item until reaching its boundary
        const EPS = 20;
        if (forward) {
          if (cur < curItem.end - EPS) return false;
        } else {
          if (cur > curItem.start + EPS) return false;
        }

        gotoIndex(nextIdx, forward);
        return true;
      };

      // Wheel/touch: only prevent default when snapping
      const myObserver = ScrollTrigger.observe({
        type: "wheel,touch",
        wheelSpeed: -1,
        tolerance: 10,
        preventDefault: false,

        onUp: (self) => {
          const didSnap = tryStep(true);
          if (didSnap && self?.event?.preventDefault)
            self.event.preventDefault();
        },

        onDown: (self) => {
          const didSnap = tryStep(false);
          if (didSnap && self?.event?.preventDefault)
            self.event.preventDefault();
        },

        onPress: (self) => {
          if (ScrollTrigger.isTouch && animating) self.event.preventDefault();
        },
      });

      // ✅ Smooth arrow scrolling (no teleport)
      const nudgeSmooth = (forward: boolean) => {
        // if user is nudging, don’t keep “snap animating” state
        killSnapTween(true);

        const cur = navST.scroll();

        // accumulate: if an arrow tween is already running, nudge from its current target-ish
        // easiest: use current scroll (it’s updated), add delta
        const target = cur + (forward ? ARROW_DELTA : -ARROW_DELTA);

        arrowTween = tweenScrollTo(target, ARROW_DURATION, ARROW_EASE, () => {
          arrowTween = null;
        }) as gsap.core.Tween;
      };

      const onKeyDown = (e: KeyboardEvent) => {
        const k = e.key;

        const forward = k === "ArrowDown" || k === "ArrowRight";
        const reverse = k === "ArrowUp" || k === "ArrowLeft";
        if (!forward && !reverse) return;

        // Always prevent native arrow scroll (it’s tiny + feels “slow”)
        e.preventDefault();

        const didSnap = forward ? tryStep(true) : tryStep(false);
        if (!didSnap) {
          // Not snapping (target is snap=false OR gating not satisfied) => smooth nudge
          nudgeSmooth(forward);
        }
      };

      // Kill tweens when user grabs scrollbar etc.
      const onUserPointerDown = () => {
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

      window.addEventListener("keydown", onKeyDown, { passive: false });

      return () => {
        ScrollTrigger.removeEventListener("refresh", onRefresh);

        window.removeEventListener("pointerdown", onUserPointerDown);
        window.removeEventListener("mousedown", onUserPointerDown);
        window.removeEventListener("touchstart", onUserPointerDown);

        window.removeEventListener("keydown", onKeyDown);

        killArrowTween();
        killSnapTween(true);

        myObserver.kill();
        navST.kill();

        for (const t of ScrollTrigger.getAll()) t.kill();

        smootherRef.current?.kill();
        smootherRef.current = null;
      };
    },
    { scope: wrapperRef },
  );

  return (
    <div id="smooth-wrapper" ref={wrapperRef} className="min-h-screen">
      <div id="smooth-content">
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
              <div className="rounded-xl bg-white p-16 text-4xl font-bold text-white">
                Long B
              </div>
            </div>

            <div
              className="flex h-screen w-screen items-center justify-center bg-purple-800 text-white"
              data-snap="false"
            >
              {lorem.generateParagraphs(3)}
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
          <h2 className="pointer-events-none absolute left-8 top-8 z-10 text-4xl font-semibold">
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
  );
}

/* ---------- Helper ---------- */

function Panel({ label, snap }: { label: string; snap?: boolean }) {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center"
      data-snap={snap ? "true" : "false"}
    >
      <div className="rounded-xl bg-white p-16 text-4xl font-bold text-black">
        {label}
      </div>
    </div>
  );
}
