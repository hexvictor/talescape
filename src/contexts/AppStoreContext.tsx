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
	type AppDerivedState,
	type AppState,
	createAppDerivedState,
	createAppStore,
} from "~/stores/appStore";
import { createDerivedStoreHooks } from "~/stores/createDerivedStoreHooks";

const AppStoreContext = createContext<StoreApi<AppState> | null>(null);

/**
 * Provides application-wide theme and browser environment state.
 *
 * @param props - Provider props.
 * @param props.children - Application subtree.
 * @returns Global application store provider.
 *
 * @example
 * <AppStoreProvider>{children}</AppStoreProvider>
 */
export function AppStoreProvider({
	children,
}: PropsWithChildren): React.JSX.Element {
	const storeRef = useRef<StoreApi<AppState> | null>(null);
	if (!storeRef.current) storeRef.current = createAppStore();

	return (
		<AppStoreContext.Provider value={storeRef.current}>
			<AppStateSynchronizer />
			{children}
		</AppStoreContext.Provider>
	);
}

/**
 * Reads the active application store instance.
 *
 * @returns Application store instance.
 */
export function useAppStoreInstance(): StoreApi<AppState> {
	const store = useContext(AppStoreContext);
	if (!store) {
		throw new Error(
			"useAppStoreInstance must be used inside AppStoreProvider.",
		);
	}
	return store;
}

const appStoreHooks = createDerivedStoreHooks<AppState, AppDerivedState>(
	useAppStoreInstance,
	createAppDerivedState,
);

/**
 * Selects state and optional lazy derived values from the application store.
 *
 * @param selector - Selector receiving canonical and derived state.
 * @returns Selected application value.
 *
 * @example
 * const theme = useAppStore((state) => state.theme.value);
 */
export const useAppStore = appStoreHooks.useStore;

/**
 * Selects a shallow-equal value from application state and derived values.
 *
 * @param selector - Flat object or tuple selector.
 * @returns Shallow-stable application selection.
 */
export const useAppStoreShallow = appStoreHooks.useStoreShallow;

/** Synchronizes browser-owned theme and environment values into the app store. */
function AppStateSynchronizer(): null {
	const store = useAppStoreInstance();

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
