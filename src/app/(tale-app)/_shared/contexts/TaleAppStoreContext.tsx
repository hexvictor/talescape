"use client";

import {
	type PropsWithChildren,
	createContext,
	useContext,
	useRef,
} from "react";
import type { StoreApi } from "zustand/vanilla";
import { createDerivedStoreHooks } from "~/stores/createDerivedStoreHooks";
import {
	type TaleAppDerivedState,
	type TaleAppState,
	type TaleApplication,
	createTaleAppDerivedState,
	createTaleAppStore,
} from "../store/createTaleAppStore";
import type { Tale } from "../types";

const TaleAppStoreContext = createContext<StoreApi<TaleAppState> | null>(null);

/**
 * Provides one canonical tale document to reader and editor runtimes.
 *
 * @param props - Provider props.
 * @param props.application - Reader or editor application mounting the tale.
 * @param props.children - Runtime components that consume the tale document.
 * @param props.tale - Initial formatted tale.
 * @returns Shared tale application provider.
 *
 * @example
 * <TaleAppStoreProvider application="reader" tale={tale}>{children}</TaleAppStoreProvider>
 */
export function TaleAppStoreProvider({
	children,
	application,
	tale,
}: PropsWithChildren<{
	application: TaleApplication;
	tale: Tale;
}>): React.JSX.Element {
	const storeRef = useRef<StoreApi<TaleAppState> | null>(null);
	if (!storeRef.current) {
		storeRef.current = createTaleAppStore(tale, application);
	}

	return (
		<TaleAppStoreContext.Provider value={storeRef.current}>
			{children}
		</TaleAppStoreContext.Provider>
	);
}

/**
 * Reads the active shared tale application store.
 *
 * @returns Tale application store instance.
 */
export function useTaleAppStoreInstance(): StoreApi<TaleAppState> {
	const store = useContext(TaleAppStoreContext);
	if (!store) {
		throw new Error(
			"useTaleAppStoreInstance must be used inside TaleAppStoreProvider.",
		);
	}
	return store;
}

const taleAppStoreHooks = createDerivedStoreHooks<
	TaleAppState,
	TaleAppDerivedState
>(useTaleAppStoreInstance, createTaleAppDerivedState);

/**
 * Selects canonical or lazy derived state from the tale application store.
 *
 * @param selector - Selector receiving tale application state and derivations.
 * @returns Selected tale application value.
 *
 * @example
 * const previewing = useTaleAppStore((state) => state.derived.isPreviewing);
 */
export const useTaleAppStore = taleAppStoreHooks.useStore;

/**
 * Selects a flat shallow-equal value from the tale application store.
 *
 * @param selector - Tale application selector returning a flat object or tuple.
 * @returns Shallow-stable selected value.
 */
export const useTaleAppStoreShallow = taleAppStoreHooks.useStoreShallow;
