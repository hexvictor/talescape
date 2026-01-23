"use client";

import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import TaleGsapBlock from "../tale-gsap-block";

type TaleGsapSectionProps = {
  sectionId: number;
};

export default function TaleGsapSection({ sectionId }: TaleGsapSectionProps) {
  const section = useReaderStore(
    (s) => s.tale.structure.indexMap.sectionsById[sectionId],
  );
  const getBlocksBySectionId = useReaderStore((s) => s.getBlocksBySectionId);

  if (!section) return null;

  const sectionBlocks = getBlocksBySectionId(sectionId);

  if (section.isReel) {
    const axis = section.isVertical ? "y" : "x";
    const direction = section.isVertical ? "down" : "right";

    return (
      <section
        id={`section-${section.id}`}
        className="pinned-section relative h-screen overflow-hidden"
        data-axis={axis}
        data-direction={direction}
        data-snap="true"
      >
        <div className="scroll-track flex w-max">
          {sectionBlocks.map((block) => (
            <div
              key={block.id}
              className="flex h-screen w-screen items-center justify-center"
              data-snap="true"
            >
              <TaleGsapBlock block={block} isVertical={section.isVertical} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id={`section-${section.id}`}
      className="flex flex-col"
      data-snap="false"
    >
      {sectionBlocks.map((block) => (
        <TaleGsapBlock
          key={block.id}
          block={block}
          isVertical={section.isVertical}
        />
      ))}
    </section>
  );
}
