import type { StateCreator } from "zustand/vanilla";
import type { TaleStudioState } from "../taleStudioStore";

export type EditorLayoutSlice = {
	editorLayout: {
		activeLeftPanel: "assets" | "narrative" | "settings" | "tree" | null;
		autoSelectTarget: "frame" | "off" | "scene";
		graphOpen: boolean;
		livePreviewOpen: boolean;
		livePreviewWidth: number;
		rightPanelOpen: boolean;
		rightPanelWidth: number;
		setActiveLeftPanel: (
			panel: "assets" | "narrative" | "settings" | "tree" | null,
		) => void;
		setAutoSelectTarget: (target: "frame" | "off" | "scene") => void;
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
		activeLeftPanel: null,
		autoSelectTarget: "off",
		graphOpen: true,
		livePreviewOpen: true,
		livePreviewWidth: 40,
		rightPanelOpen: false,
		rightPanelWidth: 360,
		setActiveLeftPanel: (activeLeftPanel) =>
			set((state) => ({
				editorLayout: { ...state.editorLayout, activeLeftPanel },
			})),
		setAutoSelectTarget: (autoSelectTarget) =>
			set((state) => ({
				editorLayout: {
					...state.editorLayout,
					autoSelectTarget,
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
