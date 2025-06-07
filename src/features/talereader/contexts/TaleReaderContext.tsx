import React, { createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";
import { useScrollNavigation } from "~/hooks/useScrollNavigation";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

interface TaleReaderProviderProps {
  children: React.ReactNode;
}

interface TaleReaderContextProps {
  goToBlock: (entryNumber: number, pageNumber?: number) => void;
}

const TaleReaderContext = createContext<TaleReaderContextProps | null>(null);

function TaleReaderProviderBase({ children }: TaleReaderProviderProps) {
  //   const layout = useTaleReaderStore((s) => s.tale.layout);

  const searchParams = useSearchParams();
  const layout = searchParams.get("layout") === "reel" ? "reel" : "scroll"; // default vertical
  const isReel = layout === "reel";

  if (isReel) {
    const goToBlock = useTaleReaderStore((s) => s.setNavigation);

    return (
      <TaleReaderContext.Provider value={{ goToBlock }}>
        {children}
      </TaleReaderContext.Provider>
    );
  }

  const { scrollToBlock } = useScrollNavigation();

  return (
    <TaleReaderContext.Provider value={{ goToBlock: scrollToBlock }}>
      {children}
    </TaleReaderContext.Provider>
  );
}

export const TaleReaderProvider = React.memo(TaleReaderProviderBase);

export function useTaleReaderContext() {
  const context = useContext(TaleReaderContext);
  if (!context) {
    throw new Error(
      "useTaleReaderContext must be used within a TaleReaderProvider"
    );
  }
  return context;
}
