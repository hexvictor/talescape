import type { StateCreator } from "zustand/vanilla";
import type { TaleInspectorTarget } from "~/app/(tale-app)/_shared/types";
import type { TaleStudioState } from "../taleStudioStore";

export type StudioSelectionSlice = {
	studioSelection: {
		highlightedBranchId: string | null;
		hoveredBlockId: string | null;
		inspector: TaleInspectorTarget | null;
		inspectorControlsOpen: boolean;
		selectedBlockId: string | null;
		selectedBranchId: string | null;
		secondaryInspector: TaleInspectorTarget | null;
		closeInspector: () => void;
		closeSecondaryInspector: () => void;
		clearGraphSelection: () => void;
		openInspector: (target: TaleInspectorTarget) => void;
		openSecondaryInspector: (target: TaleInspectorTarget) => void;
		selectBlockForEditing: (blockId: string) => void;
		selectBranchForEditing: (branchId: string) => void;
		selectPathForEditing: (pathId: string) => void;
		setSelectedBlockId: (blockId: string | null) => void;
		setSelectedBranchId: (branchId: string | null) => void;
		setHighlightedBranchId: (branchId: string | null) => void;
		setHoveredBlockId: (blockId: string | null) => void;
		toggleInspectorControls: () => void;
	};
};

/**
 * Creates selection and inspector state shared by Studio workspaces.
 *
 * @returns Zustand slice creator for Studio selection state and actions.
 *
 * @example
 * const slice = createStudioSelectionSlice(set, get, api);
 */
export const createStudioSelectionSlice: StateCreator<
	TaleStudioState,
	[],
	[],
	StudioSelectionSlice
> = (set) => ({
	studioSelection: {
		highlightedBranchId: null,
		hoveredBlockId: null,
		inspector: null,
		inspectorControlsOpen: false,
		selectedBlockId: null,
		selectedBranchId: null,
		secondaryInspector: null,
		closeInspector: () =>
			set((state) => ({
				studioSelection: {
					...state.studioSelection,
					inspector: null,
					secondaryInspector: null,
				},
			})),
		clearGraphSelection: () =>
			set((state) => ({
				studioSelection: {
					...state.studioSelection,
					inspector: null,
					secondaryInspector: null,
					selectedBlockId: null,
					selectedBranchId: null,
				},
				editorGraph: { ...state.editorGraph, selectedPathId: null },
			})),
		openInspector: (inspector) =>
			set((state) => ({
				studioSelection: {
					...state.studioSelection,
					inspector,
					selectedBlockId:
						inspector.type === "block"
							? inspector.id
							: state.studioSelection.selectedBlockId,
					selectedBranchId:
						inspector.type === "block"
							? null
							: state.studioSelection.selectedBranchId,
					secondaryInspector: null,
				},
			})),
		closeSecondaryInspector: () =>
			set((state) => ({
				studioSelection: {
					...state.studioSelection,
					secondaryInspector: null,
				},
			})),
		openSecondaryInspector: (secondaryInspector) =>
			set((state) => ({
				studioSelection: { ...state.studioSelection, secondaryInspector },
			})),
		selectBlockForEditing: (blockId) =>
			set((state) => ({
				studioSelection: {
					...state.studioSelection,
					inspector: { id: blockId, type: "block" },
					secondaryInspector: null,
					selectedBlockId: blockId,
					selectedBranchId: null,
				},
				editorGraph: { ...state.editorGraph, selectedPathId: null },
			})),
		selectBranchForEditing: (selectedBranchId) =>
			set((state) => ({
				studioSelection: {
					...state.studioSelection,
					inspector: null,
					secondaryInspector: null,
					selectedBlockId: null,
					selectedBranchId,
				},
				editorGraph: { ...state.editorGraph, selectedPathId: null },
			})),
		selectPathForEditing: (selectedPathId) =>
			set((state) => ({
				studioSelection: {
					...state.studioSelection,
					inspector: null,
					secondaryInspector: null,
					selectedBlockId: null,
					selectedBranchId: null,
				},
				editorGraph: { ...state.editorGraph, selectedPathId },
			})),
		setHighlightedBranchId: (highlightedBranchId) =>
			set((state) => ({
				studioSelection: { ...state.studioSelection, highlightedBranchId },
			})),
		setHoveredBlockId: (hoveredBlockId) =>
			set((state) => ({
				studioSelection: { ...state.studioSelection, hoveredBlockId },
			})),
		setSelectedBlockId: (selectedBlockId) =>
			set((state) => ({
				studioSelection: { ...state.studioSelection, selectedBlockId },
			})),
		setSelectedBranchId: (selectedBranchId) =>
			set((state) => ({
				studioSelection: { ...state.studioSelection, selectedBranchId },
			})),
		toggleInspectorControls: () =>
			set((state) => ({
				studioSelection: {
					...state.studioSelection,
					inspectorControlsOpen: !state.studioSelection.inspectorControlsOpen,
				},
			})),
	},
});
