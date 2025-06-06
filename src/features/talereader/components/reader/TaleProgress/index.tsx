"use client";

import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import { Progress } from "~/components/ui/Progress";

export default function TaleProgress() {
  const currentBlockIndex = useTaleReaderStore((s) => s.currentBlockIndex);
  const taleSections = useTaleReaderStore((s) => s.tale.sections);

  const allBlocks = taleSections.flatMap((section) => section.blocks);

  const totalBlocks = allBlocks.length;

  if (totalBlocks === 0) return null;

  const progress = Math.min((currentBlockIndex / (totalBlocks - 1)) * 100, 100);

  return (
    <div className="absolute top-0 right-0 left-0 z-50">
      <Progress value={progress} className="h-1" />
    </div>
  );
}
