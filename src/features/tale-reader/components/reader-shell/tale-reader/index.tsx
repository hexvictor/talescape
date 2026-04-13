"use client";

import { ReaderStoreProvider } from "~/features/tale-reader/contexts/ReaderStoreContext";
import type { Tale } from "~/features/tale-reader/types/taleStructure";
import type { TaleProgressSchema } from "~/server/db/schema";
import LoadingTale from "../../feedback-states/loading-tale";
import TaleRebuildOverlay from "../../feedback-states/tale-rebuild-overlay";
import { ContentsNavigator } from "../../ui/contents-navigator";
import EntryNavigator from "../../ui/entry-navigator/EntryNavigator";
import ReaderUiToggle from "../../ui/reader-ui-toggle";
import TaleProgress from "../../ui/tale-progress";
import TaleHub from "../tale-hub";
import TaleViewport from "../tale-viewport";

type TaleReaderProps = {
  tale: Tale;
  progress: TaleProgressSchema | null;
};

export default function TaleReader({ tale, progress }: TaleReaderProps) {
  return (
    <ReaderStoreProvider initialTale={tale} initialProgress={progress}>
      <LoadingTale>
        <div className="relative flex flex-col overflow-hidden">
          <div className="pointer-events-none fixed top-0 left-0 z-30 h-screen w-screen">
            <div className="pointer-events-none relative h-full w-full">
              <ContentsNavigator />
              <TaleProgress />
              <EntryNavigator />
              <ReaderUiToggle />
            </div>
          </div>

          <TaleViewport />
          <TaleHub />
          <TaleRebuildOverlay />
        </div>
      </LoadingTale>
    </ReaderStoreProvider>
  );
}
