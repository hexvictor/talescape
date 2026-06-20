"use client";

import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	Background,
	type Connection,
	Controls,
	type Edge,
	Handle,
	MarkerType,
	MiniMap,
	type Node,
	type NodeProps,
	Position,
	ReactFlow,
	type ReactFlowInstance,
	useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
	ChevronDown,
	ChevronRight,
	GitBranch,
	GripVertical,
	LocateFixed,
	Plus,
	RefreshCcw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	useTaleEditorStore,
	useTaleEditorStoreShallow,
} from "../../hooks/useTaleEditorStore";
import type {
	GraphPosition,
	PathVisibilityMode,
} from "../../store/editorStoreTypes";
import {
	addDraftBlock,
	addDraftBranch,
	connectDraftBranches,
	moveBlockInTale,
	reconnectDraftPath,
} from "~/app/(tale-app)/(tale-editor)/_shared/services/taleDraftEdits";
import type {
	ResolvedTaleBlock,
	ResolvedTaleBranch,
	TalePath,
} from "~/app/(tale-app)/_shared/types";
import {
	type PathEditorEdge,
	TaleBranchGraphEdge,
	getPathStrokeColor,
} from "./TaleBranchGraphEdge";
import {
	getBranchDepth,
	getHiddenDescendantBranchIds,
	layoutTaleBranchGraph,
} from "./taleBranchGraphLayout";

type PathType = TalePath["type"];

type BranchEditorNodeData = {
	active: boolean;
	branch: ResolvedTaleBranch;
	blocks: ResolvedTaleBlock[];
	blocksExpanded: boolean;
	descendantsCollapsed: boolean;
	hasDescendants: boolean;
	hasSelectedBlock: boolean;
	activeBlockId: string | null;
	graphDirection: "horizontal" | "vertical";
	incomingPaths: TalePath[];
	onAddBlock: (branchId: string) => void;
	onHoverBlock: (blockId: string | null) => void;
	onHover: (branchId: string | null) => void;
	onSelectBlock: (blockId: string) => void;
	onSelectBranch: (branchId: string) => void;
	onToggleBlocks: (branchId: string) => void;
	onToggleDescendants: (branchId: string) => void;
	onTravelToBlock: (blockId: string) => void;
	outgoingPaths: TalePath[];
	selectedBlockId: string | null;
	selectedBranchId: string | null;
};

type BranchEditorNode = Node<BranchEditorNodeData, "branchEditor">;
type SortableBlockData = {
	branchId: string;
	index: number;
	type: "block";
};
type DroppableBranchData = {
	branchId: string;
	type: "branch";
};
const nodeTypes = { branchEditor: BranchEditorNodeView };
const edgeTypes = { pathEditor: TaleBranchGraphEdge };
const primaryPathTypes = new Set<PathType>(["choice", "convergence", "ending"]);

/**
 * Renders the branch/path graph used by the tale editor workspace.
 *
 * @param props - Graph props.
 * @param props.activeBranchId - Branch currently active in the preview/reader.
 * @param props.onHighlightBranch - Receives hovered branch id for preview emphasis.
 * @param props.onSelectBlock - Receives selected block id.
 * @param props.onSelectBranch - Receives selected branch id.
 * @param props.onClearSelection - Clears the current selected editor element.
 * @param props.onSelectPath - Receives selected path id.
 * @returns React Flow branch editor graph.
 *
 * @example
 * <TaleBranchGraph activeBranchId={branchId} onSelectBlock={selectBlock} onSelectBranch={selectBranch} onHighlightBranch={setBranch} />
 */
