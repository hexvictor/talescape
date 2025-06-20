import { useEffect, useRef, type RefObject } from "react";

export type ScrollDirection = "up" | "down";

function useScrollDirection(): RefObject<ScrollDirection> {
  const directionRef = useRef<ScrollDirection>("down");
  const lastY = useRef<number>(
    typeof window !== "undefined" ? window.scrollY : 0
  );

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      directionRef.current = currentY > lastY.current ? "down" : "up";
      lastY.current = currentY;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return directionRef;
}

export default useScrollDirection;
