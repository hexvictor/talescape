"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

type InitArgs = {
  wrapper: string;
  content: string;
};

export function createScrollDriver(smootherRef: React.RefObject<any>) {
  const getScroll = () => {
    const s = smootherRef.current;
    if (s && typeof s.scrollTop === "function") return s.scrollTop();
    return ScrollTrigger.scroll();
  };

  const setScroll = (v: number) => {
    const s = smootherRef.current;
    if (s && typeof s.scrollTop === "function") s.scrollTop(v);
    else ScrollTrigger.scroll(v);
  };

  const scrollTo = (
    targetScroll: number,
    opts: { duration: number; ease: gsap.EaseString; onDone?: () => void },
  ) => {
    const startScroll = getScroll();
    const max = ScrollTrigger.maxScroll(window);
    const clampedTarget = Math.max(0, Math.min(max, targetScroll));

    if (Math.abs(clampedTarget - startScroll) < 2) {
      opts.onDone?.();
      return null;
    }

    const proxy = { v: startScroll };
    return gsap.to(proxy, {
      v: clampedTarget,
      duration: opts.duration,
      ease: opts.ease,
      overwrite: "auto",
      onUpdate: () => setScroll(proxy.v),
      onComplete: opts.onDone,
    });
  };

  const init = ({ wrapper, content }: InitArgs) => {
    const s = ScrollSmoother.create({
      wrapper,
      content,
      smooth: 1.5,
      smoothTouch: 0.15,
      effects: true,
      normalizeScroll: true,
    });
    smootherRef.current = s;
  };

  const setPaused = (paused: boolean) => {
    const s = smootherRef.current;
    if (s && typeof s.paused === "function") s.paused(paused);
  };

  const cleanup = () => {
    const s = smootherRef.current;
    if (s && typeof s.kill === "function") s.kill();
    smootherRef.current = null;
  };

  return { init, cleanup, getScroll, setScroll, scrollTo, setPaused };
}
