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
  const layout = searchParams.get("layout") ?? "scroll"; // fallback padrão

  if (layout === "reel") {
    return (
      <div
        id={anchorId}
        className="flex h-full w-full items-center justify-center p-8 text-justify text-lg bg-blue-400"
      >
        {fragments.map((fragment) => (
          <TaleFragment key={fragment.id} {...fragment} />
        ))}
        {scrollToBegin && <ScrollIndicator />}
        <div className="absolute w-10 h-10 bg-amber-300 top-0 left-0">
          {type}
        </div>
      </div>
    );
  }

  return (
    <div
      id={anchorId}
      className="relative p-16 overflow-hidden odd:bg-blue-400 even:bg-green-400 min-h-[100dvh]"
    >
      {fragments.map((fragment) => (
        <TaleFragment key={fragment.id} {...fragment} />
      ))}
      {scrollToBegin && <ScrollIndicator />}
      <div className=" w-10 h-10 bg-amber-300">{type}</div>
    </div>
  );
}

export default TaleBlock;
