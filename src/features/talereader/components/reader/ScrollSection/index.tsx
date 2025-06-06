"use client";
import type { TaleSection } from "~/lib/data";
import React from "react";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import clsx from "clsx";
import TaleBlock from "../TaleBlock";

type ScrollSectionProps = {
  section: TaleSection;
};

export function ScrollSectionComponent({ section }: ScrollSectionProps) {
  return (
    <section id={`section-${section.id}`} className="flex flex-col">
      {section.blocks.map((block, index) => (
        <TaleBlock key={block.id} {...block} scrollToBegin={index === 0} />
      ))}
    </section>
  );
}

const ScrollSection = React.memo(ScrollSectionComponent);
export default ScrollSection;
