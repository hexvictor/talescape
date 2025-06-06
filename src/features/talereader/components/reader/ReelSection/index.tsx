"use client";
import React, { useEffect } from "react";
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

  const { setApi, showPrev, showNext } = useCarousel();
  const getState = useTaleReaderStore.getState;
  const setCurrentBlockIndex = useTaleReaderStore(
    (s) => s.setCurrentBlockIndex
  );
  const totalBlocks = section.blocks.length;

  const next = () => {
    const newIndex = getState().currentBlockIndex + 1;
    if (newIndex < totalBlocks) {
      setCurrentBlockIndex(newIndex);
    }
  };

  const prev = () => {
    const newIndex = getState().currentBlockIndex - 1;
    if (newIndex >= 0) {
      console.log("next-index", newIndex);
      console.log("current", getState().currentBlockIndex);
      setCurrentBlockIndex(newIndex);
    }
  };

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
  }, []);

  return (
    <section id={`section-${section.id}`}>
      <Carousel
        orientation={orientation}
        setApi={setApi}
        className={
          orientation === "horizontal" ? "h-screen w-screen" : "h-full w-full"
        }
        opts={{ align: "start", watchDrag: false }}
      >
        <CarouselContent className="m-0 h-screen flex-col p-0">
          {section.blocks.map((block) => (
            <CarouselItem
              key={block.id}
              className="relative m-0 h-screen w-screen shrink-0 grow-0 basis-full p-0"
            >
              <TaleBlock {...block} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Nav Buttons */}
        {showPrev && (
          <Button
            onClick={prev}
            className="-translate-x-1/2 fixed top-4 left-1/2 z-30"
            variant="outline"
          >
            ↑
          </Button>
        )}
        {showNext && (
          <Button
            onClick={next}
            className="-translate-x-1/2 fixed bottom-4 left-1/2 z-30"
            variant="outline"
          >
            ↓
          </Button>
        )}
      </Carousel>
    </section>
  );
}

const ReelSection = React.memo(ReelSectionComponent);
export default ReelSection;
