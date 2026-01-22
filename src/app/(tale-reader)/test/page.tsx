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

export default function ScrollPageMixedFixed() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const smootherRef = useRef<Smoother | null>(null);

  useGSAP(
    () => {
      // ---------- SCROLL SMOOTHER ----------
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
        normalizeScroll: true,
      }) as unknown as Smoother;

      smootherRef.current = smoother;

      // ---------- BOX DEMO ----------
      const boxes = gsap.utils.toArray<HTMLElement>(".box");
      for (const box of boxes) {
        gsap.to(box, {
          x: 150,
          scrollTrigger: {
            trigger: box,
            start: "bottom bottom",
            end: "top 20%",
            scrub: true,
          },
        });
      }

      // ---------- PINNED TRACK SECTIONS (x or y) ----------
      const pinnedSections = gsap.utils.toArray<HTMLElement>(".pinned-section");

      for (const section of pinnedSections) {
        const track = section.querySelector<HTMLElement>(".scroll-track");
        if (!track) continue;

        const axis = (section.dataset.axis ?? "x") as Axis;

        const direction =
          section.dataset.direction ??
          (axis === "x" ? ("right" as DirX) : ("down" as DirY));

        const travel = () => {
          if (axis === "x")
            return Math.max(0, track.scrollWidth - window.innerWidth);
          return Math.max(0, track.scrollHeight - window.innerHeight);
        };

        const fromVal =
          axis === "x"
            ? (direction as DirX) === "right"
              ? 0
              : -travel()
            : (direction as DirY) === "down"
              ? 0
              : -travel();

        const toVal =
          axis === "x"
            ? (direction as DirX) === "right"
              ? -travel()
              : 0
            : (direction as DirY) === "down"
              ? -travel()
              : 0;

        gsap.fromTo(
          track,
          { [axis]: fromVal } as gsap.TweenVars,
          {
            [axis]: toVal,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${travel()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          } as gsap.TweenVars
        );
      }

      // ---------- SNAP (sections + panels) ----------
      const buildSnapPoints = () => {
        const points: number[] = [];

        // 1) snap to every section top
        const allSections = gsap.utils.toArray<HTMLElement>(
          "#smooth-content > section"
        );
        for (const s of allSections) points.push(s.offsetTop);

        // 2) snap inside each pinned section (panel stops)
        const sections = gsap.utils.toArray<HTMLElement>(".pinned-section");
        for (const section of sections) {
          const st = ScrollTrigger.getAll().find((t) => t.trigger === section);
          if (!st) continue;

          const panels = section.querySelectorAll(".scroll-track > *");
          const count = panels.length;
          if (count <= 1) continue;

          const start = st.start as number;
          const end = st.end as number;
          const step = (end - start) / (count - 1);

          for (let i = 0; i < count; i++) points.push(start + step * i);
        }

        const max = ScrollTrigger.maxScroll(window);

        return Array.from(new Set(points))
          .map((p) => Math.max(0, Math.min(max, p)))
          .sort((a, b) => a - b);
      };

      const createSnapTrigger = (snapPoints: number[]) => {
        return ScrollTrigger.create({
          trigger: document.documentElement,
          start: 0,
          end: () => ScrollTrigger.maxScroll(window),
          snap: {
            snapTo: (rawProgress) => {
              const max = ScrollTrigger.maxScroll(window);
              const rawScroll = rawProgress * max;
              const snappedScroll = gsap.utils.snap(snapPoints, rawScroll);
              return max ? snappedScroll / max : 0;
            },
            duration: 0.35,
            delay: 0.08,
            ease: "power2.out",
          },
        });
      };

      ScrollTrigger.refresh();

      let snapPoints = buildSnapPoints();
      let snapST = createSnapTrigger(snapPoints);

      const onRefresh = () => {
        snapST.kill();
        snapPoints = buildSnapPoints();
        snapST = createSnapTrigger(snapPoints);
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
        <section className="flex h-screen items-center justify-center bg-indigo-700 text-white">
          <h1 className="font-bold text-5xl">Intro (Vertical)</h1>
        </section>

        {/* BOXES */}
        <section className="flex h-screen items-center justify-center bg-emerald-600">
          <div className="flex flex-col gap-6">
            <div className="box flex h-[75px] w-[75px] items-center justify-center rounded-xl bg-white font-bold text-black">
              box
            </div>
            <div className="box flex h-[75px] w-[75px] items-center justify-center rounded-xl bg-white font-bold text-black">
              box
            </div>
            <div className="box flex h-[75px] w-[75px] items-center justify-center rounded-xl bg-white font-bold text-black">
              box
            </div>
          </div>
        </section>

        {/* HORIZONTAL RIGHT */}
        <section
          className="pinned-section relative h-screen overflow-hidden bg-orange-500"
          data-axis="x"
          data-direction="right"
        >
          <div className="scroll-track flex h-full w-max">
            <Panel label="A" />
            <Panel label="B" />
            <Panel label="C" />
          </div>
        </section>

        {/* VERTICAL */}
        <section
          className="pinned-section relative h-screen overflow-hidden bg-cyan-600 text-white"
          data-axis="y"
          data-direction="down"
        >
          <h2 className="font-semibold text-4xl">Vertical Section</h2>
          <div className="scroll-track">
            <Panel label="Vertical 1" />
            <Panel label="Vertical 2" />
            <Panel label="Vertical 3" />
          </div>
        </section>

        {/* HORIZONTAL LEFT */}
        <section
          className="pinned-section relative h-screen overflow-hidden bg-pink-600"
          data-axis="x"
          data-direction="left"
        >
          <div className="scroll-track flex h-full w-max">
            <Panel label="D" />
            <Panel label="E" />
          </div>
        </section>

        {/* VERTICAL UPSIDE-DOWN (same pattern) */}
        <section
          className="pinned-section relative h-screen overflow-hidden bg-slate-900 text-white"
          data-axis="y"
          data-direction="up"
        >
          <div className="scroll-track">
            {Array.from({ length: 8 }).map((_, i) => (
              <UpsidePanel key={i} title={`Upside ${i + 1}`} />
            ))}
          </div>
        </section>

        {/* OUTRO */}
        <section className="flex h-screen items-center justify-center bg-black text-white">
          <h2 className="font-semibold text-4xl">Outro</h2>
        </section>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Panel({ label }: { label: string }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="rounded-xl bg-white p-16 font-bold text-4xl text-black">
        {label}
      </div>
    </div>
  );
}

function UpsidePanel({ title }: { title: string }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded-xl bg-white/10 p-16 font-bold text-3xl backdrop-blur">
        {title}
      </div>
    </div>
  );
}
