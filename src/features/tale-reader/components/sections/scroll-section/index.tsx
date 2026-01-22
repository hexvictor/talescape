"use client";
import React from "react";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import type { SectionMeta } from "~/features/tale-reader/types/taleStructure";
import { TaleBlock } from "../../blocks";

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
        />
      ))}
    </section>
  );
}

const ScrollSection = React.memo(ScrollSectionComponent);
export default ScrollSection;
