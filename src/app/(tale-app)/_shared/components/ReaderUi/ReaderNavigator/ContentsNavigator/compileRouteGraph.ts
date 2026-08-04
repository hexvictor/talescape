import { type Edge, MarkerType, type Node } from "@xyflow/react";
import type { ResolvedTaleBranch, ResolvedTalePath } from "../../../../types";

const currentOptionColors = [
	"#59c3ff",
	"#8ee38f",
	"#f29bd4",
	"#f5bd6a",
	"#b6a0ff",
] as const;

export type RouteGraphNodeData = {
	branch: ResolvedTaleBranch;
	current: boolean;
	incomingPathIds: string[];
	label: string;
	outgoingPathIds: string[];
	reachable: boolean;
	selected: boolean;
};

export type RouteGraphEdgeData = {
	path: ResolvedTalePath;
	reachable: boolean;
};

export type RouteGraphNode = Node<RouteGraphNodeData, "route">;
export type RouteGraphEdge = Edge<RouteGraphEdgeData>;

type CompileRouteGraphOptions = {
	branches: ResolvedTaleBranch[];
	currentBranchId: string | null;
	paths: ResolvedTalePath[];
	reachableBlockIds: Set<string>;
	reachableBranchIds: Set<string>;
	selectedBranchIds: Set<string>;
};

/**
 * Compiles a route graph with path-specific handles and spaced branch columns.
 *
 * @param options - Branches, paths, current route, and reachability indexes.
 * @returns React Flow nodes and edges ready for rendering.
 *
 * @example
 * const graph = compileRouteGraph({ branches, paths, currentBranchId, reachableBlockIds, reachableBranchIds, selectedBranchIds });
 */
export function compileRouteGraph({
	branches,
	currentBranchId,
	paths,
	reachableBlockIds,
	reachableBranchIds,
	selectedBranchIds,
}: CompileRouteGraphOptions): {
	edges: RouteGraphEdge[];
	nodes: RouteGraphNode[];
} {
	const branchById = new Map(branches.map((branch) => [branch.id, branch]));
	const availableBranchIds = new Set(branchById.keys());
	const graphPaths = paths.filter(
		(path) =>
			availableBranchIds.has(path.fromBranchId) &&
			availableBranchIds.has(path.toBranchId),
	);
	const incomingByBranchId = groupPathIds(graphPaths, "toBranchId");
	const outgoingByBranchId = groupPathIds(graphPaths, "fromBranchId");
	const rowsByDepth = new Map<number, number>();
	const currentOptions = graphPaths.filter(
		(path) =>
			path.fromBranchId === currentBranchId &&
			reachableBlockIds.has(path.fromBlockId),
	);
	const currentOptionColorByPathId = new Map(
		currentOptions.map(
			(path, index) =>
				[
					path.id,
					currentOptionColors[index % currentOptionColors.length],
				] as const,
		),
	);

	const nodes = branches.map((branch): RouteGraphNode => {
		const depth = getBranchDepth(branch, branchById);
		const row = rowsByDepth.get(depth) ?? 0;
		rowsByDepth.set(depth, row + 1);
		return {
			data: {
				branch,
				current: branch.id === currentBranchId,
				incomingPathIds: incomingByBranchId.get(branch.id) ?? [],
				label: branch.title,
				outgoingPathIds: outgoingByBranchId.get(branch.id) ?? [],
				reachable: reachableBranchIds.has(branch.id),
				selected: selectedBranchIds.has(branch.id),
			},
			id: branch.id,
			position: { x: depth * 320, y: row * 145 },
			type: "route",
			zIndex: 2,
		};
	});

	const edges = graphPaths.map((path): RouteGraphEdge => {
		const reachable = reachableBlockIds.has(path.fromBlockId);
		const selected =
			selectedBranchIds.has(path.fromBranchId) &&
			selectedBranchIds.has(path.toBranchId);
		const currentOptionColor = currentOptionColorByPathId.get(path.id);
		const color = currentOptionColor ?? (selected ? "#d9b56f" : "#777");
		return {
			animated: selected || currentOptionColor !== undefined,
			data: { path, reachable },
			id: path.id,
			interactionWidth: 24,
			label: path.label,
			labelBgPadding: [5, 3],
			labelBgStyle: {
				fill: "#090909",
				fillOpacity: 0.9,
			},
			labelStyle: {
				fill: reachable ? color : "rgba(255,255,255,0.25)",
				fontSize: 9,
				fontWeight: currentOptionColor ? 700 : 500,
			},
			markerEnd: {
				color: reachable ? color : "#4b4b4b",
				type: MarkerType.ArrowClosed,
			},
			source: path.fromBranchId,
			sourceHandle: path.id,
			style: {
				opacity: reachable ? 0.85 : 0.2,
				stroke: color,
				strokeWidth: currentOptionColor ? 2.5 : selected ? 2 : 1.25,
			},
			target: path.toBranchId,
			targetHandle: path.id,
			type: "smoothstep",
			zIndex: 1,
		};
	});

	return { edges, nodes };
}

/**
 * Groups path identifiers by one branch endpoint.
 *
 * @param paths - Paths to index.
 * @param endpoint - Branch endpoint used as the map key.
 * @returns Path identifiers grouped by branch id.
 */
function groupPathIds(
	paths: ResolvedTalePath[],
	endpoint: "fromBranchId" | "toBranchId",
): Map<string, string[]> {
	const grouped = new Map<string, string[]>();
	for (const path of paths) {
		const branchId = path[endpoint];
		const pathIds = grouped.get(branchId) ?? [];
		pathIds.push(path.id);
		grouped.set(branchId, pathIds);
	}
	return grouped;
}

/**
 * Resolves branch nesting depth through parent relationships.
 *
 * @param branch - Branch whose depth is needed.
 * @param branchById - Branch lookup map.
 * @returns Zero-based branch depth.
 */
function getBranchDepth(
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
