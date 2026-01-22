"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

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

export default function ScrollPageMixedFixed() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const smootherRef = useRef<Smoother | null>(null);

  useGSAP(
    () => {
      // ---------- SCROLL SMOOTHER ----------
      // Lower smooth = faster response (less "glide")
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 0.25, // was 1
        smoothTouch: 0.15, // helps on touch devices
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

          const fromVal =
            axis === "x"
              ? direction === "right"
                ? 0
                : -travel
              : direction === "down"
                ? 0
                : -travel;

          const toVal =
            axis === "x"
              ? direction === "right"
                ? -travel
                : 0
              : direction === "down"
                ? -travel
                : 0;

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
          } as gsap.TweenVars
        );

        pinnedMeta.set(section, {
          section,
          track,
          axis,
          direction,
          getTravel,
          getFromTo,
          getST: () =>
            ScrollTrigger.getAll().find((t) => t.trigger === section) ?? null,
        });
      }

      // ---------- SNAP (ANY data-snap="true") ----------
      const SNAP_SELECTOR = '[data-snap="true"]';
      const SNAP_VISIBILITY = 0.1;

      // Make snap feel decisive (faster)
      const SNAP_DURATION = 0.18; // ~0.12–0.25 feels snappy
      const SNAP_EASE: gsap.EaseString = "power3.out"; // fast settle

      const clamp = (v: number, min: number, max: number) =>
        Math.max(min, Math.min(max, v));

      const getViewportIntersectionRatio = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        const vw = window.innerWidth || 1;
        const vh = window.innerHeight || 1;

        const left = clamp(r.left, 0, vw);
        const right = clamp(r.right, 0, vw);
        const top = clamp(r.top, 0, vh);
        const bottom = clamp(r.bottom, 0, vh);

        const visibleW = Math.max(0, right - left);
        const visibleH = Math.max(0, bottom - top);

        return (visibleW * visibleH) / (vw * vh);
      };

      const getDominantSnapEl = (els: HTMLElement[]) => {
        let best: HTMLElement | null = null;
        let bestRatio = 0;

        for (const el of els) {
          const ratio = getViewportIntersectionRatio(el);
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = el;
          }
        }

        return { el: best, ratio: bestRatio };
      };

      const offsetWithin = (
        el: HTMLElement,
        ancestor: HTMLElement,
        axis: Axis
      ) => {
        let cur: HTMLElement | null = el;
        let acc = 0;

        while (cur && cur !== ancestor) {
          acc += axis === "x" ? cur.offsetLeft : cur.offsetTop;
          cur = cur.offsetParent as HTMLElement | null;
        }

        return cur === ancestor ? acc : 0;
      };

      const scrollForSnapEl = (el: HTMLElement): number => {
        const pinnedSection = el.closest(
          ".pinned-section"
        ) as HTMLElement | null;
        if (!pinnedSection) return el.offsetTop;

        const meta = pinnedMeta.get(pinnedSection);
        if (!meta) return el.offsetTop;

        const st = meta.getST();
        if (!st) return el.offsetTop;

        const start = st.start as number;
        const end = st.end as number;

        const travel = meta.getTravel();
        if (!travel) return start;

        const track = meta.track;
        if (!el.closest(".scroll-track")) return start;

        const offset = offsetWithin(el, track, meta.axis);

        // Align element's start with viewport start (top/left)
        const target = -offset;

        const { fromVal, toVal } = meta.getFromTo();
        const denom = toVal - fromVal;
        if (!denom) return start;

        const p = clamp((target - fromVal) / denom, 0, 1);
        return start + p * (end - start);
      };

      const buildSnapPoints = () => {
        const snapEls = gsap.utils.toArray<HTMLElement>(SNAP_SELECTOR);
        const max = ScrollTrigger.maxScroll(window);

        const points = snapEls
          .map(scrollForSnapEl)
          .map((p) => clamp(p, 0, max));

        const uniqueSorted = Array.from(new Set(points)).sort((a, b) => a - b);

        return { snapEls, snapPoints: uniqueSorted };
      };

      const createSnapTrigger = (
        snapEls: HTMLElement[],
        snapPoints: number[]
      ) => {
        return ScrollTrigger.create({
          trigger: document.documentElement,
          start: 0,
          end: () => ScrollTrigger.maxScroll(window),
          snap: {
            snapTo: (rawProgress) => {
              const max = ScrollTrigger.maxScroll(window);
              if (!max) return rawProgress;

              const rawScroll = rawProgress * max;

              const { el, ratio } = getDominantSnapEl(snapEls);
              if (!el || ratio < SNAP_VISIBILITY) return rawProgress;

              const snapped = gsap.utils.snap(snapPoints, rawScroll);
              return snapped / max;
            },
            duration: SNAP_DURATION, // was 0
            ease: SNAP_EASE, // add ease to make it feel quick
            delay: 0, // keep at 0 so it starts immediately
          },
        });
      };

      ScrollTrigger.refresh();

      let { snapEls, snapPoints } = buildSnapPoints();
      let snapST = createSnapTrigger(snapEls, snapPoints);

      const onRefresh = () => {
        snapST.kill();
        ({ snapEls, snapPoints } = buildSnapPoints());
        snapST = createSnapTrigger(snapEls, snapPoints);
      };

      ScrollTrigger.addEventListener("refresh", onRefresh);

      return () => {
        ScrollTrigger.removeEventListener("refresh", onRefresh);

        for (const t of ScrollTrigger.getAll()) t.kill();

        smootherRef.current?.kill();
        smootherRef.current = null;
      };
    },
    { scope: wrapperRef }
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
          data-snap="true"
        >
          <div className="scroll-track flex h-full w-max">
            <Panel label="A" snap />
            <Panel label="B" snap />
            <Panel label="C" snap />
          </div>
        </section>

        {/* VERTICAL DOWN */}
        <section
          className="pinned-section relative h-screen overflow-hidden bg-cyan-600 text-white"
          data-axis="y"
          data-direction="down"
          data-snap="true"
        >
          <h2 className="pointer-events-none absolute left-8 top-8 z-10 text-4xl font-semibold">
            Vertical Section
          </h2>

          <div className="scroll-track absolute inset-0">
            <Panel label="Vertical 1" snap />
            <div className="flex h-[2000px] w-screen" data-snap="true">
              test
            </div>
            <Panel label="Vertical 2" snap />
            <div className="flex h-screen w-screen" data-snap="true">
              test
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
          <div className="scroll-track flex h-full w-max">
            <Panel label="D" snap />
            <Panel label="E" snap />
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
            {Array.from({ length: 8 }).map((_, i) => (
              <Panel key={i} label={`Upside ${i + 1}`} snap />
            ))}
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
      data-snap={snap ? "true" : undefined}
    >
      <div className="rounded-xl bg-white p-16 text-4xl font-bold text-black">
        {label}
      </div>
    </div>
  );
}
