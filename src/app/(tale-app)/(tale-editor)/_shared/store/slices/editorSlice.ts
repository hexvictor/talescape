import type { StateCreator } from "zustand/vanilla";
import type { TaleInspectorTarget } from "~/app/(tale-app)/_shared/types";
import type { TaleEditorState } from "../taleEditorStore";

export type EditorSlice = {
	editor: {
		highlightedBranchId: string | null;
		hoveredBlockId: string | null;
		inspector: TaleInspectorTarget | null;
		inspectorControlsOpen: boolean;
		selectedBlockId: string | null;
		selectedBranchId: string | null;
		secondaryInspector: TaleInspectorTarget | null;
		closeInspector: () => void;
		closeSecondaryInspector: () => void;
		openInspector: (target: TaleInspectorTarget) => void;
		openSecondaryInspector: (target: TaleInspectorTarget) => void;
		setSelectedBlockId: (blockId: string | null) => void;
		setSelectedBranchId: (branchId: string | null) => void;
		setHighlightedBranchId: (branchId: string | null) => void;
		setHoveredBlockId: (blockId: string | null) => void;
		toggleInspectorControls: () => void;
	};
};

/**
 * Creates state used only while authoring a tale.
 *
 * @returns Zustand slice creator for editor-only state and actions.
 *
 * @example
 * const slice = createEditorSlice(set, get, api);
 */
export const createEditorSlice: StateCreator<
	TaleEditorState,
	[],
	[],
	EditorSlice
> = (set) => ({
	editor: {
		highlightedBranchId: null,
		hoveredBlockId: null,
		inspector: null,
		inspectorControlsOpen: true,
		selectedBlockId: null,
		selectedBranchId: null,
		secondaryInspector: null,
		closeInspector: () =>
			set((state) => ({
				editor: {
					...state.editor,
					inspector: null,
					secondaryInspector: null,
				},
			})),
		openInspector: (inspector) =>
			set((state) => ({
				editor: {
					...state.editor,
					inspector,
					selectedBlockId:
						inspector.type === "block"
							? inspector.id
							: state.editor.selectedBlockId,
					selectedBranchId:
						inspector.type === "block"
							? (state.tale.data.indexMap.blocksById[inspector.id]?.branchId ??
								state.editor.selectedBranchId)
							: state.editor.selectedBranchId,
					secondaryInspector: null,
				},
			})),
		closeSecondaryInspector: () =>
			set((state) => ({
				editor: { ...state.editor, secondaryInspector: null },
			})),
		openSecondaryInspector: (secondaryInspector) =>
			set((state) => ({
				editor: { ...state.editor, secondaryInspector },
			})),
		setHighlightedBranchId: (highlightedBranchId) =>
			set((state) => ({
				editor: { ...state.editor, highlightedBranchId },
			})),
		setHoveredBlockId: (hoveredBlockId) =>
			set((state) => ({
				editor: { ...state.editor, hoveredBlockId },
			})),
		setSelectedBlockId: (selectedBlockId) =>
			set((state) => ({
				editor: { ...state.editor, selectedBlockId },
			})),
		setSelectedBranchId: (selectedBranchId) =>
			set((state) => ({
				editor: { ...state.editor, selectedBranchId },
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
