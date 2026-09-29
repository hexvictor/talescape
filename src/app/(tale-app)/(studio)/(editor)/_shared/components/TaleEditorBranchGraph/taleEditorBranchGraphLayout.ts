import ELK, { type ElkNode } from "elkjs/lib/elk.bundled.js";
import type {
	EditorGraphDirection,
	GraphPosition,
} from "~/app/(tale-app)/(studio)/_shared/store/editorGraphTypes";
import type {
	ResolvedTaleBranch,
	ResolvedTaleScene,
} from "~/app/(tale-app)/_shared/types";

const elk = new ELK();

/**
 * Calculates branch node positions with an ELK layered tree layout.
 *
 * @param options - Layout source data.
 * @param options.branches - Visible branch nodes.
 * @param options.scenes - Tale scenes used to estimate expanded node height.
 * @param options.collapsedBranchIds - Branches hiding their descendants.
 * @param options.expandedBranchIds - Branches showing their block lists.
 * @param options.graphDirection - Horizontal or vertical graph orientation.
 * @param options.requestRevision - Explicit layout reset revision.
 * @returns Branch positions keyed by branch id.
 *
 * @example
 * const positions = await layoutTaleEditorBranchGraph(options);
 */
export async function layoutTaleEditorBranchGraph({
	branches,
	scenes,
	collapsedBranchIds,
	expandedBranchIds,
	graphDirection,
	requestRevision,
}: {
	branches: ResolvedTaleBranch[];
	scenes: ResolvedTaleScene[];
	collapsedBranchIds: Set<string>;
	expandedBranchIds: Set<string>;
	graphDirection: EditorGraphDirection;
	requestRevision: number;
}): Promise<Record<string, GraphPosition>> {
	const collapsedIds = toStringSet(collapsedBranchIds);
	const expandedIds = toStringSet(expandedBranchIds);
	const sceneCountByBranchId = new Map<string, number>();
	for (const block of scenes) {
		sceneCountByBranchId.set(
			block.branchId,
			(sceneCountByBranchId.get(block.branchId) ?? 0) + 1,
		);
	}
	const graph: ElkNode = {
		id: `tale-editor-branch-graph-${requestRevision}`,
		layoutOptions: {
			"elk.algorithm": "layered",
			"elk.direction": graphDirection === "horizontal" ? "RIGHT" : "DOWN",
			"elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
			"elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
			"elk.layered.spacing.nodeNodeBetweenLayers": "130",
			"elk.spacing.edgeEdge": "28",
			"elk.spacing.edgeNode": "42",
			"elk.spacing.nodeNode": "74",
		},
		children: [...branches].sort(compareBranchesForTreeLayout).map((branch) => {
			const size = getBranchEditorNodeSize({
				sceneCount: sceneCountByBranchId.get(branch.id) ?? 0,
				descendantsCollapsed: collapsedIds.has(branch.id),
				expanded: expandedIds.has(branch.id) && !collapsedIds.has(branch.id),
			});
			return { height: size.height, id: branch.id, width: size.width };
		}),
		edges: branches.flatMap((branch) =>
			branch.parentBranchId
				? [
						{
							id: `hierarchy-${branch.parentBranchId}-${branch.id}`,
							sources: [branch.parentBranchId],
							targets: [branch.id],
						},
					]
				: [],
		),
	};
	const layout = await elk.layout(graph);
	return Object.fromEntries(
		(layout.children ?? []).map((child) => [
			child.id,
			{ x: child.x ?? 0, y: child.y ?? 0 },
		]),
	);
}

/**
 * Finds descendants hidden by collapsed branch nodes.
 *
 * @param branches - Complete branch collection.
 * @param collapsedBranchIds - Branches whose descendants are collapsed.
 * @returns Hidden descendant branch ids.
 *
 * @example
 * const hidden = getHiddenDescendantBranchIds(branches, collapsedIds);
 */
export function getHiddenDescendantBranchIds(
	branches: ResolvedTaleBranch[],
	collapsedBranchIds: Set<string>,
): Set<string> {
	const childIdsByParentId = new Map<string, string[]>();
	for (const branch of branches) {
		if (!branch.parentBranchId) continue;
		const childIds = childIdsByParentId.get(branch.parentBranchId) ?? [];
		childIds.push(branch.id);
		childIdsByParentId.set(branch.parentBranchId, childIds);
	}
	const hiddenBranchIds = new Set<string>();
	const pendingParentIds = [...toStringSet(collapsedBranchIds)];
	while (pendingParentIds.length > 0) {
		const parentId = pendingParentIds.pop();
		if (!parentId) continue;
		for (const childId of childIdsByParentId.get(parentId) ?? []) {
			if (hiddenBranchIds.has(childId)) continue;
			hiddenBranchIds.add(childId);
			pendingParentIds.push(childId);
		}
	}
	return hiddenBranchIds;
}

function toStringSet(value: unknown): Set<string> {
	if (value instanceof Set) return value;
	if (Array.isArray(value))
		return new Set(
			value.filter((item): item is string => typeof item === "string"),
		);
	return new Set();
}

/**
 * Calculates a branch depth from parent relationships.
 *
 * @param branch - Branch whose depth should be resolved.
 * @param branchById - Branch lookup by id.
 * @returns Zero-based branch depth.
 *
 * @example
 * const depth = getBranchDepth(branch, branchById);
 */
export function getBranchDepth(
	branch: ResolvedTaleBranch,
	branchById: Map<string, ResolvedTaleBranch>,
): number {
	let depth = 0;
	let parentId = branch.parentBranchId;
	const visited = new Set<string>();
	while (parentId && !visited.has(parentId)) {
		visited.add(parentId);
		const parent = branchById.get(parentId);
		if (!parent) break;
		depth += 1;
		parentId = parent.parentBranchId;
	}
	return depth;
}

/**
 * Estimates one branch node size for ELK layout.
 *
 * @param options - Node size inputs.
 * @returns Estimated node dimensions.
 *
 * @example
 * const size = getBranchEditorNodeSize({ sceneCount: 4, expanded: true, descendantsCollapsed: false });
 */
function getBranchEditorNodeSize({
	sceneCount,
	descendantsCollapsed,
	expanded,
}: {
	sceneCount: number;
	descendantsCollapsed: boolean;
	expanded: boolean;
}): { height: number; width: number } {
	if (descendantsCollapsed) return { height: 88, width: 248 };
	if (!expanded) return { height: 128, width: 288 };
	return { height: Math.min(390, 128 + sceneCount * 42), width: 288 };
}

/**
 * Sorts roots first and preserves authored sibling order.
 *
 * @param first - First branch.
 * @param second - Second branch.
 * @returns Numeric branch order.
 */
function compareBranchesForTreeLayout(
	first: ResolvedTaleBranch,
	second: ResolvedTaleBranch,
): number {
	if (first.parentBranchId === null && second.parentBranchId !== null)
		return -1;
	if (first.parentBranchId !== null && second.parentBranchId === null) return 1;
	if (first.parentBranchId === second.parentBranchId) {
		return first.order - second.order;
	}
	return first.position.index - second.position.index;
}