export function TaleBranchGraph({
	activeBranchId,
	onHighlightBranch,
	onClearSelection,
	onSelectBlock,
	onSelectBranch,
	onSelectPath,
	showActiveState,
}: {
	activeBranchId: string | null;
	onClearSelection: () => void;
	onHighlightBranch: (branchId: string | null) => void;
	onSelectBlock: (blockId: string) => void;
	onSelectBranch: (branchId: string) => void;
	onSelectPath: (pathId: string) => void;
	showActiveState: boolean;
}): React.JSX.Element {
	const tale = useTaleEditorStore((state) => state.tale.data);
	const setData = useTaleEditorStore((state) => state.tale.setData);
	const { selectedBlockId, selectedBranchId } = useTaleEditorStoreShallow(
		(state) => state.editor,
	);
	const activeBlockId = useTaleEditorStore((state) =>
		showActiveState ? (state.navigation.current?.blockId ?? null) : null,
	);
	const highlightedBranchId = useTaleEditorStore(
		(state) => state.editor.highlightedBranchId,
	);
	const setHoveredBlockId = useTaleEditorStore(
		(state) => state.editor.setHoveredBlockId,
	);
	const scrollApi = useTaleEditorStore((state) => state.scroll.api);
	const {
		branchPositions,
		collapsedBranchIds,
		edgeType,
		expandBlocks,
		expandedBranchIds,
		graphDirection,
		layoutRequestRevision,
		pathVisibilityMode: visibilityMode,
		resetLayout,
		selectedPathId,
		setBranchPosition,
		toggleBlocks,
		toggleDescendants,
		visiblePathTypes,
	} = useTaleEditorStoreShallow((state) => state.editorGraph);
	const [layoutPositions, setLayoutPositions] = useState<
		Record<string, GraphPosition>
	>({});
	const flowInstanceRef = useRef<
		ReactFlowInstance<BranchEditorNode, PathEditorEdge> | undefined
	>(undefined);
	const [draggedBlock, setDraggedBlock] = useState<ResolvedTaleBlock | null>(
		null,
	);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 6 },
		}),
	);
	const hiddenBranchIds = useMemo(
		() =>
			getHiddenDescendantBranchIds(tale.structure.branches, collapsedBranchIds),
		[collapsedBranchIds, tale.structure.branches],
	);
	const graphBranches = useMemo(
		() =>
			tale.structure.branches.filter(
				(branch) => !hiddenBranchIds.has(branch.id),
			),
		[hiddenBranchIds, tale.structure.branches],
	);
	const graphBranchIds = useMemo(
		() => new Set(graphBranches.map((branch) => branch.id)),
		[graphBranches],
	);
	const graphPaths = useMemo(
		() =>
			tale.structure.paths.filter(
				(path) =>
					graphBranchIds.has(path.fromBranchId) &&
					graphBranchIds.has(path.toBranchId),
			),
		[graphBranchIds, tale.structure.paths],
	);
	const handleAddBlock = useCallback(
		(branchId: string): void => {
			setData(addDraftBlock(tale, branchId), { reason: "editor-add-block" });
			expandBlocks(branchId);
		},
		[expandBlocks, setData, tale],
	);
	const handleAddBranch = useCallback((): void => {
		setData(addDraftBranch(tale), { reason: "editor-add-branch" });
	}, [setData, tale]);
	const handleConnect = useCallback(
		(connection: Connection): void => {
			if (!connection.source || !connection.target) return;
			setData(
				connectDraftBranches(tale, connection.source, connection.target),
				{
					reason: "editor-connect-branches",
				},
			);
		},
		[setData, tale],
	);
	const handleReconnect = useCallback(
		(edge: Edge, connection: Connection): void => {
			if (!connection.source || !connection.target) return;
			setData(
				reconnectDraftPath(tale, edge.id, connection.source, connection.target),
				{ reason: "editor-reconnect-path" },
			);
		},
		[setData, tale],
	);
	const handleDragStart = useCallback(
		(event: DragStartEvent): void => {
			setDraggedBlock(
				tale.indexMap.blocksById[String(event.active.id)] ?? null,
			);
		},
		[tale.indexMap.blocksById],
	);
	const handleDragEnd = useCallback(
		(event: DragEndEvent): void => {
			setDraggedBlock(null);
			if (!event.over) return;
			const activeData = event.active.data.current as
				| SortableBlockData
				| undefined;
			const overData = event.over.data.current as
				| SortableBlockData
				| DroppableBranchData
				| undefined;
			if (!activeData || !overData) return;
			const targetBranchId = overData.branchId;
			const targetBlocks = tale.structure.blocks
				.filter((block) => block.branchId === targetBranchId)
				.sort((first, second) => first.order - second.order);
			const targetIndex =
				overData.type === "block" ? overData.index : targetBlocks.length;
			if (
				activeData.branchId === targetBranchId &&
				activeData.index === targetIndex
			) {
				return;
			}
			setData(
				moveBlockInTale(
					tale,
					String(event.active.id),
					targetBranchId,
					targetIndex,
				),
				{ reason: "editor-move-block" },
			);
		},
		[setData, tale],
	);
	useEffect(() => {
		let cancelled = false;
		layoutTaleBranchGraph({
			branches: graphBranches,
			blocks: tale.structure.blocks,
			collapsedBranchIds,
			expandedBranchIds,
			graphDirection,
			requestRevision: layoutRequestRevision,
		})
			.then((positions) => {
				if (!cancelled) {
					setLayoutPositions(positions);
					window.requestAnimationFrame(() => {
						flowInstanceRef.current?.fitView({ duration: 280, padding: 0.18 });
					});
				}
			})
			.catch(() => {
				if (!cancelled) setLayoutPositions({});
			});
		return () => {
			cancelled = true;
		};
	}, [
		collapsedBranchIds,
		expandedBranchIds,
		graphBranches,
		graphDirection,
		layoutRequestRevision,
		tale.structure.blocks,
	]);

	const compiledGraph = useMemo(
		() =>
			compileBranchEditorGraph({
				activeBranchId: showActiveState ? activeBranchId : null,
				activeBlockId,
				branchPositions,
				branches: graphBranches,
				blocks: tale.structure.blocks,
				collapsedBranchIds,
				edgeType,
				expandedBranchIds,
				graphDirection,
				highlightedBranchId,
				layoutPositions,
				onAddBlock: handleAddBlock,
				onHoverBlock: setHoveredBlockId,
				onHover: onHighlightBranch,
				onSelectBlock,
				onSelectBranch,
				onToggleBlocks: toggleBlocks,
				onToggleDescendants: toggleDescendants,
				onTravelToBlock: (blockId) =>
					scrollApi?.scrollToBlock(blockId, { motion: "travel" }),
				paths: graphPaths,
				selectedBlockId,
				selectedBranchId,
				selectedPathId,
				visibilityMode,
				visiblePathTypes,
			}),
		[
			activeBranchId,
			activeBlockId,
			branchPositions,
			collapsedBranchIds,
			edgeType,
			expandedBranchIds,
			graphBranches,
			graphDirection,
			graphPaths,
			handleAddBlock,
			highlightedBranchId,
			layoutPositions,
			onHighlightBranch,
			onSelectBlock,
			onSelectBranch,
			scrollApi,
			selectedBranchId,
			selectedBlockId,
			selectedPathId,
			setHoveredBlockId,
			showActiveState,
			tale.structure.blocks,
			toggleBlocks,
			toggleDescendants,
			visibilityMode,
			visiblePathTypes,
		],
	);
	const [nodes, setNodes, onNodesChange] = useNodesState<BranchEditorNode>(
		compiledGraph.nodes,
	);
	const appliedLayoutPositionsRef = useRef(layoutPositions);
	useEffect(() => {
		const layoutChanged = appliedLayoutPositionsRef.current !== layoutPositions;
		setNodes((currentNodes) => {
			const currentNodeById = new Map(
				currentNodes.map((node) => [node.id, node]),
			);
			return compiledGraph.nodes.map((node) => {
				const currentNode = currentNodeById.get(node.id);
				return {
					...node,
					position:
						layoutChanged || !currentNode
							? node.position
							: currentNode.position,
				};
			});
		});
		appliedLayoutPositionsRef.current = layoutPositions;
	}, [compiledGraph.nodes, layoutPositions, setNodes]);

	return (
		<section
			data-reader-component="TaleBranchGraph"
			data-reader-role="branch-graph"
			className="relative h-full min-h-0 flex-1 overflow-hidden bg-[#18181b]"
		>
			<DndContext
				sensors={sensors}
				onDragEnd={handleDragEnd}
				onDragStart={handleDragStart}
			>
				<button
					type="button"
					data-reader-component="TaleBranchGraph"
					data-reader-role="add-branch-control"
					className="absolute top-3 right-3 z-20 flex h-9 items-center gap-2 rounded border border-white/12 bg-black/76 px-3 text-white/72 text-xs hover:bg-white/8 hover:text-white"
					onClick={handleAddBranch}
				>
					<Plus size={14} />
					Add Branch
				</button>
				<button
					type="button"
					data-reader-component="TaleBranchGraph"
					data-reader-role="reset-layout-control"
					className="absolute top-3 right-32 z-20 grid h-9 w-9 place-items-center rounded border border-white/12 bg-black/76 text-white/72 hover:bg-white/8 hover:text-white"
					title="Reorganize branches"
					onClick={resetLayout}
				>
					<RefreshCcw size={14} />
				</button>
				<ReactFlow<BranchEditorNode, PathEditorEdge>
					fitView
					edgesReconnectable
					edges={compiledGraph.edges}
					nodes={nodes}
					nodeDragThreshold={1}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					nodesDraggable
					onEdgeClick={(event, edge) => {
						event.stopPropagation();
						onSelectPath(edge.id);
					}}
					onConnect={handleConnect}
					onNodesChange={onNodesChange}
					onInit={(instance) => {
						flowInstanceRef.current = instance;
					}}
					onNodeDragStop={(_, node) =>
						setBranchPosition(node.id, node.position)
					}
					onNodeMouseEnter={(_, node) => onHighlightBranch(node.id)}
					onNodeMouseLeave={() => onHighlightBranch(null)}
					onPaneClick={onClearSelection}
					onReconnect={handleReconnect}
				>
					<Background color="rgba(255,255,255,0.16)" gap={24} />
					<Controls className="talescape-flow-controls [&_.react-flow__controls-button]:!border-white/10 [&_.react-flow__controls-button]:!bg-black [&_.react-flow__controls-button]:!text-white" />
					<MiniMap
						pannable
						zoomable
						bgColor="#050506"
						maskColor="rgba(217,181,111,0.16)"
						nodeBorderRadius={8}
						nodeColor={(node) =>
							node.id === selectedBranchId ? "#67e8f9" : "#d9b56f"
						}
						nodeStrokeColor={() => "#f8fafc"}
						nodeStrokeWidth={2}
						className="talescape-flow-minimap !bg-black/80"
					/>
				</ReactFlow>
				<DragOverlay>
					{draggedBlock ? <DraggedBlockOverlay block={draggedBlock} /> : null}
				</DragOverlay>
			</DndContext>
			<style jsx global>{`
				.talescape-flow-controls .react-flow__controls-button {
					background: #050506 !important;
					border-color: rgba(255, 255, 255, 0.16) !important;
					color: #f8fafc !important;
					fill: #f8fafc !important;
				}
				.talescape-flow-controls .react-flow__controls-button svg {
					color: #f8fafc !important;
					fill: #f8fafc !important;
					stroke: #f8fafc !important;
				}
				.talescape-flow-controls .react-flow__controls-button:hover {
					background: rgba(255, 255, 255, 0.12) !important;
				}
				.talescape-flow-minimap {
					background: rgba(0, 0, 0, 0.82) !important;
					border: 1px solid rgba(255, 255, 255, 0.14);
					border-radius: 10px;
				}
				.talescape-flow-minimap .react-flow__minimap-mask {
					fill: rgba(217, 181, 111, 0.14) !important;
				}
				.talescape-flow-minimap .react-flow__minimap-node {
					stroke: rgba(248, 250, 252, 0.82) !important;
					stroke-width: 2px !important;
				}
				.talescape-animated-edge {
					animation: talescape-edge-travel 0.7s linear infinite;
				}
				@keyframes talescape-edge-travel {
					to {
						stroke-dashoffset: -32;
					}
				}
			`}</style>
		</section>
	);
}

