"use client";

import { useMemo, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, ChevronDown } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/Tooltip";

import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import { useTaleReaderContext } from "~/features/talereader/contexts/TaleReaderContext";
import { Button } from "~/components/ui/Button";
import { useSearchParams } from "next/navigation";
import EntryTypeIcon from "../EntryTypeIcon";

interface EntryNavigatorProps {
  visibleCount?: number;
}

export default function EntryNavigator({
  visibleCount = 7,
}: EntryNavigatorProps) {
  const { goToBlock } = useTaleReaderContext();
  // const orientation = useTaleReaderStore((s) => s.tale.orientation);
  // const layout = useTaleReaderStore((s) => s.tale.layout);
  const searchParams = useSearchParams();
  const orientation =
    searchParams.get("orientation") === "horizontal"
      ? "horizontal"
      : "vertical"; // default vertical
  const isVertical = orientation === "vertical";
  const layout = searchParams.get("layout") === "reel" ? "reel" : "scroll"; // default vertical
  const isReel = layout === "reel";

  const uiVisible = useTaleReaderStore((s) => s.uiVisible);
  const currentEntry = useTaleReaderStore((s) => s.currentEntry);
  const taleEntries = useTaleReaderStore((s) => s.tale.entries);

  const activeRef = useRef<HTMLButtonElement | null>(null);

  if (taleEntries.length <= 1) return null;

  const { visibleEntries, start } = useMemo(() => {
    let start = Math.max(0, currentEntry - Math.floor(visibleCount / 2));
    const end = Math.min(taleEntries.length - 1, start + visibleCount - 1);
    if (end === taleEntries.length - 1) {
      start = Math.max(0, end - visibleCount + 1);
    }
    return { start, visibleEntries: taleEntries.slice(start, end + 1) };
  }, [currentEntry, visibleCount, taleEntries]);

  const numberedEntries = useMemo(() => {
    return taleEntries.filter((entry) => entry.type === "chapter");
  }, [taleEntries]);

  const entryHeight = 40;
  const buttonOffset = 64;
  const containerSize = visibleCount * entryHeight + buttonOffset;

  return (
    <div
      className={clsx(
        "pointer-events-auto",
        isReel && !isVertical
          ? "-translate-x-1/2 absolute bottom-4 left-1/2 z-100 hidden md:flex md:flex-col"
          : "-translate-y-1/2 absolute top-1/2 right-4 z-100 hidden md:flex",
        "transition-opacity duration-300",
        uiVisible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <TooltipProvider>
        <div
          className={clsx(
            "relative flex items-center justify-center",
            isReel && !isVertical
              ? `w-[${containerSize}]`
              : `flex-col h-[${containerSize}]`
          )}
        >
          <AnimatePresence mode="wait">
            {currentEntry > 0 && (
              <motion.div
                initial={
                  isReel && !isVertical
                    ? { scale: 0.5, opacity: 0, y: 10 }
                    : { scale: 0.5, opacity: 0, y: 10 }
                }
                animate={
                  isReel && !isVertical
                    ? { scale: 1, opacity: 1, y: -10 }
                    : { scale: 1, opacity: 1, y: -10 }
                }
                exit={
                  isReel && !isVertical
                    ? { scale: 0.5, opacity: 0, y: 10 }
                    : { scale: 0.5, opacity: 0, y: 10 }
                }
                transition={{ duration: 0.2 }}
                className={clsx(
                  "absolute z-10",
                  isReel && !isVertical
                    ? "-left-0 -translate-y-1/2 -rotate-90 top-1/2"
                    : "-top-0 -translate-x-1/2 left-1/2"
                )}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 cursor-pointer rounded-full hover:scale-105"
                      aria-label="Previous"
                      onClick={() => {
                        const previousEntry = Math.max(0, currentEntry - 1);
                        // setEntry(previousEntry);
                        goToBlock(previousEntry);
                      }}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isReel && !isVertical ? "top" : "left"}>
                    Previous
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            <div
              className={clsx(
                "scrollbar-none flex items-center justify-center gap-3 overflow-hidden px-1",
                isReel && !isVertical
                  ? "mask-fade-horizontal w-full overflow-x-auto py-2 pr-8 pl-8"
                  : "mask-fade-vertical h-full flex-col overflow-y-auto px-2 pt-8 pb-8"
              )}
              style={{
                overflowAnchor: "none",
                scrollbarGutter: "stable",
              }}
            >
              {visibleEntries.map((entry, index) => {
                const globalIndex = start + index;
                const isActive = globalIndex === currentEntry;

                const isChapter = entry.type === "chapter";
                const chapterNumber =
                  numberedEntries.findIndex((e) => e.id === entry.id) + 1;
                return (
                  <Tooltip key={globalIndex}>
                    <TooltipTrigger asChild>
                      <motion.div
                        layout="position"
                        initial={
                          isReel && !isVertical
                            ? { scale: 0.5, opacity: 0, x: 10 }
                            : { scale: 0.5, opacity: 0, y: 10 }
                        }
                        animate={
                          isReel && !isVertical
                            ? { scale: 1, opacity: 1, x: 0 }
                            : { scale: 1, opacity: 1, y: 0 }
                        }
                        exit={
                          isReel && !isVertical
                            ? { scale: 0.5, opacity: 0, x: -10 }
                            : { scale: 0.5, opacity: 0, y: -10 }
                        }
                        transition={{ duration: 0.2 }}
                        className="relative"
                      >
                        <Button
                          size="icon"
                          ref={isActive ? activeRef : null}
                          onClick={() => {
                            //   setEntry(globalIndex);

                            // Check if entry has a block with anchorId, if not, move to the first page of this entry.
                            goToBlock(globalIndex);
                          }}
                          aria-label={`Go to ${entry.type}: ${entry.title}`}
                          type="button"
                          className={clsx(
                            "h-8 w-8 cursor-pointer rounded-full border bg-background p-0 font-medium text-black text-sm transition-transform hover:bg-muted",
                            isActive
                              ? "z-10 bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background hover:text-black"
                              : "hover:scale-105"
                          )}
                        >
                          {isChapter ? (
                            chapterNumber
                          ) : (
                            <EntryTypeIcon
                              type={entry.type}
                              className="h-3 w-3"
                            />
                          )}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent
                      side={isReel && !isVertical ? "top" : "left"}
                    >
                      <div>
                        <div className="capitalize">
                          {entry.type.replace(/_/g, " ")}: {entry.title}
                        </div>
                        {entry.pages.length > 0 && (
                          <div className="text-muted-foreground text-xs">
                            {entry.pages.length} page
                            {entry.pages.length > 1 && "s"}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {currentEntry < taleEntries.length - 1 && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 10 }}
                exit={{ scale: 0.5, opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={clsx(
                  "absolute z-10",
                  isReel && !isVertical
                    ? "-right-0 -translate-y-1/2 -rotate-90 top-1/2"
                    : "-bottom-0 -translate-x-1/2 left-1/2"
                )}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 cursor-pointer rounded-full hover:scale-105"
                      aria-label="Next"
                      onClick={() => {
                        const nextEntry = Math.min(
                          taleEntries.length - 1,
                          currentEntry + 1
                        );
                        // setEntry(nextEntry);
                        requestAnimationFrame(() => {
                          goToBlock(nextEntry);
                        });
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isReel && !isVertical ? "top" : "left"}>
                    Next
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </div>
  );
}
