"use client";

import type React from "react";
import { createContext, useContext } from "react";

export type SectionLayout = "vertical" | "horizontal";
export type HorizontalDirection = "left" | "right";

export type HorizontalSectionRegistration = {
  id: string;
  pinEl: HTMLElement;
  trackEl: HTMLElement;
  direction: HorizontalDirection;
};

type ScrollStageContextValue = {
  registerHorizontalSection: (reg: HorizontalSectionRegistration) => void;
  unregisterHorizontalSection: (id: string) => void;

  /** Optional helper for nav: scroll to an element using the active smooth scroller */
  scrollToElement: (
    el: HTMLElement,
    opts?: { offset?: number; duration?: number }
  ) => void;
};

const ScrollStageContext = createContext<ScrollStageContextValue | null>(null);

export function ScrollStageProvider({
  value,
  children,
}: {
  value: ScrollStageContextValue;
  children: React.ReactNode;
}) {
  return (
    <ScrollStageContext.Provider value={value}>
      {children}
    </ScrollStageContext.Provider>
  );
}

export function useScrollStage() {
  const ctx = useContext(ScrollStageContext);
  if (!ctx)
    throw new Error("useScrollStage must be used inside <ScrollStage />");
  return ctx;
}
