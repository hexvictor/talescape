"use client";
import React, { useCallback, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/Carousel";
import { Button } from "~/components/ui/Button";
import useCarousel from "~/hooks/useCarousel";
import { useSearchParams } from "next/navigation";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import type { TaleSection } from "~/lib/data";
import TaleBlock from "../TaleBlock";
import ReelButtons from "./ReelButtons";

type ReelSectionProps = {
  section: TaleSection;
};

export function ReelSectionComponent({ section }: ReelSectionProps) {
  // const orientation = useTaleReaderStore((s) => s.tale.orientation);
  const searchParams = useSearchParams();
  const orientation =
    searchParams.get("orientation") === "horizontal"
      ? "horizontal"
      : "vertical"; // default vertical

  const isVertical = orientation === "vertical";

  const { setApi, showPrev, showNext } = useCarousel();
  const getState = useTaleReaderStore.getState;
  const setCurrentBlockIndex = useTaleReaderStore(
    (s) => s.setCurrentBlockIndex
  );
  const totalBlocks = section.blocks.length;

  const next = useCallback(() => {
    const newIndex = getState().currentBlockIndex + 1;
    if (newIndex < totalBlocks) {
      setCurrentBlockIndex(newIndex);
    }
  }, [getState, totalBlocks, setCurrentBlockIndex]);

  const prev = useCallback(() => {
    const newIndex = getState().currentBlockIndex - 1;
    if (newIndex >= 0) {
      setCurrentBlockIndex(newIndex);
    }
  }, [getState, setCurrentBlockIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev]);

  return (
    <section id={`section-${section.id}`}>
      <Carousel
        orientation={orientation}
        setApi={setApi}
        className={isVertical ? "h-full w-full" : "h-screen w-screen"}
        opts={{ align: "start", watchDrag: false }}
      >
        <CarouselContent
          className={`m-0 ${isVertical ? "h-screen flex-col p-0" : ""}`}
        >
          {section.blocks.map((block) => (
            <CarouselItem
              key={block.id}
              className={`relative ${
                isVertical ? "m-0" : ""
              } h-screen w-screen shrink-0 grow-0 basis-full p-0`}
            >
              <TaleBlock {...block} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <ReelButtons
          showPrev={showPrev}
          showNext={showNext}
          prev={prev}
          next={next}
          isVertical={isVertical}
          totalBlocks={totalBlocks}
        />
      </Carousel>
    </section>
  );
}

const ReelSection = React.memo(ReelSectionComponent);
export default ReelSection;
