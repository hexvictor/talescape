"use client";
import React, { useState } from "react";
import TaleSection from "../../sections/TaleSection";
import { useScrollToLastBlock } from "~/features/tale-reader/hooks/useScrollToLastBlock";
import { useReaderStore } from "../../../contexts/ReaderStoreContext";

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

const TaleContent = React.memo(TaleContentComponent);

export default TaleContent;
