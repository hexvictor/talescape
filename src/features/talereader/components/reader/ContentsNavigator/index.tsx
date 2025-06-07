"use client";

import { useTaleReaderContext } from "~/features/talereader/contexts/TaleReaderContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import useAutoScrollDelay from "~/hooks/useAutoScrollDelay";
import EntryPagesGrid from "./EntryPagesGrid";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/Tooltip";
import EntryTypeIcon from "../EntryTypeIcon";

export default function ContentsNavigator() {
  const { goToBlock } = useTaleReaderContext();
  const currentEntry = useTaleReaderStore((s) => s.currentEntry);
  const uiVisible = useTaleReaderStore((s) => s.uiVisible);
  const taleEntries = useTaleReaderStore((s) => s.tale.entries);
  const blocks = useTaleReaderStore((s) => s.tale.sections[0]?.blocks ?? []);
  const { triggerAutoScrollState } = useAutoScrollDelay();

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

  return (
    <div
      className={clsx(
        "pointer-events-auto absolute top-6 right-8 z-100 flex items-center gap-2",
        "transition-opacity duration-300",
        uiVisible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="flex cursor-pointer items-center gap-1"
              >
                <span className="flex items-center gap-1 text-sm">
                  {activeEntry.title}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Contents</TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="start" className="z-100 max-h-[500px] w-72">
          <ScrollArea className="h-[200px]">
            <div className="px-1 pb-2">
              <DropdownMenuGroup>
                {taleEntries.map((entry, index) => {
                  const isChapter = entry.type === "chapter";

                  const chapterIndex = isChapter
                    ? taleEntries
                        .filter((e) => e.type === "chapter")
                        .indexOf(entry)
                    : -1;

                  return (
                    <DropdownMenuItem
                      key={entry.id}
                      className={clsx(
                        "flex cursor-pointer items-center gap-2",
                        index === currentEntry && "bg-muted font-medium"
                      )}
                      onSelect={(e) => {
                        e.preventDefault();
                        triggerAutoScrollState();
                        goToBlock(index);
                      }}
                    >
                      <span className="w-6 text-center text-muted-foreground text-xs">
                        {isChapter ? (
                          chapterIndex + 1
                        ) : (
                          <EntryTypeIcon
                            type={entry.type}
                            className="h-3 w-3"
                          />
                        )}
                      </span>
                      <span className="truncate">{entry.title}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </div>
          </ScrollArea>

          {hasPages && blocksForEntry.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                Pages in "{activeEntry.title}"
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <EntryPagesGrid
                showAllBlocks={
                  singlePageWithEntryBlock && blocksForEntry.length === 2
                }
                blocksForEntry={blocksForEntry}
                entryAnchorId={entryAnchorId}
                activeEntry={activeEntry}
                triggerAutoScrollState={triggerAutoScrollState}
              />
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
