import React, { useCallback, useRef } from "react";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

function useAutoScrollDelay() {
  const setIsAutoScrolling = useTaleReaderStore((s) => s.setIsAutoScrolling);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoScrollDelay = 1200;
  const cancelAutoScrollTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const startAutoScrollTimer = useCallback((callback: () => void) => {
    timerRef.current = setTimeout(callback, autoScrollDelay);
  }, []);

  const triggerAutoScrollState = useCallback(() => {
    cancelAutoScrollTimer();
    setIsAutoScrolling(true);
    startAutoScrollTimer(() => {
      setIsAutoScrolling(false);
    });
  }, [cancelAutoScrollTimer, startAutoScrollTimer, setIsAutoScrolling]);
  return {
    triggerAutoScrollState,
    cancelAutoScrollTimer,
  };
}

export default useAutoScrollDelay;
