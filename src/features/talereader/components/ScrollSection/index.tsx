"use client";
import React from "react";
import { useReaderStore } from "~/features/talereader/contexts/ReaderStoreContext";
import clsx from "clsx";
import TaleBlock from "../TaleBlock";
import type { SectionMeta } from "~/types/tale-reader/taleStructure";

type ScrollSectionProps = {
  section: SectionMeta;
};

export function ScrollSectionComponent({ section }: ScrollSectionProps) {
  const blocks = useReaderStore((s) => s.tale?.structure.blocks);
  if (!blocks) return null;
  const sectionBlocks = blocks.filter((block) =>
    section.blockIds.includes(block.id)
  );
  return (
    <section id={`section-${section.id}`} className="flex flex-col">
      {sectionBlocks.map((block, index) => (
        <TaleBlock
          key={block.id}
          block={block}
          isVertical={section.isVertical}
          isReel={section.isReel}
        />
      ))}
    </section>
  );
}

const ScrollSection = React.memo(ScrollSectionComponent);
export default ScrollSection;
