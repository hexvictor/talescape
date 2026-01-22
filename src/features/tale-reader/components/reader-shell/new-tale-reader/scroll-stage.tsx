"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ScrollStageProvider,
  type HorizontalSectionRegistration,
  type HorizontalDirection,
} from "./scroll-stage-context";

/**
 * Minimal “shape” we need from Locomotive, without relying on its incomplete TS types.
 * This avoids:
 * - explicit any
 * - "Property 'scroll' does not exist" TS errors
 */
type LocoScrollState = {
  instance?: {
    scroll?: {
      y?: number;
    };
  };
};

type LocoScrollToOptions = {
  duration?: number;
  disableLerp?: boolean;
  offset?: number;
};

type LocomotiveLike = {
  on: (eventName: "scroll", cb: () => void) => void;
  update: () => void;
  destroy: () => void;
  scrollTo: (
    target: number | HTMLElement,
    options?: LocoScrollToOptions
  ) => void;

  // Optional internal state; TS-safe
  scroll?: LocoScrollState;
};

type ScrollStageProps = {
  children: React.ReactNode;
  className?: string;
};

export default function ScrollStage({ children, className }: ScrollStageProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const locoRef = useRef<LocomotiveLike | null>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);

  // Registry of horizontal sections
  const registryRef = useRef<
    Map<string, Omit<HorizontalSectionRegistration, "id">>
  >(new Map());

  // bump to rebuild triggers when sections mount/unmount
  const [registryVersion, setRegistryVersion] = useState(0);

  const registerHorizontalSection = useCallback(
    (reg: HorizontalSectionRegistration) => {
      registryRef.current.set(reg.id, {
        pinEl: reg.pinEl,
        trackEl: reg.trackEl,
        direction: reg.direction,
      });
      setRegistryVersion((v) => v + 1);
    },
    []
  );

  const unregisterHorizontalSection = useCallback((id: string) => {
    registryRef.current.delete(id);
    setRegistryVersion((v) => v + 1);
  }, []);

  const scrollToElement = useCallback(
    (el: HTMLElement, opts?: { offset?: number; duration?: number }) => {
      const loco = locoRef.current;
      if (!loco) return;

      const offset = opts?.offset ?? 0;
      const duration = opts?.duration ?? 0.8;

      loco.scrollTo(el, { offset, duration, disableLerp: false });
    },
    []
  );

  const ctxValue = useMemo(
    () => ({
      registerHorizontalSection,
      unregisterHorizontalSection,
      scrollToElement,
    }),
    [registerHorizontalSection, unregisterHorizontalSection, scrollToElement]
  );

  const getLocoY = useCallback((): number => {
    const loco = locoRef.current;
    const y = loco?.scroll?.instance?.scroll?.y;
    return typeof y === "number" ? y : 0;
  }, []);

  const rebuildTriggers = useCallback(() => {
    const scrollerEl = scrollerRef.current;
    if (!scrollerEl) return;

    // Kill whatever we built previously
    gsapCtxRef.current?.revert();
    gsapCtxRef.current = null;

    const regs = Array.from(registryRef.current.entries()).map(([id, val]) => ({
      id,
      pinEl: val.pinEl,
      trackEl: val.trackEl,
      direction: val.direction,
    }));

    gsapCtxRef.current = gsap.context(() => {
      for (const { id, pinEl, trackEl, direction } of regs) {
        // width of the horizontal content track
        const trackWidth = trackEl.scrollWidth || trackEl.offsetWidth;
        const travel = Math.max(0, trackWidth - window.innerWidth);

        if (travel <= 0) continue;

        // Direction logic:
        // - "right": start at 0, go to -travel
        // - "left": start at -travel, go to 0
        const fromX = direction === "right" ? 0 : -travel;
        const toX = direction === "right" ? -travel : 0;

        gsap.fromTo(
          trackEl,
          { x: fromX },
          {
            x: toX,
            ease: "none",
            scrollTrigger: {
              id: `horizontal:${id}`,
              scroller: scrollerEl,
              trigger: pinEl,
              start: "top top",
              end: () => `+=${trackWidth}`,
              scrub: true,
              pin: true,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          }
        );
      }
    }, scrollerEl);
  }, []);

  // Init Locomotive + scrollerProxy once
  useEffect(() => {
    const scrollerEl = scrollerRef.current;
    if (!scrollerEl) return;

    gsap.registerPlugin(ScrollTrigger);

    let cancelled = false;

    const init = async () => {
      const mod = await import("locomotive-scroll");
      if (cancelled) return;

      const LocomotiveScrollCtor = mod.default;

      // Create instance (typed as unknown then narrowed to our interface)
      const loco = new LocomotiveScrollCtor({
        el: scrollerEl,
        smooth: true,
      }) as unknown as LocomotiveLike;

      locoRef.current = loco;

      loco.on("scroll", () => {
        ScrollTrigger.update();
      });

      ScrollTrigger.scrollerProxy(scrollerEl, {
        scrollTop(value?: number) {
          if (typeof value === "number") {
            loco.scrollTo(value, { duration: 0, disableLerp: true });
          }
          return getLocoY();
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: scrollerEl.style.transform ? "transform" : "fixed",
      });

      const onRefresh = () => {
        loco.update();
      };

      ScrollTrigger.addEventListener("refresh", onRefresh);

      const onResize = () => {
        rebuildTriggers();
        loco.update();
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", onResize);

      // First build
      rebuildTriggers();
      ScrollTrigger.refresh();

      // Cleanup stored in closure
      const cleanup = () => {
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        window.removeEventListener("resize", onResize);
      };

      // Attach cleanup safely (no "any")
      (loco as unknown as { __cleanup__?: () => void }).__cleanup__ = cleanup;
    };

    void init();

    return () => {
      cancelled = true;

      gsapCtxRef.current?.revert();
      gsapCtxRef.current = null;

      // Prefer for...of instead of forEach
      const triggers = ScrollTrigger.getAll();
      for (const t of triggers) t.kill();

      const loco = locoRef.current;
      if (loco) {
        const holder = loco as unknown as { __cleanup__?: () => void };
        holder.__cleanup__?.();
        loco.destroy();
      }
      locoRef.current = null;
    };
  }, [getLocoY, rebuildTriggers]);

  // Rebuild when horizontal sections register/unregister (supports branching later)
  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    const loco = locoRef.current;
    if (!loco) return;

    // rebuild on next frame so layout settles
    const raf = window.requestAnimationFrame(() => {
      rebuildTriggers();
      loco.update();
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [registryVersion, rebuildTriggers]);

  return (
    <ScrollStageProvider value={ctxValue}>
      <div
        ref={scrollerRef}
        className={className ?? "h-screen w-screen overflow-hidden"}
      >
        {children}
      </div>
    </ScrollStageProvider>
  );
}
