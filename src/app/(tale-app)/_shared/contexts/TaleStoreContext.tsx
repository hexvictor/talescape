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
	type TaleStoreExtensionCreator,
	createTaleStore,
} from "../store/createTaleStore";
import type { TaleStoreMode, SavedReaderProgress, Tale } from "../types";

const TaleStoreContext = createContext<StoreApi<TaleReaderState> | null>(null);

/**
 * Provides one tale runtime store instance to reader or editor components.
 *
 * @param props - The provider props.
 * @param props.children - Components that need access to the tale runtime store.
 * @param props.progress - The progress object used to initialize the store.
 * @param props.tale - The formatted tale structure loaded for this runtime.
 * @returns A React context provider wrapping the tale runtime subtree.
 *
 * @example
 * <TaleStoreProvider tale={tale} progress={progress}>{children}</TaleStoreProvider>
 */
export function TaleStoreProvider<
	TState extends TaleReaderState = TaleReaderState,
>({
	children,
	createExtension,
	mode = "read",
	progress,
	tale,
}: PropsWithChildren<{
	createExtension?: TaleStoreExtensionCreator<TState>;
	mode?: TaleStoreMode;
	progress: SavedReaderProgress;
	tale: Tale;
}>) {
	const storeRef = useRef<StoreApi<TState> | null>(null);

	if (!storeRef.current) {
		storeRef.current = createTaleStore(tale, progress, mode, createExtension);
	}

	return (
		<TaleStoreContext.Provider
			value={storeRef.current as unknown as StoreApi<TaleReaderState>}
		>
			{children}
		</TaleStoreContext.Provider>
	);
}

/**
 * Reads the active tale runtime store from context.
 *
 * @returns The vanilla Zustand reader store instance.
 *
 * @example
 * const store = useTaleStoreInstance();
 */
export function useTaleStoreInstance() {
	const store = useContext(TaleStoreContext);
	if (!store) {
		throw new Error(
			"useTaleStoreInstance must be used inside TaleStoreProvider.",
		);
	}
	return store;
}

/**
 * Selects data from the active tale runtime store.
 *
 * @param selector - Selector that receives the full reader state.
 * @returns The selected store value.
 *
 * @example
 * const current = useTaleStore((state) => state.navigation.current);
 */
export function useTaleStore<T>(selector: (state: TaleReaderState) => T) {
	return useStore(useTaleStoreInstance(), selector);
}

/**
 * Selects several reader values while preserving the previous shallow-equal
 * snapshot.
 *
 * @param selector - Selector that returns a shallow object or array.
 * @returns The selected value with stable snapshot identity.
 *
 * @example
 * const { compiled, location } = useTaleStoreShallow((state) => ({
 *   compiled: state.reader.compiled,
 *   location: state.navigation.current,
 * }));
 */
export function useTaleStoreShallow<T>(
	selector: (state: TaleReaderState) => T,
): T {
	return useTaleStore(useShallow(selector));
}
