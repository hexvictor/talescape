"use client";

import type { Tale } from "~/features/tale-reader/types/taleStructure";
import TaleProgress from "../../ui/tale-progress";
import ReaderUiToggle from "../../ui/reader-ui-toggle";
import EntryNavigator from "../../ui/entry-navigator/EntryNavigator";
import type { TaleProgressSchema } from "~/server/db/schema";
import { getInitialProgressFromLocalStorage } from "~/features/tale-reader/services/progressStorage";
import { ReaderStoreProvider } from "../../../contexts/ReaderStoreContext";
import { ContentsNavigator } from "../../ui/contents-navigator";
import TalePage from "../tale-page";
import { PageNavigator } from "../../ui";
import TaleHub from "../tale-hub";

type TaleReaderProps = {
  tale: Tale;
  progress: TaleProgressSchema | null;
};

export default function TaleReader({ tale, progress }: TaleReaderProps) {
  const fallbackProgress = progress ?? getInitialProgressFromLocalStorage(tale);

  return (
    <ReaderStoreProvider initialTale={tale} initialProgress={fallbackProgress}>
        <div className="relative flex flex-col overflow-hidden">
          <div className="pointer-events-none fixed top-0 left-0 z-30 h-screen w-screen">
            <div className="pointer-events-none relative h-full w-full">
              <ContentsNavigator />
              <TaleProgress />
              <EntryNavigator />
              <PageNavigator/>
              <ReaderUiToggle />
            </div>
          </div>

          <TalePage />

          <TaleHub />
        </div>
    </ReaderStoreProvider>
  );
}
