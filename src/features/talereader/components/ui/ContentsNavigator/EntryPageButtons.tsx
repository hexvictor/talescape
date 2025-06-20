"use client";

import React, { useMemo } from "react";
import { Button } from "~/components/ui/Button";
import { useReaderNavContext } from "~/features/talereader/contexts/ReaderNavContext";
import { useReaderStore } from "~/features/talereader/contexts/ReaderStoreContext";

interface EntryPagesGridProps {
  showAllBlocks: boolean;
  triggerScrollActivity: () => void;
}

const EntryPagesGrid = ({
  showAllBlocks,
  triggerScrollActivity,
}: EntryPagesGridProps) => {
  // const { navigateToAnchor } = useReaderNavContext();

  // const currentBlockIndex = useReaderStore((s) => s.navigation.block?.index);
  // const currentEntry = useReaderStore((s) => s.navigation.entry);
  // const getBlockIndex = useReaderStore((s) => s.getBlockIndex);
  // const getBlocksByEntryId = useReaderStore((s) => s.getBlocksByEntryId);

  // const currentEntry = getCurrentEntry();
  // const entryBlocks = useMemo(
  //   () => (currentEntry ? getBlocksByEntryId(currentEntry.id) : []),
  //   [currentEntry, getBlocksByEntryId]
  // );
  // const currentPages = currentEntry?.pages ?? [];

  // const filtered = useMemo(() => {
  //   if (showAllBlocks) return entryBlocks;
  //   return entryBlocks?.filter(
  //     (b) => b.anchorId !== currentEntry?.id || currentPages.length === 0
  //   );
  // }, [showAllBlocks, entryBlocks, currentEntry?.id, currentPages.length]);

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-1 p-1">
      {/* {filtered?.map((block, i) => {
        const blockIndex = getBlockIndex(block.id);

        return (
          <Button
            key={block.id}
            variant={blockIndex === currentBlockIndex ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 cursor-pointer self-center justify-self-center p-0 text-xs"
            onClick={() => {
              triggerScrollActivity();
              navigateToAnchor(block.entryIndex, block.pageIndex);
            }}
          >
            {i + 1}
          </Button>
        );
      })} */}
    </div>
  );
};

export default React.memo(EntryPagesGrid);
