"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
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

  taleHubOpen: boolean;
  openTaleHub: () => void;
  closeTaleHub: () => void;
  toggleTaleHub: () => void;

  taleHubOpenRef: RefObject<boolean>;
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

  const [taleHubOpen, setTaleHubOpen] = useState(false);
  const taleHubOpenRef = useRef(false);

  useEffect(() => {
    taleHubOpenRef.current = taleHubOpen;
  }, [taleHubOpen]);

  const value = useMemo<ReaderNavContextProps>(
    () => ({
      goToAnchor,
      navigateToAnchor,
      scrollToAnchor,
      triggerScrollActivity,
      cancelScrollActivity,

      taleHubOpen,
      openTaleHub: () => setTaleHubOpen(true),
      closeTaleHub: () => setTaleHubOpen(false),
      toggleTaleHub: () => setTaleHubOpen((v) => !v),

      taleHubOpenRef,
    }),
    [
      goToAnchor,
      navigateToAnchor,
      scrollToAnchor,
      triggerScrollActivity,
      cancelScrollActivity,
      taleHubOpen,
    ],
  );

  return (
    <ReaderNavContext.Provider value={value}>
      {children}
    </ReaderNavContext.Provider>
  );
}

export function useReaderNavContext() {
  const context = useContext(ReaderNavContext);
  if (!context) {
    throw new Error(
      "useReaderNavContext must be used within a ReaderNavProvider",
    );
  }
  return context;
}
