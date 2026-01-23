"use client";

import { useMemo, useRef } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, ChevronDown } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { Button } from "~/components/ui/button";
import EntryTypeIcon from "./EntryTypeIcon";
import { useReaderNavContext } from "~/features/tale-reader/contexts/ReaderNavContext";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";

export default function EntryNavigator() {
  // Scroll Navigator
  const visibleCount = 7;

  const { goToAnchor } = useReaderNavContext();

  const debugMode = useReaderStore((s) => s.debugMode);
  const isScrollActive = useReaderStore((s) => s.isScrollActive);

  const getNextEntry = useReaderStore((s) => s.getNextEntry);

  const getPreviousEntry = useReaderStore((s) => s.getPreviousEntry);
  const isReel = useReaderStore((s) => s.navigation?.section?.isReel);
  const isVertical = useReaderStore((s) => s.navigation?.section?.isVertical);
  const currentPage = useReaderStore((s) => s.navigation?.page);
  const currentEntry = useReaderStore((s) => s.navigation?.entry);
  const allEntries = useReaderStore((s) => s.tale?.structure.entries);
  const allPages = useReaderStore((s) => s.tale?.structure.pages);
  const uiVisible = useReaderStore((s) => s.uiVisible);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  if (
    !allPages ||
    !allEntries ||
    allEntries.length <= 1 ||
    !currentEntry ||
    isReel === undefined ||
    isVertical === undefined
  ) {
    return null;
  }

  const currentEntries = allEntries;
  const currentEntryGlobalIndex = currentEntry.globalIndex;

  if (currentEntries.length <= 1) return null;

  const visibleEntries = () => {
    let start = Math.max(
      0,
      currentEntryGlobalIndex - Math.floor(visibleCount / 2),
    );
    const end = Math.min(currentEntries.length - 1, start + visibleCount - 1);
    if (end === currentEntries.length - 1) {
      start = Math.max(0, end - visibleCount + 1);
    }
    return currentEntries.slice(start, end + 1);
  };

  const entryHeight = 40;
  const buttonOffset = 64;
  const containerSize = visibleCount * entryHeight + buttonOffset;

  return (
    <div
      className={clsx(
        "pointer-events-auto ",
        isReel && !isVertical
          ? "-translate-x-1/2 absolute bottom-0 left-1/2 z-100 flex flex-col pb-4"
          : "-translate-y-1/2 absolute top-1/2 right-0 z-100 flex pr-4",
        "transition-opacity duration-300",
        uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {/* {debugMode && (
        <div className="bg-white">
          {currentPage?.globalPageNumber} - {isScrollActive ? "true" : "false"}
        </div>
      )} */}
      <TooltipProvider>
        <div
          className={clsx(
            "relative flex items-center justify-center",
            isReel && !isVertical
              ? `w-[${containerSize}]`
              : `flex-col h-[${containerSize}]`,
          )}
        >
          <AnimatePresence mode="wait">
            {!currentEntry.isFirstEntry && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: -10 }}
                exit={{ scale: 0.5, opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={clsx(
                  "absolute z-10",
                  isReel && !isVertical
                    ? "-left-0 -translate-y-1/2 -rotate-90 top-1/2"
                    : "-top-0 -translate-x-1/2 left-1/2",
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
                        const previousEntry = getPreviousEntry();
                        if (previousEntry) {
                          requestAnimationFrame(() =>
                            goToAnchor(previousEntry.id, {
                              type: "entry",
                            }),
                          );
                        }
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
                  : "mask-fade-vertical h-full flex-col overflow-y-auto px-2 pt-8 pb-8",
              )}
              style={{ overflowAnchor: "none", scrollbarGutter: "stable" }}
            >
              {visibleEntries().map((entry) => {
                const entryPages = allPages.filter((p) =>
                  entry.pageIds.includes(p.id),
                );
                const isActive = entry.globalIndex === currentEntryGlobalIndex;

                return (
                  <Tooltip key={entry.id}>
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
                          onClick={() =>
                            goToAnchor(entry.id, { type: "entry" })
                          }
                          aria-label={`Go to ${entry.type}: ${entry.title}`}
                          className={clsx(
                            "h-8 w-8 cursor-pointer rounded-full border bg-background p-0 font-medium text-black text-sm transition-transform hover:bg-muted",
                            isActive
                              ? "z-10 bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background hover:text-black"
                              : "hover:scale-105",
                          )}
                        >
                          {entry.isChapter ? (
                            entry.chapterNumber
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
                        {entryPages.length > 0 && (
                          <div className="text-muted-foreground text-xs">
                            {entryPages.length} page
                            {entryPages.length > 1 && "s"}
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
            {!currentEntry.isLastEntry && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 10 }}
                exit={{ scale: 0.5, opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={clsx(
                  "absolute z-10",
                  isReel && !isVertical
                    ? "-right-0 -translate-y-1/2 -rotate-90 top-1/2"
                    : "-bottom-0 -translate-x-1/2 left-1/2",
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
                        const nextEntry = getNextEntry();
                        if (nextEntry) {
                          requestAnimationFrame(() =>
                            goToAnchor(nextEntry.id, { type: "entry" }),
                          );
                        }
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
