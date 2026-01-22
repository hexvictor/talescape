// NewTaleReader usage (same file you showed, just integrating the new components)
"use client";

import type { Tale } from "~/features/tale-reader/types/taleStructure";
import ReaderUiToggle from "../../ui/reader-ui-toggle";
import { ReaderNavProvider } from "../../../contexts/ReaderNavContext";
import type { TaleProgressSchema } from "~/server/db/schema";
import { getInitialProgressFromLocalStorage } from "~/features/tale-reader/services/progressStorage";
import { ReaderStoreProvider } from "../../../contexts/ReaderStoreContext";
import ScrollStage from "./scroll-stage";
import ReaderSection from "./reader-section";

type NewTaleReaderProps = {
  tale: Tale;
  progress: TaleProgressSchema | null;
};

export default function NewTaleReader({ tale, progress }: NewTaleReaderProps) {
  const fallbackProgress = progress ?? getInitialProgressFromLocalStorage(tale);

  return (
    <ReaderStoreProvider initialTale={tale} initialProgress={fallbackProgress}>
      <ReaderNavProvider>
        <div className="relative h-screen w-screen overflow-hidden">
          {/* UI overlay stays fixed above the scroller */}
          <div className="pointer-events-none fixed top-0 left-0 z-30 h-screen w-screen">
            <div className="pointer-events-none relative h-full w-full">
              <ReaderUiToggle />
            </div>
          </div>

          <ScrollStage className="h-screen w-screen overflow-hidden">
            <ReaderSection
              id="chapter-1"
              layout="vertical"
              className="flex h-screen items-center justify-center"
            >
              <h1 className="text-3xl">Chapter 1 (vertical)</h1>
            </ReaderSection>

            <ReaderSection
              id="chapter-2"
              layout="horizontal"
              direction="right"
              className="relative h-screen overflow-hidden"
              trackClassName="flex h-full w-max"
            >
              <div className="flex h-screen w-screen items-center justify-center">
                <h2 className="text-3xl">Chapter 2 — Panel 1</h2>
              </div>
              <div className="flex h-screen w-screen items-center justify-center">
                <h2 className="text-3xl">Chapter 2 — Panel 2</h2>
              </div>
              <div className="flex h-screen w-screen items-center justify-center">
                <h2 className="text-3xl">Chapter 2 — Panel 3</h2>
              </div>
            </ReaderSection>

            <ReaderSection
              id="chapter-3"
              layout="horizontal"
              direction="left"
              className="relative h-screen overflow-hidden"
              trackClassName="flex h-full w-max"
            >
              <div className="flex h-screen w-screen items-center justify-center">
                <h2 className="text-3xl">Chapter 3 — Panel 1</h2>
              </div>
              <div className="flex h-screen w-screen items-center justify-center">
                <h2 className="text-3xl">Chapter 3 — Panel 2</h2>
              </div>
            </ReaderSection>

            <ReaderSection
              id="chapter-4"
              layout="vertical"
              className="flex h-screen items-center justify-center"
            >
              <h1 className="text-3xl">Chapter 4 (vertical)</h1>
            </ReaderSection>
          </ScrollStage>
        </div>
      </ReaderNavProvider>
    </ReaderStoreProvider>
  );
}
