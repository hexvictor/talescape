"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import type { RefObject } from "react";

type Args = {
  smootherRef: RefObject<any>;
  wrapper: string;
  content: string;
};

export function useGsapSmoother({ smootherRef, wrapper, content }: Args) {
  const smoother = ScrollSmoother.create({
    wrapper,
    content,
    smooth: 1.5,
    smoothTouch: 0.15,
    effects: true,
    normalizeScroll: true,
  });

  smootherRef.current = smoother;

  const getScroll = () =>
    smootherRef.current && typeof smootherRef.current.scrollTop === "function"
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

  const pause = (paused: boolean) => {
    if (
      smootherRef.current &&
      typeof smootherRef.current.paused === "function"
    ) {
      smootherRef.current.paused(paused);
    }
  };

  const cleanup = () => {
    smootherRef.current?.kill?.();
    smootherRef.current = null;
  };

  return { getScroll, setScroll, pause, cleanup };
}
