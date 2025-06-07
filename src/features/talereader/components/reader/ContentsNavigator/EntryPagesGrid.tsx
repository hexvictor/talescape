import React from "react";
import { Button } from "~/components/ui/Button";
import { useTaleReaderContext } from "~/features/talereader/contexts/TaleReaderContext";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

interface Block {
  id: string;
  anchorId?: string;
  index: number;
}

interface Page {
  id: string;
}

interface EntryPagesGridProps {
  showAllBlocks: boolean;
  blocksForEntry: Block[];
  entryAnchorId?: string;
  activeEntry: { pages: Page[] };
  triggerAutoScrollState: () => void;
}

const EntryPagesGrid = ({
  showAllBlocks,
  blocksForEntry,
  entryAnchorId,
  activeEntry,
  triggerAutoScrollState,
}: EntryPagesGridProps) => {
  const { goToBlock } = useTaleReaderContext();
  const currentEntry = useTaleReaderStore((s) => s.currentEntry);
  const currentPages = useTaleReaderStore(
    (s) => s.tale.entries[currentEntry]?.pages
  );
  const currentBlockIndex = useTaleReaderStore((s) => s.currentBlockIndex);

  const filtered = showAllBlocks
    ? blocksForEntry
    : blocksForEntry.filter(
        (b) => b.anchorId !== entryAnchorId || activeEntry.pages.length === 0
      );

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-1 p-1">
      {filtered.map((block, i) => {
        const pageIndex = currentPages?.findIndex(
          (p) => `anchor-${p.id}` === block.anchorId
        );

        return (
          <Button
            key={block.id}
            variant={block.index === currentBlockIndex ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 cursor-pointer self-center justify-self-center p-0 text-xs"
            onClick={() => {
              triggerAutoScrollState();
              if (pageIndex !== undefined && pageIndex !== -1) {
                goToBlock(currentEntry, pageIndex);
              } else {
                goToBlock(currentEntry);
              }
            }}
          >
            {i + 1}
          </Button>
        );
      })}
    </div>
  );
};

export default EntryPagesGrid;
