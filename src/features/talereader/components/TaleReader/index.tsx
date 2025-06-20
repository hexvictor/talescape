"use client";

import {
  ReaderStoreProvider,
  useReaderStore,
} from "~/features/talereader/contexts/ReaderStoreContext";
import type { Tale } from "~/types/tale-reader/taleStructure";
import TaleProgress from "../ui/TaleProgress";
import ReaderUiToggle from "../ui/ReaderUiToggle";
import TaleContent from "../TaleContent";
import EntryNavigator from "../ui/EntryNavigator";
import { ReaderNavProvider } from "../../contexts/ReaderNavContext";
import type { TaleProgressSchema } from "~/server/db/schema";
import { getInitialProgressFromLocalStorage } from "~/lib/tale/progressStorage";

type TaleReaderProps = {
  tale: Tale;
  progress: TaleProgressSchema | null;
};

export default function TaleReader({ tale, progress }: TaleReaderProps) {
  const fallbackProgress = progress ?? getInitialProgressFromLocalStorage(tale);

  return (
    <ReaderStoreProvider initialTale={tale} initialProgress={fallbackProgress}>
      <ReaderNavProvider>
        <div className="relative flex flex-col">
          <div className="pointer-events-none fixed top-0 left-0 z-30 h-screen w-screen">
            <div className="pointer-events-none relative h-full w-full">
              {/* <ContentsNavigator /> */}
              <TaleProgress />
              <EntryNavigator />
              {/* <PageNavigator /> */}
              <ReaderUiToggle />
            </div>
          </div>
          <TaleContent />
        </div>
      </ReaderNavProvider>
    </ReaderStoreProvider>
  );
}
