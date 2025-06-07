import clsx from "clsx";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/Tooltip";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

type ReelButtonsProps = {
  showPrev: boolean;
  showNext: boolean;
  isVertical: boolean;
  totalBlocks: number;
  prev: () => void;
  next: () => void;
};

function ReelButtons({
  showPrev,
  showNext,
  isVertical,
  prev,
  next,
  totalBlocks,
}: ReelButtonsProps) {
  const currentBlockIndex = useTaleReaderStore((s) => s.currentBlockIndex);
  const isFirst = currentBlockIndex === 0;
  const isLast = currentBlockIndex === totalBlocks - 1;
  return (
    <div className="pointer-events-none absolute top-0 left-0 z-30 h-screen w-screen">
      {showPrev && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className={clsx(
                "pointer-events-auto z-20 cursor-pointer rounded-full shadow-lg hover:scale-105",
                isVertical
                  ? "-translate-x-1/2 fixed top-4 left-1/2"
                  : "-translate-y-1/2 absolute top-1/2 left-4"
              )}
              disabled={isFirst}
              aria-label="Previous page"
            >
              {isVertical ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowLeft className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "bottom" : "right"}>
            Previous page
          </TooltipContent>
        </Tooltip>
      )}
      {showNext && (
        <Tooltip>
          <TooltipTrigger asChild className="cursor-pointer">
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className={clsx(
                "pointer-events-auto z-20 cursor-pointer rounded-full shadow-lg hover:scale-105",
                isVertical
                  ? "-translate-x-1/2 fixed bottom-4 left-1/2"
                  : "-translate-y-1/2 absolute top-1/2 right-4"
              )}
              disabled={isLast}
              aria-label="Next page"
            >
              {isVertical ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isVertical ? "top" : "left"}>
            Next page
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export default ReelButtons;
