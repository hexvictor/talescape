"use client";

import { useTaleReaderContext } from "~/features/talereader/contexts/TaleReaderContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import { ScrollArea } from "~/components/ui/ScrollArea";
import { Button } from "~/components/ui/Button";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import { ICON_MAP } from "../EntryNavigator/entryIcons";
import type { TaleEntry } from "~/lib/data";
import useScrollTimeout from "~/hooks/useScrollTimeout";

export default function ContentsNavigator() {
  const { goToBlock } = useTaleReaderContext();
  const currentEntry = useTaleReaderStore((s) => s.currentEntry);
  const currentBlockIndex = useTaleReaderStore((s) => s.currentBlockIndex);
  const currentPages = useTaleReaderStore(
    (s) => s.tale.entries[currentEntry]?.pages
  );
  const uiVisible = useTaleReaderStore((s) => s.uiVisible);
  const taleEntries = useTaleReaderStore((s) => s.tale.entries);
  const blocks = useTaleReaderStore((s) => s.tale.sections[0]?.blocks ?? []);
  const setIsAutoScrolling = useTaleReaderStore((s) => s.setIsAutoScrolling);
  const { clearScrollTimeOut, setScrollTimeOut } = useScrollTimeout();

  const scrollTimeout = () => {
    clearScrollTimeOut();
    setIsAutoScrolling(true);
    setScrollTimeOut(() => {
      setIsAutoScrolling(false);
    });
  };

  const activeEntry = taleEntries[currentEntry];
  if (!activeEntry) return null;

  // Identify blocks associated with this entry
  const entryAnchorId = `anchor-${activeEntry.id}`;
  const pageIds = activeEntry.pages.map((p) => `anchor-${p.id}`);

  const blocksForEntry = blocks
    .map((block, i) => ({ ...block, index: i }))
    .filter((block) => {
      return (
        block.anchorId === entryAnchorId ||
        pageIds.includes(block.anchorId ?? "")
      );
    });

  // Special logic for single page + entry block
  const singlePageWithEntryBlock =
    activeEntry.pages.length === 1 &&
    blocksForEntry.some((b) => b.anchorId === entryAnchorId);

  const hasPages = activeEntry.pages.length > 0;

  const renderBlockButtons = () => {
    const filtered =
      singlePageWithEntryBlock && blocksForEntry.length === 2
        ? blocksForEntry
        : blocksForEntry.filter(
            (b) =>
              b.anchorId !== entryAnchorId || activeEntry.pages.length === 0 // keep only page block if no pages
          );

    return filtered.map((block, i) => (
      <Button
        key={block.id}
        variant={block.index === currentBlockIndex ? "default" : "outline"}
        size="sm"
        className="h-8 w-8 p-0 text-xs"
        onClick={() => {
          scrollTimeout();
          const pageIndex = currentPages?.findIndex(
            (p) => `anchor-${p.id}` === block.anchorId
          );

          if (pageIndex !== -1) {
            goToBlock(currentEntry, pageIndex);
          } else {
            goToBlock(currentEntry);
          }
        }}
      >
        {i + 1}
      </Button>
    ));
  };

  return (
    <div
      className={clsx(
        "absolute top-6 right-8 z-100 flex items-center gap-2",
        "transition-opacity duration-300",
        uiVisible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-1"
          >
            <span className="flex items-center gap-1 text-sm">
              {activeEntry.title}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="z-100 max-h-[500px] w-72">
          <ScrollArea className="h-[200px]">
            <div className="px-1 pb-2">
              {taleEntries.map((entry, index) => {
                const icon =
                  entry.type === "chapter"
                    ? taleEntries
                        .filter((e) => e.type === "chapter")
                        .indexOf(entry) + 1
                    : ICON_MAP[entry.type] ?? "❓";

                return (
                  <DropdownMenuItem
                    key={entry.id}
                    className={clsx(
                      "flex items-center gap-2",
                      index === currentEntry && "bg-muted font-medium"
                    )}
                    onClick={() => {
                      scrollTimeout();
                      goToBlock(index);
                    }}
                  >
                    <span className="w-6 text-center text-muted-foreground text-xs">
                      {icon}
                    </span>
                    <span className="truncate">{entry.title}</span>
                  </DropdownMenuItem>
                );
              })}
            </div>
          </ScrollArea>

          {hasPages && blocksForEntry.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                Pages in "{activeEntry.title}"
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-5 gap-1 p-1">
                {renderBlockButtons()}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
