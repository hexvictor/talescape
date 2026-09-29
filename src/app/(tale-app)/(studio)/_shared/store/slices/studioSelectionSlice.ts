import type { StateCreator } from "zustand/vanilla";
import type { TaleInspectorTarget } from "~/app/(tale-app)/_shared/types";
import type { TaleStudioState } from "../taleStudioStore";

export type StudioSelectionSlice = {
	studioSelection: {
		highlightedBranchId: string | null;
		hoveredSceneId: string | null;
		inspector: TaleInspectorTarget | null;
		inspectorControlsOpen: boolean;
		inspectorTabMemory: Partial<Record<TaleInspectorTarget["type"], string>>;
		selectedSceneId: string | null;
		selectedBranchId: string | null;
		secondaryInspector: TaleInspectorTarget | null;
		closeInspector: () => void;
		closeSecondaryInspector: () => void;
		clearGraphSelection: () => void;
		openInspector: (target: TaleInspectorTarget) => void;
		openSecondaryInspector: (target: TaleInspectorTarget) => void;
		rememberInspectorTab: (
			type: TaleInspectorTarget["type"],
			tab: string,
		) => void;
		selectSceneForEditing: (sceneId: string) => void;
		selectBranchForEditing: (branchId: string) => void;
		selectPathForEditing: (pathId: string) => void;
		setSelectedSceneId: (sceneId: string | null) => void;
		setSelectedBranchId: (branchId: string | null) => void;
		setHighlightedBranchId: (branchId: string | null) => void;
		setHoveredSceneId: (sceneId: string | null) => void;
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
		hoveredSceneId: null,
		inspector: null,
		inspectorControlsOpen: false,
		inspectorTabMemory: {},
		selectedSceneId: null,
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
					selectedSceneId: null,
					selectedBranchId: null,
				},
				editorGraph: { ...state.editorGraph, selectedPathId: null },
			})),
		openInspector: (target) =>
			set((state) => {
				const rememberedTab =
					state.studioSelection.inspectorTabMemory[target.type];
				const inspector =
					"initialTab" in target || !rememberedTab
						? target
						: ({ ...target, initialTab: rememberedTab } as TaleInspectorTarget);
				return {
					studioSelection: {
						...state.studioSelection,
						inspector,
						selectedSceneId:
							inspector.type === "scene"
								? inspector.id
								: state.studioSelection.selectedSceneId,
						selectedBranchId:
							inspector.type === "scene"
								? null
								: state.studioSelection.selectedBranchId,
						secondaryInspector: null,
					},
				};
			}),
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
		rememberInspectorTab: (type, tab) =>
			set((state) => ({
				studioSelection: {
					...state.studioSelection,
					inspectorTabMemory: {
						...state.studioSelection.inspectorTabMemory,
						[type]: tab,
					},
				},
			})),
		selectSceneForEditing: (sceneId) =>
			set((state) => ({
				studioSelection: {
					...state.studioSelection,
					inspector: { id: sceneId, type: "scene" },
					secondaryInspector: null,
					selectedSceneId: sceneId,
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
					selectedSceneId: null,
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
					selectedSceneId: null,
					selectedBranchId: null,
				},
				editorGraph: { ...state.editorGraph, selectedPathId },
			})),
		setHighlightedBranchId: (highlightedBranchId) =>
			set((state) => ({
				studioSelection: { ...state.studioSelection, highlightedBranchId },
			})),
		setHoveredSceneId: (hoveredSceneId) =>
			set((state) => ({
				studioSelection: { ...state.studioSelection, hoveredSceneId },
			})),
		setSelectedSceneId: (selectedSceneId) =>
			set((state) => ({
				studioSelection: { ...state.studioSelection, selectedSceneId },
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