/**
 * Compiles tale branches and paths into React Flow graph data.
 *
 * @param options - Graph source data and callbacks.
 * @returns React Flow nodes and edges.
 *
 * @example
 * const graph = compileBranchEditorGraph(options);
 */
function compileBranchEditorGraph({
	activeBranchId,
	activeBlockId,
	branchPositions,
	branches,
	blocks,
	collapsedBranchIds,
	edgeType,
	expandedBranchIds,
	graphDirection,
	highlightedBranchId,
	layoutPositions,
	onAddBlock,
	onHoverBlock,
	onHover,
	onSelectBlock,
	onSelectBranch,
	onToggleBlocks,
	onToggleDescendants,
	onTravelToBlock,
	paths,
	selectedBlockId,
	selectedBranchId,
	selectedPathId,
	visibilityMode,
	visiblePathTypes,
}: {
	activeBranchId: string | null;
	activeBlockId: string | null;
	branchPositions: Record<string, GraphPosition>;
	branches: ResolvedTaleBranch[];
	blocks: ResolvedTaleBlock[];
	collapsedBranchIds: Set<string>;
	edgeType: string;
	expandedBranchIds: Set<string>;
	graphDirection: "horizontal" | "vertical";
	highlightedBranchId: string | null;
	layoutPositions: Record<string, GraphPosition>;
	onAddBlock: (branchId: string) => void;
	onHoverBlock: (blockId: string | null) => void;
	onHover: (branchId: string | null) => void;
	onSelectBlock: (blockId: string) => void;
	onSelectBranch: (branchId: string) => void;
	onToggleBlocks: (branchId: string) => void;
	onToggleDescendants: (branchId: string) => void;
	onTravelToBlock: (blockId: string) => void;
	paths: TalePath[];
	selectedBlockId: string | null;
	selectedBranchId: string | null;
	selectedPathId: string | null;
	visibilityMode: PathVisibilityMode;
	visiblePathTypes: Set<PathType>;
}): { edges: PathEditorEdge[]; nodes: BranchEditorNode[] } {
	const branchById = new Map(branches.map((branch) => [branch.id, branch]));
	const blocksByBranchId = new Map<string, ResolvedTaleBlock[]>();
	for (const block of blocks) {
		const branchBlocks = blocksByBranchId.get(block.branchId) ?? [];
		branchBlocks.push(block);
		blocksByBranchId.set(block.branchId, branchBlocks);
	}
	for (const branchBlocks of blocksByBranchId.values()) {
		branchBlocks.sort((a, b) => a.order - b.order);
	}
	const visiblePaths = paths.filter((path) =>
		isPathVisible(path, visibilityMode, visiblePathTypes),
	);
	const outgoingPathsByBranchId = new Map<string, TalePath[]>();
	const incomingPathsByBranchId = new Map<string, TalePath[]>();
	for (const path of visiblePaths) {
		const outgoingPaths = outgoingPathsByBranchId.get(path.fromBranchId) ?? [];
		outgoingPaths.push(path);
		outgoingPathsByBranchId.set(path.fromBranchId, outgoingPaths);
		const incomingPaths = incomingPathsByBranchId.get(path.toBranchId) ?? [];
		incomingPaths.push(path);
		incomingPathsByBranchId.set(path.toBranchId, incomingPaths);
	}
	const branchIdsWithChildren = new Set(
		branches.flatMap((branch) =>
			branch.parentBranchId ? [branch.parentBranchId] : [],
		),
	);

	const nodes = branches.map((branch, index): BranchEditorNode => {
		const depth = getBranchDepth(branch, branchById);
		const branchBlocks = blocksByBranchId.get(branch.id) ?? [];
		const fallbackPosition =
			graphDirection === "horizontal"
				? { x: depth * 380, y: index * 175 }
				: { x: index * 330, y: depth * 230 };
		return {
			data: {
				active: branch.id === activeBranchId,
				activeBlockId,
				branch,
				blocks: branchBlocks,
				blocksExpanded: expandedBranchIds.has(branch.id),
				descendantsCollapsed: collapsedBranchIds.has(branch.id),
				graphDirection,
				hasDescendants: branchIdsWithChildren.has(branch.id),
				hasSelectedBlock: branchBlocks.some(
					(block) => block.id === selectedBlockId,
				),
				incomingPaths: incomingPathsByBranchId.get(branch.id) ?? [],
				onAddBlock,
				onHoverBlock,
				onHover,
				onSelectBlock,
				onSelectBranch,
				onToggleBlocks,
				onToggleDescendants,
				onTravelToBlock,
				outgoingPaths: outgoingPathsByBranchId.get(branch.id) ?? [],
				selectedBlockId,
				selectedBranchId,
			},
			id: branch.id,
			position:
				branchPositions[branch.id] ??
				layoutPositions[branch.id] ??
				fallbackPosition,
			type: "branchEditor",
			dragHandle: ".branch-node-drag-handle",
		};
	});

	const branchIds = new Set(branches.map((branch) => branch.id));
	const edges = visiblePaths
		.filter(
			(path) =>
				branchIds.has(path.fromBranchId) && branchIds.has(path.toBranchId),
		)
		.map(
			(path): PathEditorEdge => ({
				data: {
					animated:
						highlightedBranchId === path.fromBranchId ||
						highlightedBranchId === path.toBranchId,
					edgeType,
					fromBranchTitle:
						branchById.get(path.fromBranchId)?.title ?? path.fromBranchId,
					label: path.label,
					pathType: path.type,
					selected: path.id === selectedPathId,
					toBranchTitle:
						branchById.get(path.toBranchId)?.title ?? path.toBranchId,
				},
				id: path.id,
				markerEnd: {
					color:
						path.id === selectedPathId
							? "#67e8f9"
							: getPathStrokeColor(path.type),
					type: MarkerType.ArrowClosed,
					height: 22,
					width: 22,
				},
				source: path.fromBranchId,
				sourceHandle: `source-path-${path.id}`,
				style: {
					stroke:
						path.id === selectedPathId
							? "#67e8f9"
							: getPathStrokeColor(path.type),
					strokeWidth: path.id === selectedPathId ? 3 : 2,
				},
				target: path.toBranchId,
				targetHandle: `target-path-${path.id}`,
				type: "pathEditor",
				reconnectable: true,
			}),
		);

	return { edges, nodes };
}

