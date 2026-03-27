"use client";

import React, { useEffect } from "react";
import clsx from "clsx";
import type { BlockMeta } from "~/features/tale-reader/types/taleStructure";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import { TaleFragment } from "../../fragments";
import TaleBlockDebug from "../../blocks/TaleBlockDebug";
import { TaleScrollIndicator } from "../../ui";

type TaleBlockProps = {
  block: BlockMeta;
};

export function TaleBlockComponent({
  block,
}: TaleBlockProps) {
  const setIsContentReady = useReaderStore((s) => s.setIsContentReady);
  const fragmentsById = useReaderStore(
    (s) => s.tale.structure.indexMap.fragmentsById,
  );


  const blockFragments = block.fragmentIds
    .map((id) => fragmentsById[id])
    .filter((fragment): fragment is NonNullable<typeof fragment> => !!fragment);

  useEffect(() => {
    if (block.isLast) {
      setIsContentReady(true);
    }
  }, [block.isLast, setIsContentReady]);

  return (
    <div
      id={String(block.id)}
      data-block-id={block.id}
      data-anchor-id={block.anchorId}
      data-snap={block.isSnap}
      data-direction={block.section.direction}
      data-orientation={block.section.orientation}
      data-block-section-id={block.sectionId}
      data-block-entry-id={block.entryId}
      data-block-page-id={block.pageId ?? undefined}
      data-block-part-id={block.partId ?? undefined}
      data-block-global-index={block.globalIndex}
      className={clsx(
        // "overflow-visible",
        "relative",
        "flex min-h-screen min-w-screen items-center justify-center"
      )}
    >
        <TaleBlockDebug block={block} />

        {blockFragments.map((fragment) => (
          <TaleFragment
            key={fragment.id}
            fragment={fragment}
          />
        ))}

        {block.isFirst ? <TaleScrollIndicator /> : null}
    </div>
  );
}

const TaleBlock = React.memo(TaleBlockComponent);

export default TaleBlock;