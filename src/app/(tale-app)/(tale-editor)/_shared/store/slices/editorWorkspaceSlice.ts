import type { StateCreator } from "zustand/vanilla";
import type { TaleEditorState } from "../taleEditorStore";
import type { EditorSurface } from "../editorStoreTypes";

export type EditorWorkspaceSlice = {
	editorWorkspace: {
		previewOpen: boolean;
		previewWidth: number;
		rightPanelOpen: boolean;
		rightPanelWidth: number;
		surface: EditorSurface;
		setPreviewOpen: (open: boolean) => void;
		setPreviewWidth: (width: number) => void;
		setRightPanelOpen: (open: boolean) => void;
		setRightPanelWidth: (width: number) => void;
		setSurface: (surface: EditorSurface) => void;
	};
};

/**
 * Creates persistent editor workspace layout and mode state.
 *
 * @param set - Zustand state setter.
 * @returns Editor workspace slice.
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
		previewOpen: true,
		previewWidth: 40,
		rightPanelOpen: true,
		rightPanelWidth: 360,
		surface: "edit",
		setPreviewOpen: (previewOpen) =>
			set((state) => ({
				editorWorkspace: { ...state.editorWorkspace, previewOpen },
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
		setSurface: (surface) =>
			set((state) => ({
				editorWorkspace: { ...state.editorWorkspace, surface },
			})),
	},
});
