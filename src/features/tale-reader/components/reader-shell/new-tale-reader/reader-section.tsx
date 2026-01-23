"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import {
  type HorizontalDirection,
  type SectionLayout,
  useScrollStage,
} from "./scroll-stage-context";

type ReaderSectionProps = {
  id: string;

  /** "vertical" renders normally. "horizontal" pins and animates its track. */
  layout: SectionLayout;

  /** Only used when layout === "horizontal". Defaults to "right". */
  direction?: HorizontalDirection;

  /** Classes applied to the outer <section> */
  className?: string;

  /** Classes applied to the horizontal track wrapper when layout === "horizontal" */
  trackClassName?: string;

  children: React.ReactNode;
};

export default function ReaderSection({
  id,
  layout,
  direction = "right",
  className,
  trackClassName,
  children,
}: ReaderSectionProps) {
  const { registerHorizontalSection, unregisterHorizontalSection } =
    useScrollStage();

  const pinRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (layout !== "horizontal") return;

    const pinEl = pinRef.current;
    const trackEl = trackRef.current;
    if (!pinEl || !trackEl) return;

    registerHorizontalSection({ id, pinEl, trackEl, direction });

    return () => {
      unregisterHorizontalSection(id);
    };
  }, [
    id,
    layout,
    direction,
    registerHorizontalSection,
    unregisterHorizontalSection,
  ]);

  // Vertical: plain section
  if (layout === "vertical") {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  // Horizontal: pin container + track
  return (
    <section
      id={id}
      ref={pinRef as React.RefObject<HTMLElement>}
      className={className ?? "relative h-screen overflow-hidden"}
    >
      <div
        ref={trackRef}
        className={trackClassName ?? "flex h-full w-max will-change-transform"}
      >
        {children}
      </div>
    </section>
  );
}
