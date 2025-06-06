import { useSearchParams } from "next/navigation";
import type React from "react";
import { createContext, useContext } from "react";
import { useScrollNavigation } from "~/hooks/useScrollNavigation";
import type { TaleLayout } from "~/lib/data";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

interface TaleReaderProviderProps {
  children: React.ReactNode;
}

interface TaleReaderContextProps {
  goToBlock: (entryNumber: number, pageNumber?: number) => void;
}

const TaleReaderContext = createContext<TaleReaderContextProps | null>(null);

export function TaleReaderProvider({ children }: TaleReaderProviderProps) {
  //   const layout = useTaleReaderStore((s) => s.tale.layout);
  //   const layout = useTaleReaderStore((s) => s.tale.layout);
  const searchParams = useSearchParams();
  const layout = searchParams.get("layout") ?? "scroll"; // fallback padrão
  if (layout === "reel") {
    const goToBlock = useTaleReaderStore((s) => s.setNavigation);

    return (
      <TaleReaderContext.Provider value={{ goToBlock }}>
        {children}
      </TaleReaderContext.Provider>
    );
  } else {
    const { scrollToBlock } = useScrollNavigation();
    return (
      <TaleReaderContext.Provider value={{ goToBlock: scrollToBlock }}>
        {children}
      </TaleReaderContext.Provider>
    );
  }
}

export function useTaleReaderContext() {
  const context = useContext(TaleReaderContext);
  if (!context) {
    throw new Error(
      "useTaleReaderContext must be used within a TaleReaderProvider"
    );
  }
  return context;
}
