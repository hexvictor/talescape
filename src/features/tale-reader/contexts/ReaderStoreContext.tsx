import { useStore, type StoreApi } from "zustand";
import { createContext, useContext, useEffect, useRef } from "react";
import type { Tale } from "~/features/tale-reader/types/taleStructure";
import {
  createTaleReaderStore,
  type TaleReaderState,
} from "~/features/tale-reader/store/TaleReaderStore";
import type { TaleProgressSchema } from "~/server/db/schema";

const ReaderStoreContext = createContext<ReturnType<
  typeof createTaleReaderStore
> | null>(null);

export const ReaderStoreProvider = ({
  children,
  initialTale,
  initialProgress,
}: {
  children: React.ReactNode;
  initialTale: Tale;
  initialProgress: TaleProgressSchema;
}) => {
  const store = useRef(
    createTaleReaderStore(initialTale, initialProgress)
  ).current;

  return (
    <ReaderStoreContext.Provider value={store}>
      {children}
    </ReaderStoreContext.Provider>
  );
};

export function useReaderStoreInstance(): StoreApi<TaleReaderState> {
  const store = useContext(ReaderStoreContext);
  if (!store) throw new Error("Must be used within ReaderStoreProvider");
  return store;
}

export const useReaderStore = <T,>(selector: (state: TaleReaderState) => T) => {
  const store = useContext(ReaderStoreContext);
  if (!store) throw new Error("ReaderStore not found");
  return useStore(store, selector);
};
