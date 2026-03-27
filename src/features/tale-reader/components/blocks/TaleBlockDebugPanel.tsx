"use client";
import React from "react";
import type { BlockMeta } from "~/features/tale-reader/types/taleStructure";
import { useReaderStore } from "../../contexts/ReaderStoreContext";

type Props = {
  block: BlockMeta;
};

function TaleBlockDebugPanelComponent({ block }: Props) {
  const debugMode = useReaderStore((s) => s.debugMode);
  if (!debugMode) return null;

  return (
    <div className="absolute top-0 right-0 flex flex-col bg-amber-300 p-5">
      <div className="mb-4 bg-blue-400 p-2">
        <p className="font-bold">Block</p>
        <p>Block id: {block.id}</p>
        <p>Block index: {block.index}</p>
        <p>Block Entry index: {block.entryIndex}</p>
        <p>Block Part index: {block.partIndex}</p>
        <p>Block global index: {block.globalIndex}</p>
      </div>

      <div className="mb-4 bg-green-300 p-2">
        <p>Section id: {block.sectionId}</p>
        <p>Section index: {block.section.index}</p>
        <p>Section Direction: {block.section.direction}</p>
        <p>Section Orientation: {block.section.orientation}</p>
      </div>

      <div className="mb-4 bg-red-400 p-2">
        <p>Part id: {block.partId}</p>
        <p>Part index: {block.part.index}</p>
      </div>

      <div className="mb-4 bg-purple-500 p-2">
        <p>Entry id: {block.entryId}</p>
        <p>Entry index: {block.entry.index}</p>
      </div>

      <div className="mb-4 bg-pink-500 p-2">
        <p>Is Page Block?: {block.isPageBlock ? "Yes" : "No"}</p>
        <p>Page id: {block.pageId}</p>
        <p>Page index: {block.page?.index}</p>
      </div>

      <div className="mb-4 bg-orange-600 p-2">
        <p>Anchor id: {block.anchorId}</p>
      </div>
      <div className="mb-4 bg-white-700 text-black p-2">
        <p>Tale id: {block.part.taleId}</p>
      </div>
    </div>
  );
}

const TaleBlockDebugPanel = React.memo(TaleBlockDebugPanelComponent);
export default TaleBlockDebugPanel;
