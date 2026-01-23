"use client";

import React, { useEffect } from "react";
import clsx from "clsx";

import type { BlockMeta } from "~/features/tale-reader/types/taleStructure";
import { useAnchorInView } from "~/features/tale-reader/hooks/useAnchorInView";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import TaleBlockDebug from "../../blocks/TaleBlockDebug";
import { TaleFragment } from "../../fragments";
import { TaleScrollIndicator } from "../../ui";

type TaleGsapBlockProps = {
  block: BlockMeta;
  isVertical: boolean;
};

export function TaleGsapBlockComponent({
  block,
  isVertical,
}: TaleGsapBlockProps) {
  const isReel = block.isReelBlock;
  const ref = useAnchorInView(block.anchorId, isReel ? "section" : "block");
  const setIsContentReady = useReaderStore((s) => s.setIsContentReady);

  const fragmentsById = useReaderStore(
    (s) => s.tale.structure.indexMap.fragmentsById,
  );

  const blockFragments = block.fragmentIds
    .map((id) => fragmentsById[id])
    .filter((f): f is NonNullable<typeof f> => !!f);

  const scrollIndicatorVisible = !isReel && block.isFirst;

  useEffect(() => {
    if (block.isLast) setIsContentReady(true);
  }, [block.isLast, setIsContentReady]);

  return (
    <div
      id={block.id.toString()}
      data-anchor-id={block.anchorId}
      ref={ref}
      className={clsx(
        "overflow-visible",
        isReel
          ? "flex h-screen w-screen items-center justify-center"
          : "relative min-h-[100dvh] w-screen",
      )}
    >
      <div
        className={clsx(
          isReel
            ? "mx-auto flex w-full max-w-4xl flex-col gap-6 px-10 py-10"
            : "mx-auto flex w-full max-w-4xl flex-col gap-6 px-10 py-16",
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
    </div>
  );
}

const TaleGsapBlock = React.memo(TaleGsapBlockComponent);

export default TaleGsapBlock;
