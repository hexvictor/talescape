"use client";
import React, { useEffect, useRef } from "react";
import TaleFragment from "../fragments/TaleFragment";
import TaleScrollIndicator from "../ui/tale-scroll-indicator";
import clsx from "clsx";
import type {
  BlockMeta,
  SectionMeta,
} from "~/features/tale-reader/types/taleStructure";
import { useAnchorInView } from "~/features/tale-reader/hooks/useAnchorInView";
import { useReaderStore } from "../../contexts/ReaderStoreContext";
import TaleBlockDebug from "./TaleBlockDebug";

type TaleBlockProps = {
  block: BlockMeta;
  isVertical: boolean;
};
export function TaleBlockComponent({ block, isVertical }: TaleBlockProps) {
  const isReel = block.isReelBlock;
  const ref = useAnchorInView(block.anchorId, isReel ? "section" : "block");
  const setIsContentReady = useReaderStore((s) => s.setIsContentReady);

  const fragments = useReaderStore((s) => s.tale?.structure.fragments);
  if (!fragments) return null;
  const blockFragments = fragments.filter((fragment) =>
    block.fragmentIds.includes(fragment.id)
  );

  const isFirstBlock = block.isFirst;
  const scrollIndicatorVisible = !isReel && isFirstBlock;

  //biome-ignore lint/correctness/useExhaustiveDependencies:runs only once
  useEffect(() => {
    if (block.isLast) setIsContentReady(true);
  }, []);

  return (
    <div
      id={block.id.toString()}
      data-anchor-id={block.anchorId}
      ref={ref}
      className={clsx(
        "overflow-visible",
        isReel
          ? "flex h-full flex-col items-center justify-center p-8 text-justify text-lg"
          : "relative min-h-[100dvh] p-16 "
      )}
    >
      <TaleBlockDebug block={block} />
      {blockFragments.map((fragment) => (
        <TaleFragment
          key={fragment.id}
          fragment={fragment}
          isVertical={isVertical}
          isReel={isReel}
        />
      ))}
      {scrollIndicatorVisible && <TaleScrollIndicator />}
    </div>
  );
}

const TaleBlock = React.memo(TaleBlockComponent);

export default TaleBlock;
