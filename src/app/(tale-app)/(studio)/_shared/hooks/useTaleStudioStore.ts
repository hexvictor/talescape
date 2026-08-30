"use client";

import type { TaleInspectorTarget } from "~/app/(tale-app)/_shared/types";
import { createDerivedStoreHooks } from "~/lib/zustand/createDerivedStoreHooks";
import { useTaleStudio } from "../contexts/TaleStudioProvider";
import {
	type TaleStudioDerivedState,
	type TaleStudioState,
	createTaleStudioDerivedState,
} from "../store/taleStudioStore";

function useTaleStudioStoreInstance() {
	return useTaleStudio().store;
}

const taleStudioStoreHooks = createDerivedStoreHooks<
	TaleStudioState,
	TaleStudioDerivedState
>(useTaleStudioStoreInstance, createTaleStudioDerivedState);

/**
 * Selects canonical or lazy derived state from the Tale Studio store.
 *
 * @param selector - Selector receiving Tale Studio state and derivations.
 * @returns Selected Tale Studio value.
 *
 * @example
 * const hasSelection = useTaleStudioStore((state) => state.derived.hasGraphSelection);
 */
export const useTaleStudioStore = taleStudioStoreHooks.useStore;

/**
 * Selects a shallow-equal object from the Tale Studio store.
 *
 * @param selector - Selector returning an object or tuple.
 * @returns Stable shallow-equal Studio selection.
 *
 * @example
 * const { rightPanelOpen, livePreviewWidth } = useTaleStudioStoreShallow((state) => state.editorLayout);
 */
export const useTaleStudioStoreShallow = taleStudioStoreHooks.useStoreShallow;

type TaleStudioOverlayState = {
	closeInspector: TaleStudioState["studioSelection"]["closeInspector"];
	closeSecondaryInspector: TaleStudioState["studioSelection"]["closeSecondaryInspector"];
	inspector: TaleInspectorTarget | null;
	secondaryInspector: TaleInspectorTarget | null;
};

/**
 * Selects state required by Studio inspector overlays.
 *
 * @returns Stable Studio overlay state.
 *
 * @example
 * const { inspector, closeInspector } = useTaleStudioOverlayState();
 */
export function useTaleStudioOverlayState(): TaleStudioOverlayState {
	return useTaleStudioStoreShallow((state) => ({
		closeInspector: state.studioSelection.closeInspector,
		closeSecondaryInspector: state.studioSelection.closeSecondaryInspector,
		inspector: state.studioSelection.inspector,
		secondaryInspector: state.studioSelection.secondaryInspector,
	}));
}
