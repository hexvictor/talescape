"use client";

import type { RefObject } from "react";

type Args = {
  smootherRef: RefObject<any>;
};

export function useDrawerScrollLock({ smootherRef }: Args) {
  const onDrawerOpenChange = (open: boolean) => {
    const s = smootherRef.current;
    if (s && typeof s.paused === "function") s.paused(open);

    if (open) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  };

  return { onDrawerOpenChange };
}
