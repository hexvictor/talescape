import { createContext, useContext } from "react";
import {
  useAnchorNavigation,
  type NavigateToAnchor,
  type GoToAnchor,
  type ScrollToAnchor,
} from "~/features/tale-reader/hooks/useAnchorNavigation";

interface ReaderNavProviderProps {
  children: React.ReactNode;
}

interface ReaderNavContextProps {
  navigateToAnchor: NavigateToAnchor;
  goToAnchor: GoToAnchor;
  scrollToAnchor: ScrollToAnchor;
  triggerScrollActivity: () => void;
  cancelScrollActivity: () => void;
}

const ReaderNavContext = createContext<ReaderNavContextProps | null>(null);

export function ReaderNavProvider({ children }: ReaderNavProviderProps) {
  const {
    goToAnchor,
    navigateToAnchor,
    scrollToAnchor,
    triggerScrollActivity,
    cancelScrollActivity,
  } = useAnchorNavigation();

  return (
    <ReaderNavContext.Provider
      value={{
        goToAnchor,
        navigateToAnchor,
        scrollToAnchor,
        triggerScrollActivity,
        cancelScrollActivity,
      }}
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
