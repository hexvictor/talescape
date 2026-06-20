import type { StateCreator } from "zustand/vanilla";
import type {
	EditorEdgeType,
	EditorGraphDirection,
	EditorPathType,
	GraphPosition,
	PathVisibilityMode,
} from "../editorStoreTypes";
import type { TaleEditorState } from "../taleEditorStore";

const allPathTypes: EditorPathType[] = [
	"choice",
	"convergence",
	"ending",
	"return",
	"teleport",
];

export type EditorGraphSlice = {
	editorGraph: {
		branchPositions: Record<string, GraphPosition>;
		collapsedBranchIds: Set<string>;
		edgeType: EditorEdgeType;
		expandedBranchIds: Set<string>;
		graphDirection: EditorGraphDirection;
		layoutRequestRevision: number;
		pathVisibilityMode: PathVisibilityMode;
		selectedPathId: string | null;
		visiblePathTypes: Set<EditorPathType>;
		expandBlocks: (branchId: string) => void;
		resetLayout: () => void;
		setBranchPosition: (branchId: string, position: GraphPosition) => void;
		setEdgeType: (edgeType: EditorEdgeType) => void;
		setGraphDirection: (direction: EditorGraphDirection) => void;
		setPathVisibilityMode: (mode: PathVisibilityMode) => void;
		setSelectedPathId: (pathId: string | null) => void;
		setVisiblePathTypes: (types: Set<EditorPathType>) => void;
		toggleBlocks: (branchId: string) => void;
		toggleDescendants: (branchId: string) => void;
	};
};

/**
 * Creates editor graph layout, filtering, and branch visibility state.
 *
 * @param set - Zustand state setter.
 * @returns Editor graph slice.
 *
 * @example
 * const slice = createEditorGraphSlice(set, get, api);
 */
export const createEditorGraphSlice: StateCreator<
	TaleEditorState,
	[],
	[],
	EditorGraphSlice
> = (set) => ({
	editorGraph: {
		branchPositions: {},
		collapsedBranchIds: new Set(),
		edgeType: "smoothstep",
		expandedBranchIds: new Set(),
		graphDirection: "horizontal",
		layoutRequestRevision: 0,
		pathVisibilityMode: "all",
		selectedPathId: null,
		visiblePathTypes: new Set(allPathTypes),
		expandBlocks: (branchId) =>
			set((state) => ({
				editorGraph: {
					...state.editorGraph,
					expandedBranchIds: new Set(state.editorGraph.expandedBranchIds).add(
						branchId,
					),
				},
			})),
		resetLayout: () =>
			set((state) => ({
				editorGraph: {
					...state.editorGraph,
					branchPositions: {},
					layoutRequestRevision: state.editorGraph.layoutRequestRevision + 1,
				},
			})),
		setBranchPosition: (branchId, position) =>
			set((state) => ({
				editorGraph: {
					...state.editorGraph,
					branchPositions: {
						...state.editorGraph.branchPositions,
						[branchId]: position,
					},
				},
			})),
		setEdgeType: (edgeType) =>
			set((state) => ({
				editorGraph: { ...state.editorGraph, edgeType },
			})),
		setGraphDirection: (graphDirection) =>
			set((state) => ({
				editorGraph: { ...state.editorGraph, graphDirection },
			})),
		setPathVisibilityMode: (pathVisibilityMode) =>
			set((state) => ({
				editorGraph: { ...state.editorGraph, pathVisibilityMode },
			})),
		setSelectedPathId: (selectedPathId) =>
			set((state) => ({
				editorGraph: { ...state.editorGraph, selectedPathId },
			})),
		setVisiblePathTypes: (visiblePathTypes) =>
			set((state) => ({
				editorGraph: { ...state.editorGraph, visiblePathTypes },
			})),
		toggleBlocks: (branchId) =>
			set((state) => ({
				editorGraph: {
					...state.editorGraph,
					expandedBranchIds: toggleSetValue(
						state.editorGraph.expandedBranchIds,
						branchId,
					),
				},
			})),
		toggleDescendants: (branchId) =>
			set((state) => ({
				editorGraph: {
					...state.editorGraph,
					collapsedBranchIds: toggleSetValue(
						state.editorGraph.collapsedBranchIds,
						branchId,
					),
				},
			})),
	},
});

/**
 * Toggles one string inside an immutable set.
 *
 * @param values - Current set.
 * @param value - Value to add or remove.
 * @returns New set with the value toggled.
 *
 * @example
 * const next = toggleSetValue(current, branchId);
 */
function toggleSetValue(values: Set<string>, value: string): Set<string> {
	const next = new Set(values);
	if (next.has(value)) next.delete(value);
	else next.add(value);
	return next;
}
