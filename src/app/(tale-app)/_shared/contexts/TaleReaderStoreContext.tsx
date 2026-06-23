"use client";

import {
	type PropsWithChildren,
	createContext,
	useContext,
	useEffect,
	useRef,
} from "react";
import type { StoreApi } from "zustand/vanilla";
import { createDerivedStoreHooks } from "~/stores/createDerivedStoreHooks";
import {
	type TaleReaderDerivedState,
	type TaleReaderState,
	createTaleReaderDerivedState,
	createTaleReaderStore,
} from "../store/createTaleReaderStore";
import type { SavedReaderProgress, Tale } from "../types";
import { useTaleAppStoreInstance } from "./TaleAppStoreContext";

const TaleReaderStoreContext = createContext<StoreApi<TaleReaderState> | null>(
	null,
);

/**
 * Provides an isolated reader engine for a full reader or editor preview.
 *
 * @param props - Tale reader provider properties.
 * @param props.children - Reader viewport and related UI.
 * @param props.progress - Initial persisted reading progress.
 * @param props.tale - Initial document snapshot.
 * @returns Reader store provider and document synchronizer.
 */
export function TaleReaderStoreProvider({
	children,
	progress,
	tale,
}: PropsWithChildren<{
	progress: SavedReaderProgress;
	tale: Tale;
}>): React.JSX.Element {
	const taleAppStore = useTaleAppStoreInstance();
	const storeRef = useRef<StoreApi<TaleReaderState> | null>(null);
	if (!storeRef.current) {
		const { activity, application } = taleAppStore.getState().runtime;
		storeRef.current = createTaleReaderStore(tale, progress, {
			activity,
			application,
		});
	}

	return (
		<TaleReaderStoreContext.Provider value={storeRef.current}>
			<ReaderDocumentSynchronizer />
			{children}
		</TaleReaderStoreContext.Provider>
	);
}

/**
 * Reads the active tale reader store instance.
 *
 * @returns Active tale reader store.
 */
export function useTaleReaderStoreInstance(): StoreApi<TaleReaderState> {
	const store = useContext(TaleReaderStoreContext);
	if (!store) {
		throw new Error(
			"useTaleReaderStoreInstance must be used inside TaleReaderStoreProvider.",
		);
	}
	return store;
}

const taleReaderStoreHooks = createDerivedStoreHooks<
	TaleReaderState,
	TaleReaderDerivedState
>(useTaleReaderStoreInstance, createTaleReaderDerivedState);

/**
 * Selects canonical or lazy derived state from the active tale reader.
 *
 * @param selector - Selector receiving reader state and derivations.
 * @returns Selected reader value.
 *
 * @example
 * const layout = useTaleReaderStore((state) => state.derived.viewportLayout);
 */
export const useTaleReaderStore = taleReaderStoreHooks.useStore;

/**
 * Selects a flat shallow-equal value from the active tale reader store.
 *
 * @param selector - Reader selector returning a flat object or tuple.
 * @returns Shallow-stable selected reader value.
 */
export const useTaleReaderStoreShallow = taleReaderStoreHooks.useStoreShallow;

/**
 * Invalidates disposable reader data when the authored document changes.
 *
 * @returns No rendered output.
 */
function ReaderDocumentSynchronizer(): null {
	const documentStore = useTaleAppStoreInstance();
	const readerStore = useTaleReaderStoreInstance();

	useEffect(
		() =>
			documentStore.subscribe((state, previousState) => {
				if (state.document.revision === previousState.document.revision) return;
				const change = state.document.lastChange;
				if (!change) return;
				if (change.invalidation === "repaint") {
					readerStore.getState().scroll.api?.repaint();
					return;
				}
				readerStore.getState().scroll.api?.capturePosition();
				readerStore.getState().engine.requestRecompile(change.reason);
			}),
		[documentStore, readerStore],
	);

	return null;
}
