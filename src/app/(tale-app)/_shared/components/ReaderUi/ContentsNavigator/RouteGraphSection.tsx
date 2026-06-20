"use client";

import {
	Background,
	Controls,
	MiniMap,
	type Node,
	type NodeTypes,
	ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Expand, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { ResolvedTaleBranch, ResolvedTalePath } from "../../../types";
import { RouteGraphNode } from "./RouteGraphNode";
import {
	type RouteGraphEdge,
	type RouteGraphNodeData,
	compileRouteGraph,
} from "./compileRouteGraph";

const routeNodeTypes: NodeTypes = { route: RouteGraphNode };

type RouteGraphSectionProps = {
	branches: ResolvedTaleBranch[];
	currentBranchId: string | null;
	onChoosePath: (path: ResolvedTalePath) => void;
	onTravelToBlock: (blockId: string) => void;
	paths: ResolvedTalePath[];
	reachableBlockIds: Set<string>;
	reachableBranchIds: Set<string>;
	selectedBranchIds: string[];
};

/**
 * Renders the selected route chain and an expandable complete route graph.
 *
 * @param props - Branch graph data, reachability indexes, and navigation callbacks.
 * @returns Compact selected graph and optional full graph dialog.
 *
 * @example
 * <RouteGraphSection branches={branches} paths={paths} selectedBranchIds={ids} reachableBlockIds={blocks} reachableBranchIds={routeBranches} currentBranchId={branchId} onChoosePath={choose} onTravelToBlock={travel} />
 */
export function RouteGraphSection({
	branches,
	currentBranchId,
	onChoosePath,
	onTravelToBlock,
	paths,
	reachableBlockIds,
	reachableBranchIds,
	selectedBranchIds,
}: RouteGraphSectionProps): React.JSX.Element {
	const [expanded, setExpanded] = useState(false);
	const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
	const selectedIds = useMemo(
		() =>
			new Set([
				...branches
					.filter((branch) => branch.position.isRootBranch)
					.map((branch) => branch.id),
				...selectedBranchIds,
			]),
		[branches, selectedBranchIds],
	);
	const selectedBranches = branches.filter((branch) =>
		selectedIds.has(branch.id),
	);
	const selectedPaths = paths.filter(
		(path) =>
			path.type === "choice" &&
			selectedIds.has(path.fromBranchId) &&
			selectedIds.has(path.toBranchId),
	);
	const compactGraph = useMemo(
		() =>
			compileRouteGraph({
				branches: selectedBranches,
				currentBranchId,
				paths: selectedPaths,
				reachableBlockIds,
				reachableBranchIds,
				selectedBranchIds: selectedIds,
			}),
		[
			currentBranchId,
			reachableBlockIds,
			reachableBranchIds,
			selectedBranches,
			selectedIds,
			selectedPaths,
		],
	);
	const fullGraph = useMemo(
		() =>
			compileRouteGraph({
				branches,
				currentBranchId,
				paths,
				reachableBlockIds,
				reachableBranchIds,
				selectedBranchIds: selectedIds,
			}),
		[
			branches,
			currentBranchId,
			paths,
			reachableBlockIds,
			reachableBranchIds,
			selectedIds,
		],
	);
	const highlightedCompactEdges = highlightHoveredEdge(
		compactGraph.edges,
		hoveredEdgeId,
	);
	const highlightedFullEdges = highlightHoveredEdge(
		fullGraph.edges,
		hoveredEdgeId,
	);

	const handleNodeClick = (
		_event: React.MouseEvent,
		node: Node<RouteGraphNodeData>,
	): void => {
		if (!node.data.reachable) return;
		const blockId = node.data.branch.bounds.firstBlockId;
		if (blockId && reachableBlockIds.has(blockId)) onTravelToBlock(blockId);
	};
	const handleEdgeClick = (
		_event: React.MouseEvent,
		edge: RouteGraphEdge,
	): void => {
		if (edge.data?.reachable) onChoosePath(edge.data.path);
	};

	return (
		<section
			data-reader-component="RouteGraphSection"
			data-reader-role="selected-route-graph"
			className="overflow-hidden rounded-md border border-white/10 bg-white/[0.025]"
		>
			<header className="flex items-center justify-between gap-3 border-white/8 border-b px-3 py-2">
				<div>
					<p className="font-semibold text-white/78 text-xs">Chosen route</p>
					<p className="text-[10px] text-white/36">
						{selectedBranches.length} connected branches
					</p>
				</div>
				<button
					type="button"
					aria-label="Open complete route graph"
					className="grid h-8 w-8 place-items-center rounded border border-white/10 text-white/48 hover:bg-white/8 hover:text-white"
					onClick={() => setExpanded(true)}
				>
					<Expand size={13} />
				</button>
			</header>
			<div className="h-48">
				<ReactFlow
					colorMode="dark"
					edges={highlightedCompactEdges}
					fitView
					fitViewOptions={{ padding: 0.3 }}
					nodes={compactGraph.nodes}
					nodeTypes={routeNodeTypes}
					nodesConnectable={false}
					nodesDraggable={false}
					panOnDrag={false}
					proOptions={{ hideAttribution: true }}
					zoomOnDoubleClick={false}
					zoomOnPinch={false}
					zoomOnScroll={false}
					onEdgeClick={handleEdgeClick}
					onEdgeMouseEnter={(_, edge) => setHoveredEdgeId(edge.id)}
					onEdgeMouseLeave={() => setHoveredEdgeId(null)}
					onNodeClick={handleNodeClick}
				>
					<Background color="rgba(255,255,255,0.08)" gap={20} size={1} />
				</ReactFlow>
			</div>
			{expanded ? (
				<div
					data-reader-component="RouteGraphSection"
					data-reader-role="complete-route-graph-dialog"
					className="fixed inset-1 z-100 overflow-hidden rounded-lg border border-white/14 bg-[#090909]/98 shadow-2xl sm:inset-2"
				>
					<header className="flex items-center justify-between border-white/10 border-b px-4 py-3">
						<div>
							<p className="font-semibold text-sm text-white/88">
								Complete route graph
							</p>
							<p className="text-[11px] text-white/38">
								Current choices are colored; unavailable routes are dimmed
							</p>
						</div>
						<button
							type="button"
							aria-label="Close route graph"
							className="grid h-9 w-9 place-items-center rounded border border-white/10 text-white/52 hover:bg-white/8 hover:text-white"
							onClick={() => setExpanded(false)}
						>
							<X size={16} />
						</button>
					</header>
					<div className="h-[calc(100%-4rem)]">
						<ReactFlow
							colorMode="dark"
							edges={highlightedFullEdges}
							fitView
							fitViewOptions={{ padding: 0.18 }}
							minZoom={0.2}
							nodes={fullGraph.nodes}
							nodeTypes={routeNodeTypes}
							nodesConnectable={false}
							proOptions={{ hideAttribution: true }}
							onEdgeClick={handleEdgeClick}
							onEdgeMouseEnter={(_, edge) => setHoveredEdgeId(edge.id)}
							onEdgeMouseLeave={() => setHoveredEdgeId(null)}
							onNodeClick={handleNodeClick}
						>
							<Background color="rgba(255,255,255,0.08)" gap={24} size={1} />
							<MiniMap
								nodeColor={(node) =>
									node.data?.current
										? "#59c3ff"
										: node.data?.selected
											? "#d9b56f"
											: "#454545"
								}
								maskColor="rgba(0,0,0,0.72)"
							/>
							<Controls showInteractive={false} />
						</ReactFlow>
					</div>
				</div>
			) : null}
		</section>
	);
}

/**
 * Emphasizes one hovered edge while preserving compiled reachability styles.
 *
 * @param edges - Compiled graph edges.
 * @param hoveredEdgeId - Currently hovered edge identifier.
 * @returns Edges with hover-specific width and opacity.
 */
function highlightHoveredEdge(
	edges: RouteGraphEdge[],
	hoveredEdgeId: string | null,
): RouteGraphEdge[] {
	if (!hoveredEdgeId) return edges;
	return edges.map((edge) =>
		edge.id === hoveredEdgeId
			? {
					...edge,
					labelStyle: {
						...edge.labelStyle,
						fill: "#ffffff",
						fontWeight: 800,
					},
					style: {
						...edge.style,
						opacity: 1,
						strokeWidth: 4,
					},
				}
			: {
					...edge,
					style: { ...edge.style, opacity: 0.16 },
				},
	);
}
