"use client";

import { createContext, useContext, useRef } from "react";
import { useStore, type StoreApi } from "zustand";
import type { Tale } from "~/features/tale-reader/types/taleStructure";
import type { TaleProgressSchema } from "~/server/db/schema";
import {
	createTaleReaderStore,
	type TaleReaderState,
} from "~/features/tale-reader/store/createTaleReaderStore";
import { getInitialProgressFromLocalStorage } from "~/features/tale-reader/services/progressStorage";

const ReaderStoreContext = createContext<StoreApi<TaleReaderState> | null>(
	null,
);

type ReaderStoreProviderProps = {
	children: React.ReactNode;
	initialTale: Tale;
	initialProgress: TaleProgressSchema | null;
};

export function ReaderStoreProvider({
	children,
	initialTale,
	initialProgress,
}: ReaderStoreProviderProps) {
	const storeRef = useRef<StoreApi<TaleReaderState> | null>(null);

	if (!storeRef.current) {
		const resolvedProgress =
			initialProgress ?? getInitialProgressFromLocalStorage(initialTale);

		storeRef.current = createTaleReaderStore(initialTale, resolvedProgress);
	}

	return (
		<ReaderStoreContext.Provider value={storeRef.current}>
			{children}
		</ReaderStoreContext.Provider>
	);
}

export function useReaderStoreInstance(): StoreApi<TaleReaderState> {
	const store = useContext(ReaderStoreContext);
	if (!store) {
		throw new Error(
			"useReaderStoreInstance must be used within ReaderStoreProvider",
		);
	}
	return store;
}

export function useReaderStore<T>(selector: (state: TaleReaderState) => T): T {
	const store = useContext(ReaderStoreContext);
	if (!store) {
		throw new Error("useReaderStore must be used within ReaderStoreProvider");
	}
	return useStore(store, selector);
}
