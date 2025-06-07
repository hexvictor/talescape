"use client";

import {
  TaleContent,
  ContentsNavigator,
  EntryNavigator,
  PageNavigator,
  ReaderUiToggle,
  TaleProgress,
} from "~/features/talereader/components/reader";
import { TaleReaderProvider } from "~/features/talereader/contexts/TaleReaderContext";
import { useEffect } from "react";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import type { Tale } from "~/lib/data";

type TaleReaderProps = {
  tale: Tale;
};

export default function TaleReader({ tale }: TaleReaderProps) {
  const setTale = useTaleReaderStore((s) => s.setTale);

  useEffect(() => {
    setTale(tale);
  }, [tale, setTale]);

  return (
    <TaleReaderProvider>
      <div className="relative flex flex-col">
        <div className="pointer-events-none fixed top-0 left-0 z-30 h-screen w-screen">
          <div className="pointer-events-none relative h-full w-full">
            <ContentsNavigator />
            <TaleProgress />
            <EntryNavigator />
            <PageNavigator />
            <ReaderUiToggle />
          </div>
        </div>
        <TaleContent />
      </div>
    </TaleReaderProvider>
  );
}
