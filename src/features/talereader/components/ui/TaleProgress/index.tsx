"use client";

import { useMemo } from "react";
import { useReaderStore } from "~/features/talereader/contexts/ReaderStoreContext";
import { Progress } from "~/components/ui/Progress";

export default function TaleProgress() {
  const blockCount = useReaderStore((s) => s.tale?.structure.blockCount);
  const currentBlockIndex = useReaderStore(
    (s) => s.navigation.block?.globalIndex
  );

  const progress = useMemo(() => {
    if (!blockCount) return 0;
    if (!currentBlockIndex) return 0;
    return Math.min((currentBlockIndex / (blockCount - 1)) * 100, 100);
  }, [currentBlockIndex, blockCount]);

  return (
    <div className="absolute top-0 right-0 left-0 z-50">
      <Progress value={progress} className="h-1" />
    </div>
  );
}
