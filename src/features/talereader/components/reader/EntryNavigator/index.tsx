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
import { ICON_MAP } from "./entryIcons";
import { useTaleReaderContext } from "~/features/talereader/contexts/TaleReaderContext";
import { Button } from "~/components/ui/Button";

interface EntryNavigatorProps {
  visibleCount?: number;
}

export default function EntryNavigator({
  visibleCount = 7,
}: EntryNavigatorProps) {
  const { goToBlock } = useTaleReaderContext();

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
  }, [currentEntry, visibleCount]);

  const numberedEntries = useMemo(() => {
    return taleEntries.filter((entry) => entry.type === "chapter");
  }, []);

  const entryHeight = 40;
  const buttonOffset = 64;
  const containerHeight = visibleCount * entryHeight + buttonOffset;

  return (
    <div
      className={clsx(
        "-translate-y-1/2 absolute top-1/2 right-6 z-100 hidden md:flex",
        "transition-opacity duration-300",
        uiVisible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <TooltipProvider>
        <div
          className="relative flex flex-col items-center justify-center"
          style={{ height: `${containerHeight}px` }}
        >
          <AnimatePresence mode="wait">
            {currentEntry > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="-top-4 -translate-x-1/2 absolute left-1/2 z-10"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 rounded-full"
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
                  <TooltipContent side="left">Previous</TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="scrollbar-none mask-fade-vertical flex h-full flex-col items-center justify-center gap-3 overflow-hidden overflow-y-auto px-1 pt-8 pb-8"
            style={{
              overflowAnchor: "none",
              scrollbarGutter: "stable",
            }}
          >
            {visibleEntries.map((entry, index) => {
              const globalIndex = start + index;
              const isActive = globalIndex === currentEntry;

              const isChapter = entry.type === "chapter";
              const display = isChapter
                ? numberedEntries.findIndex((e) => e.id === entry.id) + 1
                : ICON_MAP[entry.type] ?? "❓";

              return (
                <Tooltip key={globalIndex}>
                  <TooltipTrigger asChild>
                    <motion.div
                      layout="position"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <button
                        ref={isActive ? activeRef : null}
                        onClick={() => {
                          //   setEntry(globalIndex);

                          // Check if entry has a block with anchorId, if not, move to the first page of this entry.
                          //   console.log(globalIndex);
                          goToBlock(globalIndex);
                        }}
                        aria-label={`Go to ${entry.type}: ${entry.title}`}
                        type="button"
                        className={clsx(
                          "h-8 w-8 cursor-pointer rounded-full border bg-background p-0 font-medium text-sm transition-transform hover:bg-muted hover:text-black",
                          isActive
                            ? "z-10 bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "hover:scale-105"
                        )}
                      >
                        {display}
                      </button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
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

          <AnimatePresence mode="wait">
            {currentEntry < taleEntries.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="-bottom-4 -translate-x-1/2 absolute left-1/2 z-10"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 rounded-full"
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
                  <TooltipContent side="left">Next</TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </div>
  );
}
