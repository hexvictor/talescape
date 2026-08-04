import { devtools } from "zustand/middleware";
import { type StoreApi, createStore } from "zustand/vanilla";
import type { Tale } from "../types";

export type TaleDocumentInvalidation =
	| "animations"
	| "compilation"
	| "measurement"
	| "repaint";

export type TaleDocumentChange = {
	invalidation: TaleDocumentInvalidation;
	reason: string;
	revision: number;
};

export type TaleDocumentUpdateOptions = {
	invalidation?: TaleDocumentInvalidation;
	markDirty?: boolean;
	reason?: string;
	recompile?: boolean;
};

export type TaleApplication = "editor" | "reader";
export type TaleActivity = "editing" | "reading";

export type TaleAppRuntime = {
	activity: TaleActivity;
	application: TaleApplication;
	breakpointId: string | null;
	previewOpen: boolean;
	setBreakpointId: (breakpointId: string | null) => void;
	setActivity: (activity: TaleActivity) => void;
	setPreviewOpen: (open: boolean) => void;
};

export type TaleAppState = {
	document: {
		dirty: boolean;
		lastChange: TaleDocumentChange | null;
		markSaved: () => void;
		revision: number;
		setTale: (tale: Tale, options?: TaleDocumentUpdateOptions) => void;
		tale: Tale;
	};
	runtime: TaleAppRuntime;
};

export type TaleAppDerivedState = {
	readonly isEditing: boolean;
	readonly isEditor: boolean;
	readonly isPreviewing: boolean;
	readonly isReader: boolean;
	readonly isReading: boolean;
	readonly showsEditorDebug: boolean;
};

/**
 * Creates shared tale document and route-activity state.
 *
 * Reader engine data and editor graph/layout state intentionally live in
 * separate stores and may be reconstructed from this canonical document.
 *
 * @param initialTale - Formatted tale loaded for the current route.
 * @param application - Application surface mounting the tale document.
 * @returns Authored tale data, revision metadata, and shared runtime context.
 *
 * @example
 * const store = createTaleAppStore(tale);
 */
export function createTaleAppStore(
	initialTale: Tale,
	application: TaleApplication,
): StoreApi<TaleAppState> {
	return createStore<TaleAppState>()(
		devtools(
			(set) => ({
				document: {
					dirty: false,
					lastChange: null,
					markSaved: () =>
						set((state) => ({
							document: { ...state.document, dirty: false },
						})),
					revision: 0,
					setTale: (tale, options = {}) =>
						set((state) => {
							const revision = state.document.revision + 1;
							const invalidation =
								options.recompile === false
									? "repaint"
									: (options.invalidation ?? "measurement");
							return {
								document: {
									...state.document,
									dirty: options.markDirty ?? true,
									lastChange: {
										invalidation,
										reason: options.reason ?? "tale-document-updated",
										revision,
									},
									revision,
									tale,
								},
							};
						}),
					tale: initialTale,
				},
				runtime: {
					activity: application === "editor" ? "editing" : "reading",
					application,
					breakpointId: null,
					previewOpen: application === "editor",
					setBreakpointId: (breakpointId) =>
						set((state) => ({
							runtime: { ...state.runtime, breakpointId },
						})),
					setActivity: (activity) =>
						set((state) => ({
							runtime: { ...state.runtime, activity },
						})),
					setPreviewOpen: (previewOpen) =>
						set((state) => ({
							runtime: { ...state.runtime, previewOpen },
						})),
				},
			}),
			{
				enabled:
					process.env.NODE_ENV === "development" &&
					process.env.NEXT_PUBLIC_READER_STORE_DEVTOOLS === "true",
				name: "TaleAppStore",
			},
		),
	);
}

/**
 * Creates lazy runtime derivations shared by tale reader and editor surfaces.
 *
 * @param state - Current tale application state.
 * @returns Read-only runtime values derived from canonical state.
 *
 * @example
 * const derived = createTaleAppDerivedState(store.getState());
 */
export function createTaleAppDerivedState(
	state: TaleAppState,
): TaleAppDerivedState {
	return {
		get isEditing() {
			return state.runtime.activity === "editing";
		},
		get isEditor() {
			return state.runtime.application === "editor";
		},
		get isPreviewing() {
			return (
				state.runtime.application === "editor" &&
				state.runtime.activity === "editing" &&
				state.runtime.previewOpen
			);
		},
		get isReader() {
			return state.runtime.application === "reader";
		},
		get isReading() {
			return state.runtime.activity === "reading";
		},
		get showsEditorDebug() {
			return (
				state.runtime.application === "editor" &&
				state.runtime.activity === "reading"
			);
		},
	};
}
