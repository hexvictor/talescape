"use client";

import {
	type PropsWithChildren,
	createContext,
	useContext,
	useRef,
} from "react";
import { type StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import {
	type TaleReaderState,
	createReaderStore,
} from "../store/createReaderStore";
import type { ReaderMode, SavedReaderProgress, Tale } from "../types";

const ReaderStoreContext = createContext<StoreApi<TaleReaderState> | null>(
	null,
);

/**
 * Provides one reader store instance to all reader components.
 *
 * @param props - The provider props.
 * @param props.children - Components that need access to the reader store.
 * @param props.progress - The progress object used to initialize the store.
 * @param props.tale - The formatted tale structure loaded for this reader.
 * @returns A React context provider wrapping the reader subtree.
 *
 * @example
 * <ReaderStoreProvider tale={tale} progress={progress}>{children}</ReaderStoreProvider>
 */
export function ReaderStoreProvider({
	children,
	mode = "read",
	progress,
	tale,
}: PropsWithChildren<{
	mode?: ReaderMode;
	progress: SavedReaderProgress;
	tale: Tale;
}>) {
	const storeRef = useRef<StoreApi<TaleReaderState> | null>(null);

	if (!storeRef.current) {
		storeRef.current = createReaderStore(tale, progress, mode);
	}

	return (
		<ReaderStoreContext.Provider value={storeRef.current}>
			{children}
		</ReaderStoreContext.Provider>
	);
}

/**
 * Reads the active reader store from context.
 *
 * @returns The vanilla Zustand reader store instance.
 *
 * @example
 * const store = useReaderStoreInstance();
 */
export function useReaderStoreInstance() {
	const store = useContext(ReaderStoreContext);
	if (!store) {
		throw new Error("useReaderStoreInstance must be used inside TaleReader.");
	}
	return store;
}

/**
 * Selects data from the active reader store.
 *
 * @param selector - Selector that receives the full reader state.
 * @returns The selected store value.
 *
 * @example
 * const current = useReaderStore((state) => state.navigation.current);
 */
export function useReaderStore<T>(selector: (state: TaleReaderState) => T) {
	return useStore(useReaderStoreInstance(), selector);
}

/**
 * Selects several reader values while preserving the previous shallow-equal
 * snapshot.
 *
 * @param selector - Selector that returns a shallow object or array.
 * @returns The selected value with stable snapshot identity.
 *
 * @example
 * const { compiled, location } = useReaderStoreShallow((state) => ({
 *   compiled: state.reader.compiled,
 *   location: state.navigation.current,
 * }));
 */
export function useReaderStoreShallow<T>(
	selector: (state: TaleReaderState) => T,
): T {
	return useReaderStore(useShallow(selector));
}
