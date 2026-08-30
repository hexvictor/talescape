"use client";

import {
	type PropsWithChildren,
	createContext,
	useContext,
	useEffect,
	useRef,
} from "react";
import type { StoreApi } from "zustand/vanilla";
import {
	type TaleRootDerivedState,
	type TaleRootState,
	createTaleRootDerivedState,
	createTaleRootStore,
} from "~/app/_shared/stores/taleRootStore";
import { createDerivedStoreHooks } from "~/lib/zustand/createDerivedStoreHooks";

const TaleRootStoreContext = createContext<StoreApi<TaleRootState> | null>(
	null,
);

/**
 * Provides application-wide theme and browser environment state.
 *
 * @param props - Provider props.
 * @param props.children - Application subtree.
 * @returns Global application store provider.
 *
 * @example
 * <TaleRootStoreProvider>{children}</TaleRootStoreProvider>
 */
export function TaleRootStoreProvider({
	children,
}: PropsWithChildren): React.JSX.Element {
	const storeRef = useRef<StoreApi<TaleRootState> | null>(null);
	if (!storeRef.current) storeRef.current = createTaleRootStore();

	return (
		<TaleRootStoreContext.Provider value={storeRef.current}>
			<TaleRootStateSynchronizer />
			{children}
		</TaleRootStoreContext.Provider>
	);
}

/**
 * Reads the active application store instance.
 *
 * @returns Application store instance.
 */
export function useTaleRootStoreInstance(): StoreApi<TaleRootState> {
	const store = useContext(TaleRootStoreContext);
	if (!store) {
		throw new Error(
			"useTaleRootStoreInstance must be used inside TaleRootStoreProvider.",
		);
	}
	return store;
}

const taleRootStoreHooks = createDerivedStoreHooks<
	TaleRootState,
	TaleRootDerivedState
>(useTaleRootStoreInstance, createTaleRootDerivedState);

/**
 * Selects state and optional lazy derived values from the application store.
 *
 * @param selector - Selector receiving canonical and derived state.
 * @returns Selected application value.
 *
 * @example
 * const theme = useTaleRootStore((state) => state.theme.value);
 */
export const useTaleRootStore = taleRootStoreHooks.useStore;

/**
 * Selects a shallow-equal value from application state and derived values.
 *
 * @param selector - Flat object or tuple selector.
 * @returns Shallow-stable application selection.
 */
export const useTaleRootStoreShallow = taleRootStoreHooks.useStoreShallow;

/** Synchronizes browser-owned theme and environment values into the app store. */
function TaleRootStateSynchronizer(): null {
	const store = useTaleRootStoreInstance();

	useEffect(() => {
		const motionPreference = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		);
		const update = (): void => {
			store
				.getState()
				.environment.setViewport(window.innerHeight, window.innerWidth);
		};
		store.getState().theme.hydrate();
		update();
		window.addEventListener("resize", update, { passive: true });
		motionPreference.addEventListener("change", update);
		return () => {
			window.removeEventListener("resize", update);
			motionPreference.removeEventListener("change", update);
		};
	}, [store]);

	return null;
}
