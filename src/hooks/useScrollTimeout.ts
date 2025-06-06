import React, { useRef } from "react";

function useScrollTimeout() {
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout = 1200;
  const clearScrollTimeOut = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
  };
  const setScrollTimeOut = (callback: () => void) => {
    scrollTimeout.current = setTimeout(callback, timeout);
  };
  return { scrollTimeout, timeout, clearScrollTimeOut, setScrollTimeOut };
}

export default useScrollTimeout;
