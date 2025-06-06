"use client";

import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import { Button } from "~/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Slider } from "~/components/ui/Slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import useScrollTimeout from "~/hooks/useScrollTimeout";
import { useState } from "react";
import { ScrollArea } from "~/components/ui/ScrollArea";

export default function BlockNavigator() {
  const uiVisible = useTaleReaderStore((s) => s.uiVisible);
  const blocks = useTaleReaderStore((s) => s.tale.sections[0]?.blocks ?? []);
  const currentBlockIndex = useTaleReaderStore((s) => s.currentBlockIndex);
  const setCurrentBlockIndex = useTaleReaderStore(
    (s) => s.setCurrentBlockIndex
  );
  const setIsAutoScrolling = useTaleReaderStore((s) => s.setIsAutoScrolling);
  const { clearScrollTimeOut, setScrollTimeOut } = useScrollTimeout();
  const scrollTimeout = () => {
    clearScrollTimeOut();
    setIsAutoScrolling(true);
    setScrollTimeOut(() => {
      setIsAutoScrolling(false);
    });
  };

  const isFirst = currentBlockIndex === 0;
  const isLast = currentBlockIndex === blocks.length - 1;

  const goToBlock = (index: number) => {
    scrollTimeout();
    setCurrentBlockIndex(index);
    const el = document.getElementById(blocks[index]?.anchorId || "");
    if (el) {
      // Small nudge to make sure scroll always triggers
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const goPrev = () => {
    if (!isFirst) goToBlock(currentBlockIndex - 1);
  };

  const goNext = () => {
    if (!isLast) goToBlock(currentBlockIndex + 1);
  };

  return (
    <div
      className={clsx(
        "absolute right-8 bottom-6 z-50 flex items-center gap-2",
        "transition-opacity duration-300",
        uiVisible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={goPrev}
        disabled={isFirst}
        aria-label="Previous block"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger disabled={blocks.length <= 1} asChild>
          <Button variant="outline" className="min-w-[120px] cursor-pointer">
            Page {currentBlockIndex + 1} of {blocks.length}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-[220px] p-4">
          <div className="mb-4 flex justify-between text-sm">
            <span>Page {currentBlockIndex + 1}</span>
            <span className="text-muted-foreground">of {blocks.length}</span>
          </div>
          <ScrollArea className="max-h-[350px]">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {blocks.map((block, index) => (
                <Button
                  key={block.id}
                  variant={index === currentBlockIndex ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => goToBlock(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon"
        onClick={goNext}
        disabled={isLast}
        aria-label="Next block"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
