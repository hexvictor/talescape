"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { observeElement, unobserveElement } from "~/lib/intersectionObserver";
import type { FragmentMeta } from "~/features/tale-reader/types/taleStructure";

type ScrollAnimatedFragmentProps = {
  color: string;
  animationProps?: React.ComponentProps<typeof motion.div>;
  fragment: FragmentMeta;
};

export default function ScrollAnimatedFragment({
  color,
  animationProps,
  fragment,
}: ScrollAnimatedFragmentProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    observeElement(
      `fragment-observer-${fragment.id}`,
      el,
      { threshold: 0.15, rootMargin: "-20% 0px" },
      ([entry]) => {
        requestAnimationFrame(() =>
          setIsVisible(entry?.isIntersecting ?? false)
        );
      }
    );

    return () => {
      unobserveElement("fragment-observer", el);
    };
  }, [fragment]);

  return (
    <div ref={ref} className=" absolute top-[-50px] z-30 min-h-[200px]">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            {...{
              initial: { opacity: 0, y: 50 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -30 },
              transition: { duration: 0.6 },
              ...animationProps,
            }}
            className="mb-4 rounded-md p-6 text-white shadow-md"
            style={{ backgroundColor: color }}
          >
            <p className="font-semibold text-lg">Animated Fragment</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
