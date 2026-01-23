"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import ReelSection from "./reel-section/ReelSection";
import ScrollSection from "./scroll-section";
import { useReaderStore } from "../../contexts/ReaderStoreContext";

type TaleSectionProps = {
  sectionId: number;
};

function TaleSection({ sectionId }: TaleSectionProps) {
  const sectionsById = useReaderStore(
    (s) => s.tale?.structure.indexMap.sectionsById,
  );
  if (!sectionsById) return null;
  const section = sectionsById[sectionId];
  if (!section) return null;
  const layout = section.layout;
  const isReel = layout === "reel";

  if (isReel) {
    return <ReelSection section={section} />;
  }
  return <ScrollSection section={section} />;
}

export default TaleSection;
