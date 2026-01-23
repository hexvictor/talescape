"use client";

import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";
import { useScrollToLastBlock } from "~/features/tale-reader/hooks/useScrollToLastBlock";
import TaleGsapSection from "../tale-gsap-section";

export default function TaleGsapContent() {
  const sectionIds = useReaderStore((s) => s.tale?.structure.sectionIds);

  useScrollToLastBlock();

  if (!sectionIds) return null;

  return (
    <>
      {sectionIds.map((sectionId) => (
        <TaleGsapSection key={sectionId} sectionId={sectionId} />
      ))}
    </>
  );
}
