"use client";

import {
	type PropsWithChildren,
	createContext,
	useContext,
	useRef,
} from "react";
import type { StoreApi } from "zustand/vanilla";
import { createDerivedStoreHooks } from "~/lib/zustand/createDerivedStoreHooks";
import {
	type TaleAppDerivedState,
	type TaleAppState,
	type TaleStudioWorkspace,
	createTaleAppDerivedState,
	createTaleAppStore,
} from "../stores/createTaleAppStore";
import type { Tale } from "../types";

const TaleAppStoreContext = createContext<StoreApi<TaleAppState> | null>(null);

type TaleAppProviderProps = PropsWithChildren<
	| {
			application: "editor";
			tale: Tale;
			workspace: TaleStudioWorkspace;
	  }
	| {
			application: "reader";
			tale: Tale;
			workspace?: never;
	  }
>;

/**
 * Provides one canonical tale document to Tale Reader and Tale Studio.
 *
 * @param props - Provider props.
 * @param props.application - Reader or Studio application mounting the tale.
 * @param props.children - Runtime components that consume the tale document.
 * @param props.tale - Initial formatted tale.
 * @param props.workspace - URL-backed Studio workspace; omitted by Tale Reader.
 * @returns Shared tale application provider.
 *
 * @example
 * <TaleAppProvider application="reader" tale={tale}>{children}</TaleAppProvider>
 */
export function TaleAppProvider({
	children,
	application,
	tale,
	workspace,
}: TaleAppProviderProps): React.JSX.Element {
	const storeRef = useRef<StoreApi<TaleAppState> | null>(null);
	if (!storeRef.current) {
		storeRef.current = createTaleAppStore(tale, application, workspace);
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
			"useTaleAppStoreInstance must be used inside TaleAppProvider.",
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
 * const previewing = useTaleAppStore((state) => state.derived.isPreviewWorkspace);
 */
export const useTaleAppStore = taleAppStoreHooks.useStore;

/**
 * Selects a flat shallow-equal value from the tale application store.
 *
 * @param selector - Tale application selector returning a flat object or tuple.
 * @returns Shallow-stable selected value.
 */
export const useTaleAppStoreShallow = taleAppStoreHooks.useStoreShallow;
