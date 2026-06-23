"use client";

import {
	type PropsWithChildren,
	createContext,
	useContext,
	useRef,
} from "react";
import type { StoreApi } from "zustand/vanilla";
import {
	type TaleEditorState,
	createTaleEditorStore,
} from "../store/taleEditorStore";

const TaleEditorStoreContext = createContext<StoreApi<TaleEditorState> | null>(
	null,
);

/**
 * Provides editor-only graph, selection, and pane-layout state.
 *
 * @param props - Provider props.
 * @param props.children - Tale editor subtree.
 * @returns Editor store provider.
 */
export function TaleEditorStoreProvider({
	children,
}: PropsWithChildren): React.JSX.Element {
	const storeRef = useRef<StoreApi<TaleEditorState> | null>(null);
	if (!storeRef.current) storeRef.current = createTaleEditorStore();

	return (
		<TaleEditorStoreContext.Provider value={storeRef.current}>
			{children}
		</TaleEditorStoreContext.Provider>
	);
}

/**
 * Reads the active tale editor store.
 *
 * @returns Tale editor store instance.
 */
export function useTaleEditorStoreInstance(): StoreApi<TaleEditorState> {
	const store = useContext(TaleEditorStoreContext);
	if (!store) {
		throw new Error(
			"useTaleEditorStoreInstance must be used inside TaleEditorStoreProvider.",
		);
	}
	return store;
}
