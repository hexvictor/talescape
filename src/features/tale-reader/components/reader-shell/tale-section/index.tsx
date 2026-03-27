"use client";

import React, { useMemo } from "react";
import clsx from "clsx";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import TaleBlock from "../tale-block";

type TaleSectionProps = {
  sectionId: number;
};

function TaleSectionComponent({ sectionId }: TaleSectionProps) {
  const sectionsById = useReaderStore((s) => s.tale.structure.indexMap.sectionsById);
  const blocksById = useReaderStore((s) => s.tale.structure.indexMap.blocksById);

  const section = sectionsById[sectionId];

  const sectionBlocks = useMemo(() => {
    if (!section) return [];
    return section.blockIds
      .map((id) => blocksById[id])
      .filter((block): block is NonNullable<typeof block> => !!block);
  }, [section, blocksById]);

  if (!section) return null;
  if (!sectionBlocks.length) return null;


  const isVertical = Boolean(section.orientation === "vertical");

  return (
    <section
      id={`section-${section.id}`}
      data-section-id={section.id}
      data-direction={section.direction}
      data-orientation={section.orientation}
      // data-snap={section.isSnap}
      className={clsx(
        "pinned-section relative h-screen overflow-hidden"
      )}
    >
      <div className={clsx(isVertical ? "scroll-track" : "scroll-track flex w-max")}>
        {sectionBlocks.map((block) => (
          <TaleBlock
            key={block.id}
            block={block}
          />
        ))}
      </div>
    </section>
  );
}

const TaleSection = React.memo(TaleSectionComponent);

export default TaleSection;