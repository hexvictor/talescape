"use client";
import React, { useState } from "react";
import { useReaderStore } from "~/features/talereader/contexts/ReaderStoreContext";
import TaleSection from "../TaleSection";
import { useScrollToLastBlock } from "~/hooks/useScrollToLastBlock";

const TaleContentComponent = () => {
  const sectionIds = useReaderStore((s) => s.tale?.structure.sectionIds);
  if (!sectionIds) return null;
  useScrollToLastBlock();

  return (
    <>
      {sectionIds.map((sectionId) => (
        <TaleSection key={sectionId} sectionId={sectionId} />
      ))}
    </>
  );
};

export default React.memo(TaleContentComponent);
