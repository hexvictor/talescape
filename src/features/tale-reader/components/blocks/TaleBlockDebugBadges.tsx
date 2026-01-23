"use client";
import React from "react";
import type { BlockMeta } from "~/features/tale-reader/types/taleStructure";
import { useReaderStore } from "../../contexts/ReaderStoreContext";

type Props = {
  block: BlockMeta;
};

function TaleBlockDebugBadgesComponent({ block }: Props) {
  const debugMode = useReaderStore((s) => s.debugMode);
  if (!debugMode) return null;

  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex flex-col items-center justify-center gap-8 text-4xl ">
      <div className=" flex items-center justify-center gap-4 ">
        {block.isPageBlock && <p className="bg-black text-white">Page Block</p>}
        {block.isFirst && <p className="bg-blue-400">First Block</p>}
        {block.isFirstInSection && (
          <p className="bg-green-300">First Block in section</p>
        )}
        {block.isFirstInPart && (
          <p className="bg-red-400">First Block in part</p>
        )}
        {block.isFirstInEntry && (
          <p className="bg-purple-500">First Block in entry</p>
        )}
        {block.isLast && <p className="bg-blue-400">Last Block</p>}
        {block.isLastInSection && (
          <p className="bg-green-300">Last Block in section</p>
        )}
        {block.isLastInPart && <p className="bg-red-400">Last Block in part</p>}
        {block.isLastInEntry && (
          <p className="bg-purple-500">Last Block in entry</p>
        )}
      </div>

      <div className=" flex items-center justify-center gap-4 ">
        <p className="bg-blue-400">Block number {block.globalIndex + 1}</p>
        <p className="bg-green-300">Section number {block.section.index + 1}</p>
        <p className="bg-red-400">Part number {block.part.index + 1}</p>
        <p className="bg-purple-500">
          Entry number {block.entry.globalIndex + 1}
        </p>
        {block.page?.globalIndex !== undefined && (
          <p className="bg-pink-500">
            Page number {block.page?.globalIndex + 1}
          </p>
        )}
      </div>
    </div>
  );
}

const TaleBlockDebugBadges = React.memo(TaleBlockDebugBadgesComponent);
export default TaleBlockDebugBadges;
