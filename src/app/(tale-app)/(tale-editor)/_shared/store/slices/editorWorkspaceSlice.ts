import type { StateCreator } from "zustand/vanilla";
import type { TaleEditorState } from "../taleEditorStore";

export type EditorWorkspaceSlice = {
	editorWorkspace: {
		previewWidth: number;
		rightPanelOpen: boolean;
		rightPanelWidth: number;
		setPreviewWidth: (width: number) => void;
		setRightPanelOpen: (open: boolean) => void;
		setRightPanelWidth: (width: number) => void;
	};
};

/**
 * Creates editor pane sizing and visibility state.
 *
 * @param set - Zustand state setter.
 * @returns Editor pane-layout slice.
 *
 * @example
 * const slice = createEditorWorkspaceSlice(set, get, api);
 */
export const createEditorWorkspaceSlice: StateCreator<
	TaleEditorState,
	[],
	[],
	EditorWorkspaceSlice
> = (set) => ({
	editorWorkspace: {
		previewWidth: 40,
		rightPanelOpen: true,
		rightPanelWidth: 360,
		setPreviewWidth: (previewWidth) =>
			set((state) => ({
				editorWorkspace: { ...state.editorWorkspace, previewWidth },
			})),
		setRightPanelOpen: (rightPanelOpen) =>
			set((state) => ({
				editorWorkspace: { ...state.editorWorkspace, rightPanelOpen },
			})),
		setRightPanelWidth: (rightPanelWidth) =>
			set((state) => ({
				editorWorkspace: { ...state.editorWorkspace, rightPanelWidth },
			})),
	},
});
