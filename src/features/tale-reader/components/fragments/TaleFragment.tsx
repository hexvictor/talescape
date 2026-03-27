"use client";

import ScrollAnimatedFragment from "./animated/scroll-animated-fragment";
import LoopAnimatedFragment from "./animated/loop-animated-fragment";
import type { FragmentMeta } from "~/features/tale-reader/types/taleStructure";
import type {
  ImageFragmentData,
  TextFragmentData,
} from "~/server/db/types/tale-reader/fragment";

type TaleFragmentProps = {
  fragment: FragmentMeta;
};
export function TaleFragment({
  fragment,
}: TaleFragmentProps) {
  if (fragment.type === "text") {
    const data = fragment.data as TextFragmentData;
    return (
      <div>
        {/* Animated Fragment before content */}
        {/* <ScrollAnimatedFragment
          color="#457B9D"
          animationProps={{
            initial: { opacity: 0, x: -50 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -50 },
            transition: { duration: 0.6 },
          }}
          fragment={fragment}
        /> */}

        {/* Actual text content */}
        <p className="text-base leading-relaxed">{data.content}</p>

        {/* Optional continuous animation block */}
        {/* <LoopAnimatedFragment
          color="#2A9D8F"
          animationProps={{
            animate: { rotate: [0, 360] },
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          {...props}
        /> */}
      </div>
    );
  }

  if (fragment.type === "image") {
    const data = fragment.data as ImageFragmentData;

    return (
      <img
        key={fragment.id}
        src={data.url}
        alt={data.alt || "Tale fragment"}
        className="rounded-md max-h-screen max-w-screen"
      />
    );
  }

  return null;
}

export default TaleFragment;
