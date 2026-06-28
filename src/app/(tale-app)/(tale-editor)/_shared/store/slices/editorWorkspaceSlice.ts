import type { StateCreator } from "zustand/vanilla";
import type { TaleEditorState } from "../taleEditorStore";

export type EditorWorkspaceSlice = {
	editorWorkspace: {
		autoSelectActiveBlock: boolean;
		graphOpen: boolean;
		previewWidth: number;
		rightPanelOpen: boolean;
		rightPanelWidth: number;
		setAutoSelectActiveBlock: (enabled: boolean) => void;
		setGraphOpen: (open: boolean) => void;
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
		autoSelectActiveBlock: false,
		graphOpen: true,
		previewWidth: 40,
		rightPanelOpen: false,
		rightPanelWidth: 360,
		setAutoSelectActiveBlock: (autoSelectActiveBlock) =>
			set((state) => ({
				editorWorkspace: {
					...state.editorWorkspace,
					autoSelectActiveBlock,
				},
			})),
		setGraphOpen: (graphOpen) =>
			set((state) => ({
				editorWorkspace: { ...state.editorWorkspace, graphOpen },
			})),
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
