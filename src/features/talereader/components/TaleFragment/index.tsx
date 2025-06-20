"use client";

import ScrollAnimatedFragment from "../fragments/animated/ScrollAnimatedFragment";
import LoopAnimatedFragment from "../fragments/animated/LoopAnimatedFragment";
import type { FragmentMeta } from "~/types/tale-reader/taleStructure";
import type {
  ImageFragmentData,
  TextFragmentData,
} from "~/types/schema/tale-reader/fragment";

type TaleFragmentProps = {
  fragment: FragmentMeta;
  isVertical: boolean;
  isReel: boolean;
};
export function TaleFragment({
  fragment,
  isVertical,
  isReel,
}: TaleFragmentProps) {
  if (fragment.type === "text") {
    const data = fragment.data as TextFragmentData;
    return (
      <div>
        {/* Animated Fragment before content */}
        <ScrollAnimatedFragment
          color="#457B9D"
          animationProps={{
            initial: { opacity: 0, x: -50 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -50 },
            transition: { duration: 0.6 },
          }}
          fragment={fragment}
        />

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
        className="rounded-md"
      />
    );
  }

  return null;
}

export default TaleFragment;
