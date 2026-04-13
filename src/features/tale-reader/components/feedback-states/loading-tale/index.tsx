"use client";

import { useState } from "react";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import MotionReadyProbe from "./MotionReadyProbe";

export default function LoadingTale({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLayoutReady = useReaderStore((s) => s.isLayoutReady);
  const [isMotionReady, setIsMotionReady] = useState(false);

  const isReady = isMotionReady && isLayoutReady;

  return (
    <>
      {!isReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
          <p className="animate-pulse font-semibold text-xl">Loading...</p>
        </div>
      )}

      {!isMotionReady && (
        <MotionReadyProbe onReady={() => setIsMotionReady(true)} />
      )}

      <div
        className={isReady ? "" : "pointer-events-none invisible"}
        aria-hidden={!isReady}
      >
        {children}
      </div>
    </>
  );
}
