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
export type TaleWorkspace = "editor" | "preview" | "reader";
export type TaleStudioWorkspace = Exclude<TaleWorkspace, "reader">;

export type TaleAppRuntime = {
	application: TaleApplication;
	breakpointId: string | null;
	setBreakpointId: (breakpointId: string | null) => void;
	setWorkspace: (workspace: TaleWorkspace) => void;
	workspace: TaleWorkspace;
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
	readonly isEditorWorkspace: boolean;
	readonly isLivePreview: boolean;
	readonly isPreviewWorkspace: boolean;
	readonly isReader: boolean;
	readonly isStudio: boolean;
};

/**
 * Creates shared tale document and application workspace state.
 *
 * Reader engine data and editor graph/layout state intentionally live in
 * separate stores and may be reconstructed from this canonical document.
 *
 * @param initialTale - Formatted tale loaded for the current route.
 * @param application - Application surface mounting the tale document.
 * @param workspace - Studio workspace. Reader applications resolve to `reader`.
 * @returns Authored tale data, revision metadata, and shared runtime context.
 *
 * @example
 * const store = createTaleAppStore(tale, "editor", "preview");
 */
export function createTaleAppStore(
	initialTale: Tale,
	application: TaleApplication,
	workspace?: TaleStudioWorkspace,
): StoreApi<TaleAppState> {
	if (application === "editor" && workspace === undefined) {
		throw new Error(
			"Tale Studio requires an explicit editor or preview workspace.",
		);
	}

	const initialWorkspace: TaleWorkspace =
		application === "reader" ? "reader" : (workspace ?? "editor");

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
					application,
					breakpointId: null,
					setBreakpointId: (breakpointId) =>
						set((state) => ({
							runtime: { ...state.runtime, breakpointId },
						})),
					setWorkspace: (workspace) =>
						set((state) => {
							const validWorkspace =
								state.runtime.application === "reader"
									? workspace === "reader"
									: workspace !== "reader";
							if (!validWorkspace) return state;
							return {
								runtime: { ...state.runtime, workspace },
							};
						}),
					workspace: initialWorkspace,
				},
			}),
			{
				name: "TaleAppStore",
			},
		),
	);
}

/**
 * Creates lazy runtime derivations shared by Tale Reader and Tale Studio.
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
		get isEditorWorkspace() {
			return (
				state.runtime.application === "editor" &&
				state.runtime.workspace === "editor"
			);
		},
		get isLivePreview() {
			return (
				state.runtime.application === "editor" &&
				state.runtime.workspace === "editor"
			);
		},
		get isPreviewWorkspace() {
			return (
				state.runtime.application === "editor" &&
				state.runtime.workspace === "preview"
			);
		},
		get isReader() {
			return (
				state.runtime.application === "reader" &&
				state.runtime.workspace === "reader"
			);
		},
		get isStudio() {
			return state.runtime.application === "editor";
		},
	};
}
