"use client";

import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { StoreApi } from "zustand/vanilla";

type StateWithoutDerived<State> = "derived" extends keyof State ? never : State;

export type StoreStateWithDerived<State, Derived> = State & {
	readonly derived: Derived;
};

export type StoreSelector<State, Derived, Selection> = (
	state: StoreStateWithDerived<State, Derived>,
) => Selection;

/**
 * Creates typed Zustand hooks with a lazily evaluated derived namespace.
 *
 * @param useStoreInstance - Hook that returns the active vanilla Zustand store.
 * @param createDerived - Creates read-only derived getters for one state snapshot.
 * @returns Narrow and shallow selector hooks for the store.
 *
 * @example
 * const hooks = createDerivedStoreHooks(useStoreInstance, createDerivedState);
 * const visible = hooks.useStore((state) => state.derived.isVisible);
 */
export function createDerivedStoreHooks<State extends object, Derived>(
	useStoreInstance: () => StoreApi<StateWithoutDerived<State>>,
	createDerived: (state: StateWithoutDerived<State>) => Derived,
): {
	useStore: <Selection>(
		selector: StoreSelector<StateWithoutDerived<State>, Derived, Selection>,
	) => Selection;
	useStoreShallow: <Selection>(
		selector: StoreSelector<StateWithoutDerived<State>, Derived, Selection>,
	) => Selection;
} {
	/** Selects one result from canonical state and lazy derived values. */
	function useSelectedStore<Selection>(
		selector: StoreSelector<StateWithoutDerived<State>, Derived, Selection>,
	): Selection {
		return useStore(useStoreInstance(), (state) =>
			selector(createStateWithDerived(state, createDerived)),
		);
	}

	/** Selects a shallow-equal result while retaining lazy derived access. */
	function useSelectedStoreShallow<Selection>(
		selector: StoreSelector<StateWithoutDerived<State>, Derived, Selection>,
	): Selection {
		return useStore(
			useStoreInstance(),
			useShallow((state) =>
				selector(createStateWithDerived(state, createDerived)),
			),
		);
	}

	return {
		useStore: useSelectedStore,
		useStoreShallow: useSelectedStoreShallow,
	};
}

/**
 * Creates a selector-only state view with derived getters attached.
 *
 * The returned object is not written back to Zustand. TypeScript also prevents
 * canonical store states from declaring a real `derived` field through the
 * `StoreStateWithoutDerived` constraint.
 *
 * @param state - Canonical Zustand state snapshot.
 * @param createDerived - Factory for read-only derived getters.
 * @returns State-shaped selector input with a read-only derived namespace.
 *
 * @example
 * const selected = selector(createStateWithDerived(state, createDerived));
 */
function createStateWithDerived<State extends object, Derived>(
	state: StateWithoutDerived<State>,
	createDerived: (state: StateWithoutDerived<State>) => Derived,
): StoreStateWithDerived<StateWithoutDerived<State>, Derived> {
	if (process.env.NODE_ENV !== "production" && "derived" in state) {
		throw new Error(
			"Store state must not declare a `derived` key. Derived values are selector-only.",
		);
	}
	const stateWithDerived = Object.create(state) as StoreStateWithDerived<
		StateWithoutDerived<State>,
		Derived
	>;
	Object.defineProperty(stateWithDerived, "derived", {
		configurable: false,
		enumerable: false,
		get: () => createDerived(state),
	});
	return stateWithDerived;
}
