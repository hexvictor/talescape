import type { StateCreator } from "zustand/vanilla";
import type { TaleStudioState } from "../taleStudioStore";

export type EditorLayoutSlice = {
	editorLayout: {
		autoSelectActiveBlock: boolean;
		graphOpen: boolean;
		livePreviewOpen: boolean;
		livePreviewWidth: number;
		rightPanelOpen: boolean;
		rightPanelWidth: number;
		setAutoSelectActiveBlock: (enabled: boolean) => void;
		setGraphOpen: (open: boolean) => void;
		setLivePreviewOpen: (open: boolean) => void;
		setLivePreviewWidth: (width: number) => void;
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
 * const slice = createEditorLayoutSlice(set, get, api);
 */
export const createEditorLayoutSlice: StateCreator<
	TaleStudioState,
	[],
	[],
	EditorLayoutSlice
> = (set) => ({
	editorLayout: {
		autoSelectActiveBlock: false,
		graphOpen: true,
		livePreviewOpen: true,
		livePreviewWidth: 40,
		rightPanelOpen: false,
		rightPanelWidth: 360,
		setAutoSelectActiveBlock: (autoSelectActiveBlock) =>
			set((state) => ({
				editorLayout: {
					...state.editorLayout,
					autoSelectActiveBlock,
				},
			})),
		setGraphOpen: (graphOpen) =>
			set((state) => ({
				editorLayout: { ...state.editorLayout, graphOpen },
			})),
		setLivePreviewOpen: (livePreviewOpen) =>
			set((state) => ({
				editorLayout: { ...state.editorLayout, livePreviewOpen },
			})),
		setLivePreviewWidth: (livePreviewWidth) =>
			set((state) => ({
				editorLayout: { ...state.editorLayout, livePreviewWidth },
			})),
		setRightPanelOpen: (rightPanelOpen) =>
			set((state) => ({
				editorLayout: { ...state.editorLayout, rightPanelOpen },
			})),
		setRightPanelWidth: (rightPanelWidth) =>
			set((state) => ({
				editorLayout: { ...state.editorLayout, rightPanelWidth },
			})),
	},
});
