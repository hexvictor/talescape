"use client";
import React, { useEffect, useRef } from "react";
import { useReaderStore } from "~/features/talereader/contexts/ReaderStoreContext";
import TaleFragment from "../TaleFragment";
import ScrollIndicator from "../ui/ScrollIndicator";
import clsx from "clsx";
import type { BlockMeta, SectionMeta } from "~/types/tale-reader/taleStructure";
import { useAnchorInView } from "~/hooks/useAnchorInView";

type TaleBlockProps = {
  block: BlockMeta;
  isVertical: boolean;
  isReel: boolean;
};
export function TaleBlockComponent({
  block,
  isVertical,
  isReel,
}: TaleBlockProps) {
  const ref = useAnchorInView(block.anchorId);
  const setIsContentReady = useReaderStore((s) => s.setIsContentReady);

  const fragments = useReaderStore((s) => s.tale?.structure.fragments);
  if (!fragments) return null;
  const blockFragments = fragments.filter((fragment) =>
    block.fragmentIds.includes(fragment.id)
  );

  const isFirstBlock = block.isFirstInSection;
  const scrollIndicatorVisible = !isReel && isFirstBlock;

  //biome-ignore lint/correctness/useExhaustiveDependencies:runs only once
  useEffect(() => {
    if (block.isLast) setIsContentReady(true);
  }, []);

  return (
    <div
      id={`anchor-${block.anchorId}`}
      ref={ref}
      className={clsx(
        isReel
          ? "flex h-full flex-col items-center justify-center p-8 text-justify text-lg"
          : "relative min-h-[100dvh] overflow-visible p-16 ",
        block.isPageBlock && "bg-pink-500",
        block.isFirstInEntry || (block.isLastInEntry && "bg-purple-500"),
        block.isFirstInSection || (block.isLastInSection && "bg-green-300"),
        block.isFirstInPart || (block.isLastInPart && "bg-red-400")
      )}
    >
      <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex flex-col items-center justify-center gap-8 text-4xl ">
        <div className=" flex items-center justify-center gap-4 ">
          {block.isPageBlock && (
            <p className="bg-black text-white">Page Block</p>
          )}
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
          {block.isLastInPart && (
            <p className="bg-red-400">Last Block in part</p>
          )}
          {block.isLastInEntry && (
            <p className="bg-purple-500">Last Block in entry</p>
          )}
        </div>
        <div className=" flex items-center justify-center gap-4 ">
          <p className="bg-blue-400">Block number {block.globalIndex + 1}</p>
          <p className="bg-green-300">
            Section number {block.section.index + 1}
          </p>
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
      {blockFragments.map((fragment) => (
        <TaleFragment
          key={fragment.id}
          fragment={fragment}
          isVertical={isVertical}
          isReel={isReel}
        />
      ))}
      {scrollIndicatorVisible && <ScrollIndicator />}
      <div className="absolute top-0 right-0 flex flex-col bg-amber-300 p-5">
        <div className="mb-4 bg-blue-400">
          <p className="font-bold">Block</p>
          <p>Block id: {block.id}</p>
          <p>Block index: {block.index}</p>
          <p>Block Entry index: {block.entryIndex}</p>
          <p>Block Part index: {block.partIndex}</p>
          <p>Block global index: {block.globalIndex}</p>
        </div>
        <div className="mb-4 bg-green-300">
          <p>Section id: {block.sectionId}</p>
          <p>Section index: {block.section.index}</p>
        </div>
        <div className="mb-4 bg-red-400">
          <p>Part id: {block.partId}</p>
          <p>Part index: {block.part.index}</p>
        </div>
        <div className="mb-4 bg-purple-500">
          <p>Entry id: {block.entryId}</p>
          <p>Entry index: {block.entry.index}</p>
        </div>
        <div className="mb-4 bg-pink-500">
          <p>Is Page Block?: {block.isPageBlock ? "Yes" : "No"}</p>
          <p>Page id: {block.pageId}</p>
          <p>Page index: {block.page?.index}</p>
        </div>
        <div className="mb-4 bg-orange-600">
          <p>Anchor id: {block.anchorId}</p>
        </div>
      </div>
    </div>
  );
}

const TaleBlock = React.memo(TaleBlockComponent);

export default TaleBlock;
