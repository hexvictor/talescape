"use client";
import React from "react";
import type { TaleBlock as TaleBlockType } from "~/lib/data";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import clsx from "clsx";
import TaleFragment from "../TaleFragment";
import ScrollIndicator from "../ScrollIndicator";
import { useSearchParams } from "next/navigation";

function TaleBlock({
  fragments,
  type,
  anchorId,
  scrollToBegin = false,
}: TaleBlockType & { scrollToBegin?: boolean }) {
  //   const layout = useTaleReaderStore((s) => s.tale.layout);
  //   const orientation = useTaleReaderStore((s) => s.tale.orientation);
  //   const layout = useTaleReaderStore((s) => s.tale.layout);
  const searchParams = useSearchParams();
  const layout = searchParams.get("layout") === "reel" ? "reel" : "scroll"; // default vertical
  const isReel = layout === "reel";

  if (isReel) {
    return (
      <div
        id={anchorId}
        className="flex h-full w-full items-center justify-center bg-blue-400 p-8 text-justify text-lg"
      >
        {fragments.map((fragment) => (
          <TaleFragment key={fragment.id} {...fragment} />
        ))}
        {scrollToBegin && <ScrollIndicator />}
        <div className="absolute top-0 left-0 h-10 w-10 bg-amber-300">
          {type}
        </div>
      </div>
    );
  }

  return (
    <div
      id={anchorId}
      className="relative min-h-[100dvh] overflow-hidden p-16 odd:bg-blue-400 even:bg-green-400"
    >
      {fragments.map((fragment) => (
        <TaleFragment key={fragment.id} {...fragment} />
      ))}
      {scrollToBegin && <ScrollIndicator />}
      <div className=" h-10 w-10 bg-amber-300">{type}</div>
    </div>
  );
}

export default TaleBlock;
