"use client";

import { useEffect, useState } from "react";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import MotionReadyProbe from "./MotionReadyProbe";

export default function LoadingTale({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLayoutReady = useReaderStore((s) => s.isLayoutReady);
  const [isMotionReady, setIsMotionReady] = useState(false);
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);

  const isReady = isMotionReady && isLayoutReady;

  useEffect(() => {
    console.log("[LoadingTale] state", {
      isMotionReady,
      isLayoutReady,
      isReady,
      hasCompletedInitialLoad,
    });

    if (!hasCompletedInitialLoad && isReady) {
      console.log("[LoadingTale] first load completed");
      setHasCompletedInitialLoad(true);
    }
  }, [hasCompletedInitialLoad, isLayoutReady, isMotionReady, isReady]);

  const showInitialLoading = !hasCompletedInitialLoad && !isReady;

  return (
    <>
      {showInitialLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
          <p className="animate-pulse font-semibold text-xl">Loading...</p>
        </div>
      )}

      {!isMotionReady && (
        <MotionReadyProbe
          onReady={() => {
            console.log("[LoadingTale] motion ready");
            setIsMotionReady(true);
          }}
        />
      )}

      <div
        className={showInitialLoading ? "pointer-events-none invisible" : ""}
        aria-hidden={showInitialLoading}
      >
        {children}
      </div>
    </>
  );
}
