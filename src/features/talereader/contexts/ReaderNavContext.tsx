import { createContext, useContext } from "react";
import {
  useAnchorNavigation,
  type NavigateToAnchorFunction,
} from "~/hooks/useAnchorNavigation";
import { useHandleProgressUpdate } from "~/hooks/useHandleProgressUpdate";
import type {
  NavigationOptions,
  NavigationTargetType,
} from "~/types/tale-reader/taleStructure";
import { useReaderStore } from "./ReaderStoreContext";

interface ReaderNavProviderProps {
  children: React.ReactNode;
}
interface ReaderNavContextProps {
  navigateToAnchor: NavigateToAnchorFunction;
}

const ReaderNavContext = createContext<ReaderNavContextProps | null>(null);

export function ReaderNavProvider({ children }: ReaderNavProviderProps) {
  const { navigateToAnchor } = useAnchorNavigation();
  const updateProgress = useHandleProgressUpdate();
  const getTargetBlock = useReaderStore((s) => s.getTargetBlock);

  const navigateToBlockWithProgress: NavigateToAnchorFunction = (
    id: number,
    {
      type = "block",
      shouldNavigate = true,
      ignoreAnchorCheck = false,
    }: Partial<NavigationOptions> = {}
  ) => {
    const block = getTargetBlock(id, type);
    if (!block) return;
    navigateToAnchor(block, { shouldNavigate, ignoreAnchorCheck });
    updateProgress(block.id);
  };

  return (
    <ReaderNavContext.Provider
      value={{ navigateToAnchor: navigateToBlockWithProgress }}
    >
      {children}
    </ReaderNavContext.Provider>
  );
}

export function useReaderNavContext() {
  const context = useContext(ReaderNavContext);
  if (!context) {
    throw new Error(
      "useReaderNavContext must be used within a ReaderNavProvider"
    );
  }
  return context;
}
