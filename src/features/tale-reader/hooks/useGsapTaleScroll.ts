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

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

type UseGsapTaleScrollArgs = {
  wrapperRef: React.RefObject<HTMLElement | null>;
};

export function useGsapTaleScroll({ wrapperRef }: UseGsapTaleScrollArgs) {
  const taleHubOpen = useReaderStore((s) => s.taleHubOpen);

  const smootherRef = useRef<any>(null);
  const apiRef = useRef<{
    setHubOpen: (open: boolean) => void;
    rebuild: () => void;
    cleanup: () => void;
  } | null>(null);

  const driver = useMemo(() => createScrollDriver(smootherRef), []);
  const pinnedRef = useRef<PinnedLayoutApi | null>(null);
  const modelRef = useRef<SnapModelApi | null>(null);
  const inputsRef = useRef<InputsApi | null>(null);

  useGSAP(
    () => {
      ScrollTrigger.config({ ignoreMobileResize: true });

      driver.init({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
      });

      pinnedRef.current = initPinnedLayout();

      modelRef.current = createSnapModel({
        pinnedMeta: pinnedRef.current.pinnedMeta,
        pinnedSTBySection: pinnedRef.current.pinnedSTBySection,
      });

      inputsRef.current = attachInputs({
        driver,
        model: modelRef.current,
      });

      modelRef.current.rebuild();

      const rebuild = () => {
        inputsRef.current?.killTweens(true);
        modelRef.current?.rebuild();
      };

      const setHubOpen = (open: boolean) => {
        driver.setPaused(open);

        if (open) {
          document.documentElement.style.overflow = "hidden";
          document.body.style.overflow = "hidden";
          inputsRef.current?.disable();
        } else {
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
          inputsRef.current?.enable();
        }
      };

      apiRef.current = {
        setHubOpen,
        rebuild,
        cleanup: () => {
          inputsRef.current?.cleanup();
          inputsRef.current = null;

          modelRef.current?.cleanup();
          modelRef.current = null;

          pinnedRef.current?.cleanup();
          pinnedRef.current = null;

          driver.cleanup();
        },
      };

      apiRef.current.setHubOpen(!!taleHubOpen);

      ScrollTrigger.refresh();
      modelRef.current.rebuild();

      ScrollTrigger.addEventListener("refresh", rebuild);

      return () => {
        ScrollTrigger.removeEventListener("refresh", rebuild);

        apiRef.current?.cleanup();
        apiRef.current = null;

        for (const t of ScrollTrigger.getAll()) t.kill();
      };
    },
    { scope: wrapperRef },
  );

  useEffect(() => {
    apiRef.current?.setHubOpen(!!taleHubOpen);
  }, [taleHubOpen]);

  return {};
}
