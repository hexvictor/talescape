import type { StateCreator } from "zustand/vanilla";
import type { ReaderInspectorTarget, ReaderMode } from "../../types";
import type { TaleReaderState } from "../createReaderStore";

export type EditorSlice = {
	editor: {
		inspector: ReaderInspectorTarget | null;
		inspectorControlsOpen: boolean;
		mode: ReaderMode;
		closeInspector: () => void;
		openInspector: (target: ReaderInspectorTarget) => void;
		toggleInspectorControls: () => void;
	};
};

/**
 * Creates state used only while authoring a tale.
 *
 * @param mode - Reader mode selected by the route.
 * @returns Zustand slice creator for editor-only state and actions.
 *
 * @example
 * const slice = createEditorSlice("edit");
 */
export const createEditorSlice =
	(mode: ReaderMode): StateCreator<TaleReaderState, [], [], EditorSlice> =>
	(set) => ({
		editor: {
			inspector: null,
			inspectorControlsOpen: false,
			mode,
			closeInspector: () =>
				set((state) => ({
					editor: { ...state.editor, inspector: null },
				})),
			openInspector: (inspector) =>
				set((state) => ({
					editor: { ...state.editor, inspector },
				})),
			toggleInspectorControls: () =>
				set((state) => ({
					editor: {
						...state.editor,
						inspectorControlsOpen: !state.editor.inspectorControlsOpen,
					},
				})),
		},
	});
