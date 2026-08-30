import { describe, expect, it } from "vitest";
import type { Tale } from "../types";
import {
	createTaleAppDerivedState,
	createTaleAppStore,
} from "./createTaleAppStore";

const tale = { id: 42 } as Tale;

describe("createTaleAppStore", () => {
	it("sets the reader workspace when Tale Reader omits one", () => {
		const store = createTaleAppStore(tale, "reader");
		const state = store.getState();
		const derived = createTaleAppDerivedState(state);

		expect(state.runtime).toMatchObject({
			application: "reader",
			workspace: "reader",
		});
		expect(derived.isReader).toBe(true);
		expect(derived.isStudio).toBe(false);
	});

	it.each(["editor", "preview"] as const)(
		"initializes Tale Studio in the %s workspace",
		(workspace) => {
			const store = createTaleAppStore(tale, "editor", workspace);
			const state = store.getState();
			const derived = createTaleAppDerivedState(state);

			expect(state.runtime).toMatchObject({
				application: "editor",
				workspace,
			});
			expect(derived.isEditorWorkspace).toBe(workspace === "editor");
			expect(derived.isPreviewWorkspace).toBe(workspace === "preview");
			expect(derived.isStudio).toBe(true);
		},
	);

	it("requires an explicit workspace for Tale Studio", () => {
		expect(() => createTaleAppStore(tale, "editor")).toThrow(
			"Tale Studio requires an explicit editor or preview workspace.",
		);
	});

	it("updates the workspace without replacing the tale draft", () => {
		const store = createTaleAppStore(tale, "editor", "editor");

		store.getState().runtime.setWorkspace("preview");

		const state = store.getState();
		expect(state.document.tale).toBe(tale);
		expect(state.runtime.workspace).toBe("preview");
		expect(createTaleAppDerivedState(state).isPreviewWorkspace).toBe(true);
	});

	it("keeps Reader and Studio workspace domains separate", () => {
		const readerStore = createTaleAppStore(tale, "reader");
		const studioStore = createTaleAppStore(tale, "editor", "editor");

		readerStore.getState().runtime.setWorkspace("preview");
		studioStore.getState().runtime.setWorkspace("reader");

		expect(readerStore.getState().runtime.workspace).toBe("reader");
		expect(studioStore.getState().runtime.workspace).toBe("editor");
	});
});
