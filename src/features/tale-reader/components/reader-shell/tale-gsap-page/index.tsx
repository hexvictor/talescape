"use client";

import { useRef } from "react";
import { useGsapTaleScroll } from "~/features/tale-reader/hooks/useGsapTaleScroll";
import { useReaderNavContext } from "~/features/tale-reader/contexts/ReaderNavContext";
import TaleGsapContent from "../tale-gsap-content";

export default function TaleGsapPage() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useGsapTaleScroll({
    wrapperRef,
  });

  return (
    <div
      id="smooth-wrapper"
      ref={wrapperRef}
      className="min-h-screen select-none"
      style={{ touchAction: "none", overscrollBehavior: "none" }}
    >
      <div
        id="smooth-content"
        className="select-none"
        style={{ touchAction: "none" }}
      >
        <TaleGsapContent />
      </div>
    </div>
  );
}
