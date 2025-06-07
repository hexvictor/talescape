"use client";
import { useEffect, useRef, useState } from "react";
import type { TaleFragment as TaleFragmentType } from "~/lib/data";
import { LoremIpsum } from "lorem-ipsum";
import { AnimatePresence, motion } from "motion/react";
type ScrollAnimatedBlockProps = {
  color: string;
  animationProps?: React.ComponentProps<typeof motion.div>;
};

type AnimatedLoopBlockProps = {
  color?: string;
  animationProps?: Parameters<typeof motion.div>[0];
};
const lorem = new LoremIpsum();

export function AnimatedLoopBlock({
  color = "#3498db",
  animationProps = {},
}: AnimatedLoopBlockProps) {
  return (
    <motion.div
      {...animationProps}
      className="mb-4 rounded-md p-6 text-white shadow-md"
      style={{ backgroundColor: color, minHeight: "200px" }}
    >
      <p className="font-semibold text-lg">Animated Block</p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
        habitant morbi tristique senectus et netus.
      </p>
    </motion.div>
  );
}

function ScrollAnimatedBlock({
  color,
  animationProps,
}: ScrollAnimatedBlockProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
        rootMargin: "-20% 0px",
      }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div ref={ref} style={{ minHeight: "200px" }}>
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
            <p className="font-semibold text-lg">Animated Block</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              euismod, nisl nec tincidunt.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaleFragment({ id, type, content }: TaleFragmentType) {
  if (type === "text") {
    return (
      <div>
        <ScrollAnimatedBlock
          color={"#E63946"}
          animationProps={{
            initial: { x: -100, opacity: 0 },
            animate: { x: 0, opacity: 1 },
            exit: { x: -100, opacity: 0 },
            transition: { type: "spring", stiffness: 300 },
          }}
        />
        <ScrollAnimatedBlock
          color={"#457B9D"}
          animationProps={{
            initial: { opacity: 0, x: -100 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -100 },
            transition: { type: "spring", stiffness: 300 },
          }}
        />
        <ScrollAnimatedBlock
          color={"#E5DE5E"}
          animationProps={{
            initial: { opacity: 0, scale: 0.8 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.8 },
            transition: { duration: 0.4 },
          }}
        />
        <ScrollAnimatedBlock
          color={"#2A9D8F"}
          animationProps={{
            initial: { y: -100, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            exit: { y: 100, opacity: 0 },
            transition: { type: "spring", bounce: 0.4, duration: 0.8 },
          }}
        />
        <AnimatedLoopBlock
          animationProps={{
            animate: { rotate: [0, 360] },
            transition: {
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        />
        <AnimatedLoopBlock
          animationProps={{
            animate: { scale: [1, 1.1, 0.95, 1.05, 1] },
            transition: {
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />
        <AnimatedLoopBlock
          animationProps={{
            animate: {
              x: [0, 20, 0, -20, 0],
              y: [0, -10, -20, -10, 0],
            },
            transition: {
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        />
        <p key={id} className="text-base leading-relaxed">
          {content}
        </p>
      </div>
    );
  }

  if (type === "image") {
    return (
      <img key={id} src={content} alt="Tale fragment" className="rounded-md" />
    );
  }

  return null;
}

export default TaleFragment;
