"use client";
import React, { useCallback, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";
import ReelButtons from "./ReelButtons";
import useReel from "~/features/tale-reader/hooks/useReel";
import type {
  BlockMeta,
  SectionMeta,
} from "~/features/tale-reader/types/taleStructure";
import { useReaderNavContext } from "~/features/tale-reader/contexts/ReaderNavContext";
import {
  useReaderStore,
  useReaderStoreInstance,
} from "~/features/tale-reader/contexts/ReaderStoreContext";
import { TaleBlock } from "../../blocks";

type ReelSectionProps = {
  section: SectionMeta;
};

export function ReelSectionComponent({ section }: ReelSectionProps) {
  const orientation = section.orientation;
  const isVertical = section.isVertical;
  const isReel = section.isReel;

  const { setApi, goToFirst, goToLast } = useReel(section.id);
  const { navigateToAnchor, goToAnchor } = useReaderNavContext();

  const getState = useReaderStoreInstance().getState;
  const getNextBlock = useReaderStore((s) => s.getNextBlock);
  const getPreviousBlock = useReaderStore((s) => s.getPreviousBlock);
  const goToNextBlock = useReaderStore((s) => s.goToNextBlock);
  const goToPreviousBlock = useReaderStore((s) => s.goToPreviousBlock);
  const blocks = useReaderStore((s) => s.tale?.structure.blocks);
  if (!blocks) return null;
  const sectionBlocks = blocks.filter((block) =>
    section.blockIds.includes(block.id),
  );

  const next = useCallback(() => {
    if (!getState().navigation.block?.isLast) {
      const nextBlock: BlockMeta | undefined = getNextBlock();
      if (getState().navigation.block?.isLastInSection) {
        if (nextBlock) navigateToAnchor(nextBlock.id);
      } else {
        if (nextBlock) goToAnchor(nextBlock.id);

        // goToNextBlock();
      }
    }
  }, [getState, navigateToAnchor, goToAnchor, getNextBlock]);

  const prev = useCallback(() => {
    if (!getState().navigation.block?.isFirst) {
      const previousBlock = getPreviousBlock();
      if (previousBlock) navigateToAnchor(previousBlock.id);
    } else {
      goToPreviousBlock();
    }
  }, [goToPreviousBlock, getState, getPreviousBlock, navigateToAnchor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (getState().navigation.section?.id === section.id) {
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          prev();
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          next();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, getState, section]);

  return (
    <section id={`anchor-reel-${section.id}`} className="relative">
      <Carousel
        orientation={orientation}
        setApi={setApi}
        className={isVertical ? "h-full w-full" : "h-screen w-screen"}
        opts={{ align: "start", watchDrag: false }}
      >
        <CarouselContent
          className={`m-0 ${isVertical ? "h-screen flex-col p-0" : ""}`}
        >
          {sectionBlocks.map((block, index) => (
            <CarouselItem
              key={block.id}
              className={`relative ${
                isVertical ? "m-0" : ""
              } h-screen w-screen shrink-0 grow-0 basis-full p-0`}
            >
              <TaleBlock block={block} isVertical={isVertical} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute top-0 left-0">
          <button type="button" onClick={() => goToLast()}>
            LAST
          </button>
          <button type="button" onClick={() => goToFirst()}>
            first
          </button>
        </div>
        <ReelButtons
          showPrev={!getState().navigation.block?.isFirst}
          showNext={!getState().navigation.block?.isLast}
          prev={prev}
          next={next}
          isVertical={isVertical}
        />
      </Carousel>
    </section>
  );
}

const ReelSection = React.memo(ReelSectionComponent);
export default ReelSection;
