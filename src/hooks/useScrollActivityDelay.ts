import { useCallback, useRef } from "react";
import { useReaderStore } from "~/features/talereader/contexts/ReaderStoreContext";

type UseScrollActivityDelayResult = {
  triggerScrollActivity: () => void;
  cancelScrollActivity: () => void;
};

function useScrollActivityDelay(): UseScrollActivityDelayResult {
  const setIsScrollActive = useReaderStore((s) => s.setIsScrollActive);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollActivityDelay = 1200;

  const cancelScrollActivityTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startScrollActivityTimer = useCallback((callback: () => void) => {
    timerRef.current = setTimeout(callback, scrollActivityDelay);
  }, []);

  const triggerScrollActivity = useCallback(() => {
    cancelScrollActivityTimer();
    setIsScrollActive(true);
    startScrollActivityTimer(() => {
      setIsScrollActive(false);
    });
  }, [cancelScrollActivityTimer, startScrollActivityTimer, setIsScrollActive]);

  const cancelScrollActivity = useCallback(() => {
    cancelScrollActivityTimer();
    setIsScrollActive(false);
  }, [cancelScrollActivityTimer, setIsScrollActive]);

  return {
    triggerScrollActivity,
    cancelScrollActivity,
  };
}

export default useScrollActivityDelay;
