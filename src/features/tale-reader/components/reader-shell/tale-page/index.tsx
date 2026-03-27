"use client";

import { useRef } from "react";
import { useTaleScrollEngine } from "~/features/tale-reader/hooks/useTaleScrollEngine";
import TaleContent from "../tale-content";
import { usePersistReaderProgress } from "~/features/tale-reader/hooks/usePersistReaderProgress";

export default function TalePage() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useTaleScrollEngine({
    wrapperRef,
  });

  // usePersistReaderProgress();

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
        <TaleContent />
      </div>
    </div>
  );
}