/**
 * Renders one branch node in the React Flow editor graph.
 *
 * @param props - React Flow node props.
 * @returns Branch node content.
 *
 * @example
 * <BranchEditorNodeView {...props} />
 */
function BranchEditorNodeView({
	data,
}: NodeProps<BranchEditorNode>): React.JSX.Element {
	const { isOver, setNodeRef } = useDroppable({
		id: `branch-drop-${data.branch.id}`,
		data: {
			branchId: data.branch.id,
			type: "branch",
		} satisfies DroppableBranchData,
	});
	const blocksVisible = data.blocksExpanded && !data.descendantsCollapsed;

	return (
		<div
			data-reader-component="BranchEditorNodeView"
			data-reader-role="branch-node"
			className={`relative rounded-lg border bg-black/88 p-3 text-white shadow-xl backdrop-blur transition-[width,border-color,box-shadow] hover:border-fuchsia-300 hover:shadow-fuchsia-300/15 ${
				data.descendantsCollapsed ? "w-64" : "w-72"
			} ${
				data.selectedBranchId === data.branch.id || data.hasSelectedBlock
					? "border-[#d9b56f] shadow-[#d9b56f]/15"
					: data.active
						? "border-violet-300 shadow-violet-300/15"
						: "border-white/12"
			}`}
			tabIndex={-1}
			onClick={() => data.onSelectBranch(data.branch.id)}
			onKeyDown={(event) => {
				if (event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				data.onSelectBranch(data.branch.id);
			}}
			onMouseEnter={() => data.onHover(data.branch.id)}
			onMouseLeave={() => data.onHover(null)}
		>
			{data.incomingPaths.map((path) => (
				<PathHandle
					key={`target-${path.id}`}
					direction={data.graphDirection}
					path={path}
					paths={data.incomingPaths}
					type="target"
				/>
			))}
			{data.outgoingPaths.map((path) => (
				<PathHandle
					key={`source-${path.id}`}
					direction={data.graphDirection}
					path={path}
					paths={data.outgoingPaths}
					type="source"
				/>
			))}
			<Handle
				id="source-new-path"
				type="source"
				position={
					data.graphDirection === "horizontal"
						? Position.Right
						: Position.Bottom
				}
				className="!h-2.5 !w-2.5 !border-2 !border-black/80 !bg-white/35 hover:!scale-150 hover:!bg-white transition-transform"
			/>
			<header className="flex items-start gap-2">
				<button
					type="button"
					className="mt-0.5 grid h-7 w-7 place-items-center rounded border border-white/10 text-white/70 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-25"
					aria-label={
						data.descendantsCollapsed
							? "Show descendant branches"
							: "Hide descendant branches"
					}
					disabled={!data.hasDescendants}
					onClick={(event) => {
						event.stopPropagation();
						data.onToggleDescendants(data.branch.id);
					}}
				>
					<GitBranch size={14} />
				</button>
				<button
					type="button"
					className="min-w-0 flex-1 text-left"
					onClick={(event) => {
						event.stopPropagation();
						data.onSelectBranch(data.branch.id);
					}}
				>
					<p className="truncate font-semibold text-sm">{data.branch.title}</p>
					<p className="truncate text-white/45 text-xs">{data.branch.path}</p>
				</button>
				<button
					type="button"
					className="branch-node-drag-handle grid h-7 w-7 cursor-grab place-items-center rounded border border-white/10 text-white/60 hover:bg-white/8 hover:text-white active:cursor-grabbing"
					title="Move branch"
					onClick={(event) => event.stopPropagation()}
				>
					<GripVertical size={14} />
				</button>
			</header>
			<div className="mt-3 flex items-center justify-between rounded border border-white/8 bg-white/[0.025] px-2 py-1.5 text-white/45 text-xs">
				<span>{data.blocks.length} blocks</span>
				<button
					type="button"
					className="grid h-6 w-6 place-items-center rounded text-white/65 hover:bg-white/8 hover:text-white disabled:opacity-25"
					aria-label={blocksVisible ? "Collapse blocks" : "Expand blocks"}
					disabled={data.descendantsCollapsed}
					onClick={(event) => {
						event.stopPropagation();
						data.onToggleBlocks(data.branch.id);
					}}
				>
					{blocksVisible ? (
						<ChevronDown size={14} />
					) : (
						<ChevronRight size={14} />
					)}
				</button>
			</div>
			{blocksVisible ? (
				<ul
					ref={setNodeRef}
					className={`nodrag nowheel mt-3 max-h-64 space-y-1 overflow-y-auto rounded-md border border-transparent p-1 ${
						isOver ? "border-cyan-300/55 bg-cyan-300/8" : ""
					}`}
					onWheel={(event) => event.stopPropagation()}
				>
					<SortableContext
						items={data.blocks.map((block) => block.id)}
						strategy={verticalListSortingStrategy}
					>
						{data.blocks.map((block, index) => (
							<SortableBlockRow
								key={block.id}
								block={block}
								branchId={data.branch.id}
								index={index}
								active={data.activeBlockId === block.id}
								selected={data.selectedBlockId === block.id}
								onHoverBlock={data.onHoverBlock}
								onSelectBlock={data.onSelectBlock}
								onTravelToBlock={data.onTravelToBlock}
							/>
						))}
					</SortableContext>
					<li
						data-reader-component="AddBlockListItem"
						data-reader-role="add-block-row"
					>
						<button
							type="button"
							className="flex w-full items-center justify-center gap-2 rounded border border-white/16 border-dashed bg-white/[0.025] px-2 py-1.5 text-white/55 text-xs hover:border-[#d9b56f]/60 hover:bg-[#d9b56f]/10 hover:text-[#f4d99b]"
							onClick={(event) => {
								event.stopPropagation();
								data.onAddBlock(data.branch.id);
							}}
						>
							<Plus size={13} />
							Add Block
						</button>
					</li>
				</ul>
			) : null}
		</div>
	);
}

/**
 * Renders one path-specific source or target handle on the requested node side.
 *
 * @param props - Handle placement props.
 * @param props.direction - Current graph orientation.
 * @param props.path - Path represented by this handle.
 * @param props.paths - All paths of the same source or target node.
 * @param props.type - Whether the handle starts or receives an edge.
 * @returns A visible React Flow connection handle.
 *
 * @example
 * <PathHandle direction="horizontal" path={path} paths={paths} type="source" />
 */
function PathHandle({
	direction,
	path,
	paths,
	type,
}: {
	direction: "horizontal" | "vertical";
	path: TalePath;
	paths: TalePath[];
	type: "source" | "target";
}): React.JSX.Element {
	const position = getPathHandlePosition(path.type, direction, type);
	const pathsOnSide = paths.filter(
		(item) => getPathHandlePosition(item.type, direction, type) === position,
	);
	const index = Math.max(
		0,
		pathsOnSide.findIndex((item) => item.id === path.id),
	);
	const offset = getPathHandleOffset(index, pathsOnSide.length);
	const style =
		position === Position.Left || position === Position.Right
			? { top: `${offset}%` }
			: { left: `${offset}%` };

	return (
		<Handle
			id={`${type}-path-${path.id}`}
			type={type}
			position={position}
			className="!h-3.5 !w-3.5 !border-2 !border-black/80 hover:!scale-150 hover:!brightness-125 transition-transform duration-150"
			style={{
				...style,
				background: getPathStrokeColor(path.type),
			}}
		/>
	);
}

/**
 * Resolves the node side used by one path category and graph orientation.
 *
 * @param pathType - Tale path category.
 * @param direction - Current graph orientation.
 * @param handleType - Source or target handle.
 * @returns React Flow handle position.
 *
 * @example
 * const position = getPathHandlePosition("return", "horizontal", "source");
 */
function getPathHandlePosition(
	pathType: PathType,
	direction: "horizontal" | "vertical",
	handleType: "source" | "target",
): Position {
	if (direction === "horizontal") {
		if (pathType === "return") return Position.Bottom;
		if (pathType === "teleport") return Position.Top;
		return handleType === "source" ? Position.Right : Position.Left;
	}
	if (pathType === "return") return Position.Left;
	if (pathType === "teleport") return Position.Right;
	return handleType === "source" ? Position.Bottom : Position.Top;
}

/**
 * Calculates an evenly distributed handle offset along one node side.
 *
 * @param index - Handle index on the side.
 * @param total - Number of handles sharing the side.
 * @returns Percentage offset from the side start.
 *
 * @example
 * const offset = getPathHandleOffset(1, 3);
 */
function getPathHandleOffset(index: number, total: number): number {
	if (total <= 1) return 50;
	const step = 64 / Math.max(total - 1, 1);
	return 18 + step * index;
}

/**
 * Renders one sortable block row inside a branch node list.
 *
 * @param props - Sortable block row props.
 * @param props.block - Block represented by the row.
 * @param props.branchId - Branch containing the block.
 * @param props.index - Current block index inside its branch.
 * @param props.onHoverBlock - Receives hovered block id for preview highlighting.
 * @param props.onSelectBlock - Receives selected block id.
 * @param props.selected - Whether this row is selected.
 * @returns Sortable block row.
 *
 * @example
 * <SortableBlockRow block={block} branchId="1" index={0} selected={false} onHoverBlock={setHover} onSelectBlock={selectBlock} />
 */
function SortableBlockRow({
	block,
	branchId,
	index,
	active,
	onHoverBlock,
	onSelectBlock,
	onTravelToBlock,
	selected,
}: {
	active: boolean;
	block: ResolvedTaleBlock;
	branchId: string;
	index: number;
	onHoverBlock: (blockId: string | null) => void;
	onSelectBlock: (blockId: string) => void;
	onTravelToBlock: (blockId: string) => void;
	selected: boolean;
}): React.JSX.Element {
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({
		id: block.id,
		data: {
			branchId,
			index,
			type: "block",
		} satisfies SortableBlockData,
	});

	return (
		<li
			ref={setNodeRef}
			data-reader-component="SortableBlockRow"
			data-reader-role="branch-block-row"
			className="flex items-center gap-1"
			style={{
				opacity: isDragging ? 0.42 : 1,
				transform: CSS.Transform.toString(transform),
				transition,
			}}
		>
			<button
				type="button"
				className={blockRowClassName(selected, active, isDragging)}
				onClick={(event) => {
					event.stopPropagation();
					onSelectBlock(block.id);
				}}
				onMouseEnter={() => onHoverBlock(block.id)}
				onMouseLeave={() => onHoverBlock(null)}
				{...attributes}
				{...listeners}
			>
				<span className="min-w-0 flex-1 truncate">{block.title}</span>
				<span className="ml-2 text-white/38">#{index + 1}</span>
			</button>
			<button
				type="button"
				className="grid h-7 w-7 shrink-0 place-items-center rounded border border-white/10 text-white/55 hover:bg-white/10 hover:text-white"
				title="Travel to block"
				onPointerDown={(event) => event.stopPropagation()}
				onClick={(event) => {
					event.stopPropagation();
					onTravelToBlock(block.id);
				}}
			>
				<LocateFixed size={12} />
			</button>
		</li>
	);
}

/**
 * Renders the floating block row shown while dragging.
 *
 * @param props - Drag overlay props.
 * @param props.block - Block being dragged.
 * @returns Drag overlay row.
 *
 * @example
 * <DraggedBlockOverlay block={block} />
 */
function DraggedBlockOverlay({
	block,
}: {
	block: ResolvedTaleBlock;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="DraggedBlockOverlay"
			data-reader-role="drag-preview"
			className="w-64 rounded border border-cyan-300 bg-black/92 px-2 py-1.5 text-left text-white text-xs shadow-2xl shadow-cyan-300/20"
		>
			<p className="truncate">{block.title}</p>
		</div>
	);
}

/**
 * Resolves sortable block row classes.
 *
 * @param selected - Whether the row is selected.
 * @param dragging - Whether the row is actively being dragged.
 * @returns Class name for a sortable block row.
 *
 * @example
 * const className = blockRowClassName(true, false);
 */
function blockRowClassName(
	selected: boolean,
	active: boolean,
	dragging: boolean,
): string {
	if (selected) {
		return "flex min-w-0 flex-1 cursor-grab items-center justify-between rounded border border-cyan-300 bg-cyan-300/12 px-2 py-1.5 text-left text-xs hover:border-emerald-300/80 hover:bg-emerald-300/10 active:cursor-grabbing";
	}
	if (active) {
		return "flex min-w-0 flex-1 cursor-grab items-center justify-between rounded border border-violet-300 bg-violet-300/12 px-2 py-1.5 text-left text-xs hover:border-emerald-300/80 hover:bg-emerald-300/10 active:cursor-grabbing";
	}
	if (dragging) {
		return "flex min-w-0 flex-1 cursor-grabbing items-center justify-between rounded border border-cyan-300/70 bg-cyan-300/10 px-2 py-1.5 text-left text-xs";
	}
	return "flex min-w-0 flex-1 cursor-grab items-center justify-between rounded border border-white/8 bg-white/[0.035] px-2 py-1.5 text-left text-xs hover:border-emerald-300/80 hover:bg-emerald-300/10 active:cursor-grabbing";
}

/**
 * Checks if a path should be visible in the current editor graph filter.
 *
 * @param path - Path to check.
 * @param mode - Current visibility mode.
 * @param customTypes - Custom visible path types.
 * @returns Whether the path should be shown.
 *
 * @example
 * const visible = isPathVisible(path, "primary", new Set());
 */
function isPathVisible(
	path: TalePath,
	mode: PathVisibilityMode,
	customTypes: Set<PathType>,
): boolean {
	if (mode === "all") return true;
	if (mode === "primary") return primaryPathTypes.has(path.type);
	return customTypes.has(path.type);
}
