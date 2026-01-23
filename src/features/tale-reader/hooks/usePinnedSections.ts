"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Axis = "x" | "y";
type DirX = "right" | "left";
type DirY = "down" | "up";

export type PinnedMeta = {
  section: HTMLElement;
  track: HTMLElement;
  axis: Axis;
  direction: DirX | DirY;
  getTravel: () => number;
  getFromTo: () => { fromVal: number; toVal: number };
};

type Args = {
  getScroll: () => number;
};

export function usePinnedSections(_: Args) {
  const pinnedMeta = new Map<HTMLElement, PinnedMeta>();
  const pinnedSections = gsap.utils.toArray<HTMLElement>(".pinned-section");

  for (const section of pinnedSections) {
    const track = section.querySelector<HTMLElement>(".scroll-track");
    if (!track) continue;

    const axis = (section.dataset.axis ?? "x") as Axis;
    const direction =
      (section.dataset.direction as any) ??
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
      direction,
      getTravel,
      getFromTo,
    });
  }

  const getPinnedST = (section: HTMLElement) =>
    ScrollTrigger.getAll().find((t) => t.trigger === section) ?? null;

  const cleanup = () => {
    // triggers are killed by the parent cleanup
    pinnedMeta.clear();
  };

  return { pinnedMeta, getPinnedST, cleanup };
}
