"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import { createScrollDriver } from "~/features/tale-reader/scroll-engine/scrollDriver";
import {
  initPinnedLayout,
  type PinnedLayoutApi,
} from "~/features/tale-reader/scroll-engine/pinnedLayout";
import {
  createSnapModel,
  type SnapModelApi,
} from "~/features/tale-reader/scroll-engine/snapModel";
import {
  attachInputs,
  type InputsApi,
} from "~/features/tale-reader/scroll-engine/input";
import { initActiveBlockTracker } from "~/features/tale-reader/scroll-engine/activeBlockTracker";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

type UseTaleScrollEngineArgs = {
  wrapperRef: React.RefObject<HTMLElement | null>;
};

export function useTaleScrollEngine({ wrapperRef }: UseTaleScrollEngineArgs) {
  const taleHubOpen = useReaderStore((s) => s.taleHubOpen);
  const setScrollApi = useReaderStore((s) => s.setScrollApi);
  const clearScrollApi = useReaderStore((s) => s.clearScrollApi);
  const blocksById = useReaderStore((s) => s.tale.structure.indexMap.blocksById);
  const onActiveBlockChanged = useReaderStore((s) => s.onActiveBlockChanged);

  // biome-ignore lint/suspicious/noExplicitAny
  const smootherRef = useRef<any>(null);

  const engineApiRef = useRef<{
    setHubOpen: (open: boolean) => void;
    rebuild: () => void;
    cleanup: () => void;
  } | null>(null);

  const isProgrammaticScrollRef = useRef(false);
  const pendingTargetBlockIdRef = useRef<number | null>(null);

  const driver = useMemo(() => createScrollDriver(smootherRef), []);
  const pinnedLayoutRef = useRef<PinnedLayoutApi | null>(null);
  const snapModelRef = useRef<SnapModelApi | null>(null);
  const inputsApiRef = useRef<InputsApi | null>(null);
  const activeTrackerRef = useRef<ReturnType<
    typeof initActiveBlockTracker
  > | null>(null);

  useGSAP(
    () => {
      ScrollTrigger.config({ ignoreMobileResize: true });

      driver.init({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
      });

      pinnedLayoutRef.current = initPinnedLayout();

      snapModelRef.current = createSnapModel({
        pinnedMeta: pinnedLayoutRef.current.pinnedMeta,
        pinnedSTBySection: pinnedLayoutRef.current.pinnedSTBySection,
      });

      inputsApiRef.current = attachInputs({
        driver,
        model: snapModelRef.current,
      });

      activeTrackerRef.current = initActiveBlockTracker({
        model: snapModelRef.current,
        getScroll: driver.getScroll,
        onActiveBlockChanged,
        shouldTrack: () => !isProgrammaticScrollRef.current,
      });

      const rebuild = () => {
        inputsApiRef.current?.killTweens(true);
        snapModelRef.current?.rebuild();
        activeTrackerRef.current?.rebuild();
      };

      const setHubOpen = (open: boolean) => {
        driver.setPaused(open);

        if (open) {
          document.documentElement.style.overflow = "hidden";
          document.body.style.overflow = "hidden";
          inputsApiRef.current?.disable();
        } else {
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
          inputsApiRef.current?.enable();
        }
      };

      engineApiRef.current = {
        setHubOpen,
        rebuild,
        cleanup: () => {
          clearScrollApi();

          activeTrackerRef.current?.cleanup();
          activeTrackerRef.current = null;

          inputsApiRef.current?.cleanup();
          inputsApiRef.current = null;

          snapModelRef.current?.cleanup();
          snapModelRef.current = null;

          pinnedLayoutRef.current?.cleanup();
          pinnedLayoutRef.current = null;

          driver.cleanup();
        },
      };

      setScrollApi({
        scrollToBlockId: (blockId: number, opts?: { duration?: number }) => {
          const block = blocksById[blockId];
          if (!block) return;

          const el = document.querySelector<HTMLElement>(
            `[data-anchor-id="${block.anchorId}"]`,
          );
          if (!el) return;

          const range = snapModelRef.current?.getRangeForElement(el);
          if (!range) return;

          isProgrammaticScrollRef.current = true;
          pendingTargetBlockIdRef.current = blockId;

          driver.scrollTo(range.start, {
            duration: opts?.duration ?? 0.35,
            ease: "power1.inOut",
            onDone: () => {
              const targetBlockId = pendingTargetBlockIdRef.current;

              isProgrammaticScrollRef.current = false;
              pendingTargetBlockIdRef.current = null;

              if (targetBlockId != null) {
                onActiveBlockChanged(targetBlockId);
              } else {
                activeTrackerRef.current?.updateNow();
              }
            },
          });
        },
        setPaused: (paused: boolean) => {
          driver.setPaused(paused);
        },
        rebuild: () => {
          rebuild();
        },
      });

      engineApiRef.current.setHubOpen(!!taleHubOpen);

      ScrollTrigger.refresh();
      snapModelRef.current.rebuild();
      activeTrackerRef.current.rebuild();

      ScrollTrigger.addEventListener("refresh", rebuild);

      return () => {
        ScrollTrigger.removeEventListener("refresh", rebuild);

        engineApiRef.current?.cleanup();
        engineApiRef.current = null;

        for (const trigger of ScrollTrigger.getAll()) {
          trigger.kill();
        }
      };
    },
    { scope: wrapperRef },
  );

  useEffect(() => {
    engineApiRef.current?.setHubOpen(!!taleHubOpen);
  }, [taleHubOpen]);

  return {};
}