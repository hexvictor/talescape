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
	useUpdateNodeInternals,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
	ChevronDown,
	ChevronRight,
	GitBranch,
	GripVertical,
	LocateFixed,
	Map as MapIcon,
	Maximize2,
	Minimize2,
	Plus,
	RefreshCcw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	addDraftBlock,
	addDraftBranch,
	connectDraftBranches,
	moveBlockInTale,
	reconnectDraftPath,
} from "~/app/(tale-app)/(tale-editor)/_shared/services/taleDraftEdits";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import type {
	ResolvedTaleBlock,
	ResolvedTaleBranch,
	TalePath,
} from "~/app/(tale-app)/_shared/types";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";
import type {
	GraphFocusMode,
	GraphPosition,
	PathVisibilityMode,
} from "../../store/editorStoreTypes";
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
	graphDragging: boolean;
	previewReachable: boolean;
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
const linearPathTypes = new Set<PathType>(["choice", "linear"]);
const returnPathTypes = new Set<PathType>(["return"]);
const teleportPathTypes = new Set<PathType>(["teleport"]);
const emptySelectedBranchIds: string[] = [];

/**
 * Renders the branch and path graph used by the editing surface.
 *
 * @returns React Flow branch editor graph.
 *
 * @example
 * <TaleBranchGraph />
 */
export function TaleBranchGraph(): React.JSX.Element {
	const { setTale: setData, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const {
		clearGraphSelection,
		highlightedBranchId,
		selectBlockForEditing,
		selectBranchForEditing,
		selectPathForEditing,
		selectedBlockId,
		selectedBranchId,
		setHighlightedBranchId,
		setHoveredBlockId,
	} = useTaleEditorStoreShallow((state) => state.editor);
	const showActiveState = useTaleAppStore(
		(state) => state.derived.isPreviewing,
	);
	const { activeBlockId, activeBranchId, scrollApi, selectedBranchIds } =
		useTaleReaderStoreShallow((state) => ({
			activeBlockId: showActiveState
				? (state.navigation.current?.blockId ?? null)
				: null,
			activeBranchId: showActiveState
				? (state.navigation.current?.branchId ?? null)
				: null,
			scrollApi: state.scroll.api,
			selectedBranchIds: showActiveState
				? state.navigation.selectedBranchIds
				: emptySelectedBranchIds,
		}));
	const {
		branchPositions,
		collapsedBranchIds,
		edgeType,
		expandBlocks,
		expandedBranchIds,
		focusMode,
		graphDirection,
		layoutRequestRevision,
		pathVisibilityMode: visibilityMode,
		resetLayout,
		selectedPathId,
		setBranchPosition,
		toggleBlocks,
		toggleDescendants,
		visiblePathTypes,
		unfocusedEdgeOpacity,
		unfocusedNodeOpacity,
	} = useTaleEditorStoreShallow((state) => state.editorGraph);
	const [layoutPositions, setLayoutPositions] = useState<
		Record<string, GraphPosition>
	>({});
	const flowInstanceRef = useRef<
		ReactFlowInstance<BranchEditorNode, PathEditorEdge> | undefined
	>(undefined);
	const fittedLayoutRevisionRef = useRef<number | null>(null);
	const resolvedLayoutRevisionRef = useRef<number | null>(null);
	const [draggedBlock, setDraggedBlock] = useState<ResolvedTaleBlock | null>(
		null,
	);
	const [minimapVisible, setMinimapVisible] = useState(true);
	const [minimapCompact, setMinimapCompact] = useState(false);
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
	const previewVisibleBranchIds = useMemo(() => {
		if (!showActiveState) return null;
		return new Set(
			[tale.bounds.rootBranchId, ...selectedBranchIds].filter(
				(branchId): branchId is string => typeof branchId === "string",
			),
		);
	}, [selectedBranchIds, showActiveState, tale.bounds.rootBranchId]);
	const branchTopologyKey = tale.structure.branches
		.map(
			(branch) =>
				`${branch.id}:${branch.parentBranchId ?? "root"}:${branch.order}:${branch.position.index}`,
		)
		.join("|");
	const layoutTrigger = `${graphDirection}:${layoutRequestRevision}:${branchTopologyKey}`;
	const graphLayoutSourceRef = useRef({
		blocks: tale.structure.blocks,
		branches: tale.structure.branches,
		collapsedBranchIds,
		expandedBranchIds,
	});
	graphLayoutSourceRef.current = {
		blocks: tale.structure.blocks,
		branches: tale.structure.branches,
		collapsedBranchIds,
		expandedBranchIds,
	};
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
		if (!layoutTrigger) return;
		let cancelled = false;
		const layoutSource = graphLayoutSourceRef.current;
		layoutTaleBranchGraph({
			branches: layoutSource.branches,
			blocks: layoutSource.blocks,
			collapsedBranchIds: layoutSource.collapsedBranchIds,
			expandedBranchIds: layoutSource.expandedBranchIds,
			graphDirection,
			requestRevision: layoutRequestRevision,
		})
			.then((positions) => {
				if (!cancelled) {
					resolvedLayoutRevisionRef.current = layoutRequestRevision;
					setLayoutPositions(positions);
					if (fittedLayoutRevisionRef.current !== layoutRequestRevision) {
						fittedLayoutRevisionRef.current = layoutRequestRevision;
						window.requestAnimationFrame(() => {
							flowInstanceRef.current?.fitView({
								duration: 280,
								padding: 0.18,
							});
						});
					}
				}
			})
			.catch(() => {
				if (!cancelled) setLayoutPositions({});
			});
		return () => {
			cancelled = true;
		};
	}, [graphDirection, layoutRequestRevision, layoutTrigger]);

	const compiledGraph = useMemo(
		() =>
			compileBranchEditorGraph({
				activeBranchId: showActiveState ? activeBranchId : null,
				activeBlockId,
				allBranches: tale.structure.branches,
				branchPositions,
				branches: graphBranches,
				blocks: tale.structure.blocks,
				collapsedBranchIds,
				edgeType,
				expandedBranchIds,
				focusMode,
				graphDirection,
				highlightedBranchId,
				layoutPositions,
				onAddBlock: handleAddBlock,
				onHoverBlock: setHoveredBlockId,
				onHover: setHighlightedBranchId,
				onSelectBlock: selectBlockForEditing,
				onSelectBranch: selectBranchForEditing,
				onToggleBlocks: toggleBlocks,
				onToggleDescendants: toggleDescendants,
				onTravelToBlock: (blockId) =>
					scrollApi?.scrollToBlock(blockId, { motion: "travel" }),
				paths: graphPaths,
				previewVisibleBranchIds,
				selectedBlockId,
				selectedBranchId,
				selectedPathId,
				visibilityMode,
				visiblePathTypes,
				unfocusedEdgeOpacity,
				unfocusedNodeOpacity,
			}),
		[
			activeBranchId,
			activeBlockId,
			branchPositions,
			collapsedBranchIds,
			edgeType,
			expandedBranchIds,
			focusMode,
			graphBranches,
			graphDirection,
			graphPaths,
			handleAddBlock,
			highlightedBranchId,
			layoutPositions,
			previewVisibleBranchIds,
			selectBlockForEditing,
			selectBranchForEditing,
			scrollApi,
			selectedBranchId,
			selectedBlockId,
			selectedPathId,
			setHoveredBlockId,
			setHighlightedBranchId,
			showActiveState,
			tale.structure.blocks,
			tale.structure.branches,
			toggleBlocks,
			toggleDescendants,
			visibilityMode,
			visiblePathTypes,
			unfocusedEdgeOpacity,
			unfocusedNodeOpacity,
		],
	);
	const [nodes, setNodes, onNodesChange] = useNodesState<BranchEditorNode>(
		compiledGraph.nodes,
	);
	const [renderedEdges, setRenderedEdges] = useState<PathEditorEdge[]>(
		compiledGraph.edges,
	);
	const draggingBranchIdRef = useRef<string | null>(null);
	const appliedLayoutRevisionRef = useRef<number | null>(null);
	useEffect(() => {
		const applyLayoutToExistingNodes =
			appliedLayoutRevisionRef.current !== resolvedLayoutRevisionRef.current;
		setNodes((currentNodes) => {
			const currentNodeById = new Map(
				currentNodes.map((node) => [node.id, node]),
			);
			return compiledGraph.nodes.map((node) => {
				const currentNode = currentNodeById.get(node.id);
				if (draggingBranchIdRef.current === node.id && currentNode) {
					return currentNode;
				}
				return {
					...currentNode,
					...node,
					data: {
						...node.data,
						graphDragging: draggingBranchIdRef.current !== null,
					},
					position:
						applyLayoutToExistingNodes || !currentNode
							? node.position
							: currentNode.position,
				};
			});
		});
		appliedLayoutRevisionRef.current = resolvedLayoutRevisionRef.current;
	}, [compiledGraph.nodes, setNodes]);
	useEffect(() => {
		const compiledEdgeIds = new Set(compiledGraph.edges.map((edge) => edge.id));
		setRenderedEdges((currentEdges) =>
			currentEdges.filter((edge) => compiledEdgeIds.has(edge.id)),
		);
		let measurementFrame = 0;
		const mountFrame = window.requestAnimationFrame(() => {
			measurementFrame = window.requestAnimationFrame(() => {
				setRenderedEdges(
					draggingBranchIdRef.current
						? setGraphEdgesDragging(compiledGraph.edges, true)
						: compiledGraph.edges,
				);
			});
		});
		return () => {
			window.cancelAnimationFrame(mountFrame);
			window.cancelAnimationFrame(measurementFrame);
		};
	}, [compiledGraph.edges]);

	return (
		<section
			data-reader-component="TaleBranchGraph"
			data-reader-role="branch-graph"
			className="relative h-full min-h-0 flex-1 overflow-hidden bg-muted/40"
		>
			<DndContext
				sensors={sensors}
				onDragEnd={handleDragEnd}
				onDragStart={handleDragStart}
			>
				<div
					data-reader-component="TaleBranchGraph"
					data-reader-role="graph-controls"
					className="absolute top-3 right-3 z-20 flex flex-wrap justify-end gap-2"
				>
					<button
						type="button"
						data-reader-component="TaleBranchGraph"
						data-reader-role="reset-layout-control"
						className="grid h-9 w-9 place-items-center rounded border border-foreground/12 bg-background/76 text-foreground/72 hover:bg-foreground/8 hover:text-foreground"
						title="Reorganize branches"
						onClick={resetLayout}
					>
						<RefreshCcw size={14} />
					</button>
					<button
						type="button"
						data-reader-component="TaleBranchGraph"
						data-reader-role="minimap-visibility-control"
						aria-pressed={minimapVisible}
						className="grid h-9 w-9 place-items-center rounded border border-foreground/12 bg-background/76 text-foreground/72 hover:bg-foreground/8 hover:text-foreground"
						title={minimapVisible ? "Hide minimap" : "Show minimap"}
						onClick={() => setMinimapVisible((visible) => !visible)}
					>
						<MapIcon size={14} />
					</button>
					{minimapVisible ? (
						<button
							type="button"
							data-reader-component="TaleBranchGraph"
							data-reader-role="minimap-size-control"
							aria-pressed={minimapCompact}
							className="grid h-9 w-9 place-items-center rounded border border-foreground/12 bg-background/76 text-foreground/72 hover:bg-foreground/8 hover:text-foreground"
							title={
								minimapCompact ? "Use default minimap size" : "Shrink minimap"
							}
							onClick={() => setMinimapCompact((compact) => !compact)}
						>
							{minimapCompact ? (
								<Maximize2 size={14} />
							) : (
								<Minimize2 size={14} />
							)}
						</button>
					) : null}
					<button
						type="button"
						data-reader-component="TaleBranchGraph"
						data-reader-role="add-branch-control"
						className="flex h-9 items-center gap-2 rounded border border-foreground/12 bg-background/76 px-3 text-foreground/72 text-xs hover:bg-foreground/8 hover:text-foreground"
						onClick={handleAddBranch}
					>
						<Plus size={14} />
						Add Branch
					</button>
				</div>
				<ReactFlow<BranchEditorNode, PathEditorEdge>
					fitView
					edgesReconnectable
					edges={renderedEdges}
					nodes={nodes}
					nodeDragThreshold={1}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					nodesDraggable
					onlyRenderVisibleElements
					onEdgeClick={(event, edge) => {
						if (draggingBranchIdRef.current) return;
						event.stopPropagation();
						selectPathForEditing(edge.id);
					}}
					onConnect={handleConnect}
					onNodesChange={onNodesChange}
					onInit={(instance) => {
						flowInstanceRef.current = instance;
					}}
					onNodeDragStart={(_, node) => {
						draggingBranchIdRef.current = node.id;
						setHighlightedBranchId(null);
						setHoveredBlockId(null);
						setNodes((currentNodes) =>
							currentNodes.map((currentNode) => ({
								...currentNode,
								data: { ...currentNode.data, graphDragging: true },
							})),
						);
						setRenderedEdges((currentEdges) =>
							setGraphEdgesDragging(currentEdges, true),
						);
					}}
					onNodeDragStop={(_, node) => {
						draggingBranchIdRef.current = null;
						setNodes((currentNodes) =>
							currentNodes.map((currentNode) => ({
								...currentNode,
								data: { ...currentNode.data, graphDragging: false },
							})),
						);
						setRenderedEdges(compiledGraph.edges);
						setBranchPosition(node.id, node.position);
					}}
					onNodeMouseEnter={(_, node) => {
						if (!draggingBranchIdRef.current) setHighlightedBranchId(node.id);
					}}
					onNodeMouseLeave={() => {
						if (!draggingBranchIdRef.current) setHighlightedBranchId(null);
					}}
					onPaneClick={clearGraphSelection}
					onReconnect={handleReconnect}
				>
					<Background color="var(--muted-foreground)" gap={24} />
					<Controls className="talescape-flow-controls [&_.react-flow__controls-button]:!border-foreground/10 [&_.react-flow__controls-button]:!bg-background [&_.react-flow__controls-button]:!text-foreground" />
					{minimapVisible ? (
						<MiniMap
							pannable
							zoomable
							bgColor="var(--background)"
							maskColor="color-mix(in oklab, var(--primary) 16%, transparent)"
							nodeBorderRadius={8}
							nodeColor={(node) =>
								node.id === selectedBranchId
									? "var(--chart-2)"
									: "var(--primary)"
							}
							nodeStrokeColor={() => "var(--foreground)"}
							nodeStrokeWidth={2}
							className="talescape-flow-minimap !bg-background/80"
							style={
								minimapCompact
									? { height: 86, width: 126 }
									: { height: 150, width: 200 }
							}
						/>
					) : null}
				</ReactFlow>
				<DragOverlay>
					{draggedBlock ? <DraggedBlockOverlay block={draggedBlock} /> : null}
				</DragOverlay>
			</DndContext>
			<style jsx global>{`
				.talescape-flow-controls .react-flow__controls-button {
					background: var(--background) !important;
					border-color: var(--border) !important;
					color: var(--foreground) !important;
					fill: var(--foreground) !important;
				}
				.talescape-flow-controls .react-flow__controls-button svg {
					color: var(--foreground) !important;
					fill: var(--foreground) !important;
					stroke: var(--foreground) !important;
				}
				.talescape-flow-controls .react-flow__controls-button:hover {
					background: var(--accent) !important;
				}
				.talescape-flow-minimap {
					background: color-mix(in oklab, var(--background) 88%, transparent) !important;
					border: 1px solid var(--border);
					border-radius: 10px;
				}
				.talescape-flow-minimap .react-flow__minimap-mask {
					fill: color-mix(in oklab, var(--primary) 14%, transparent) !important;
				}
				.talescape-flow-minimap .react-flow__minimap-node {
					stroke: var(--foreground) !important;
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
	allBranches,
	branchPositions,
	branches,
	blocks,
	collapsedBranchIds,
	edgeType,
	expandedBranchIds,
	focusMode,
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
	previewVisibleBranchIds,
	selectedBlockId,
	selectedBranchId,
	selectedPathId,
	visibilityMode,
	visiblePathTypes,
	unfocusedEdgeOpacity,
	unfocusedNodeOpacity,
}: {
	activeBranchId: string | null;
	activeBlockId: string | null;
	allBranches: ResolvedTaleBranch[];
	branchPositions: Record<string, GraphPosition>;
	branches: ResolvedTaleBranch[];
	blocks: ResolvedTaleBlock[];
	collapsedBranchIds: Set<string>;
	edgeType: string;
	expandedBranchIds: Set<string>;
	focusMode: GraphFocusMode;
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
	previewVisibleBranchIds: Set<string> | null;
	selectedBlockId: string | null;
	selectedBranchId: string | null;
	selectedPathId: string | null;
	visibilityMode: PathVisibilityMode;
	visiblePathTypes: Set<PathType>;
	unfocusedEdgeOpacity: number;
	unfocusedNodeOpacity: number;
}): { edges: PathEditorEdge[]; nodes: BranchEditorNode[] } {
	const branchById = new Map(allBranches.map((branch) => [branch.id, branch]));
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
		allBranches.flatMap((branch) =>
			branch.parentBranchId ? [branch.parentBranchId] : [],
		),
	);
	const focusedBranchIds = getFocusedBranchIds({
		branchById,
		focusMode,
		highlightedBranchId,
		paths: visiblePaths,
	});
	const focusActive = focusedBranchIds !== null;

	const nodes = branches.map((branch, index): BranchEditorNode => {
		const depth = getBranchDepth(branch, branchById);
		const branchBlocks = blocksByBranchId.get(branch.id) ?? [];
		const previewReachable =
			!previewVisibleBranchIds || previewVisibleBranchIds.has(branch.id);
		const focusOpacity =
			focusActive && !focusedBranchIds?.has(branch.id)
				? unfocusedNodeOpacity
				: 1;
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
				graphDragging: false,
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
				previewReachable,
				selectedBlockId,
				selectedBranchId,
			},
			id: branch.id,
			style: {
				opacity: Math.min(focusOpacity, previewReachable ? 1 : 0.3),
				transition: "opacity 140ms ease",
			},
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
		.map((path): PathEditorEdge => {
			const focused =
				!focusActive ||
				(Boolean(focusedBranchIds?.has(path.fromBranchId)) &&
					Boolean(focusedBranchIds?.has(path.toBranchId)));
			const fromPreviewVisible =
				!previewVisibleBranchIds ||
				previewVisibleBranchIds.has(path.fromBranchId);
			const toPreviewVisible =
				!previewVisibleBranchIds ||
				previewVisibleBranchIds.has(path.toBranchId);
			const previewReachable = fromPreviewVisible && toPreviewVisible;
			const previewAvailable = fromPreviewVisible && !toPreviewVisible;
			const previewOpacity = previewReachable
				? 1
				: previewAvailable
					? 0.42
					: 0.16;
			const pathColor =
				previewReachable || previewAvailable
					? getPathStrokeColor(path.type)
					: "var(--muted-foreground)";
			return {
				data: {
					activeConnected:
						activeBlockId === path.fromBlockId ||
						activeBlockId === path.toBlockId,
					animated:
						highlightedBranchId === path.fromBranchId ||
						highlightedBranchId === path.toBranchId,
					edgeType,
					fromBranchTitle:
						branchById.get(path.fromBranchId)?.title ?? path.fromBranchId,
					label: path.label,
					pathType: path.type,
					previewAvailable,
					previewReachable,
					selected: path.id === selectedPathId,
					toBranchTitle:
						branchById.get(path.toBranchId)?.title ?? path.toBranchId,
				},
				id: path.id,
				markerEnd: {
					color: path.id === selectedPathId ? "#67e8f9" : pathColor,
					type: MarkerType.ArrowClosed,
					height: 22,
					width: 22,
				},
				source: path.fromBranchId,
				sourceHandle: `source-path-${path.id}`,
				style: {
					opacity: Math.min(focused ? 1 : unfocusedEdgeOpacity, previewOpacity),
					stroke: path.id === selectedPathId ? "#67e8f9" : pathColor,
					strokeWidth: path.id === selectedPathId ? 3 : 2,
					transition: "opacity 140ms ease",
				},
				target: path.toBranchId,
				targetHandle: `target-path-${path.id}`,
				type: "pathEditor",
				reconnectable: true,
			};
		});

	return { edges, nodes };
}

/**
 * Resolves branches that remain emphasized while one graph node is hovered.
 *
 * @param options - Graph focus inputs.
 * @returns Focused branch ids, or null when focus dimming is inactive.
 *
 * @example
 * const focused = getFocusedBranchIds({ branchById, focusMode, highlightedBranchId, paths });
 */
function getFocusedBranchIds({
	branchById,
	focusMode,
	highlightedBranchId,
	paths,
}: {
	branchById: Map<string, ResolvedTaleBranch>;
	focusMode: GraphFocusMode;
	highlightedBranchId: string | null;
	paths: TalePath[];
}): Set<string> | null {
	if (!highlightedBranchId || focusMode === "off") return null;
	const focused = new Set([highlightedBranchId]);
	if (focusMode === "direct") {
		for (const path of paths) {
			if (path.fromBranchId === highlightedBranchId)
				focused.add(path.toBranchId);
			if (path.toBranchId === highlightedBranchId)
				focused.add(path.fromBranchId);
		}
		return focused;
	}

	let branch = branchById.get(highlightedBranchId);
	while (branch?.parentBranchId) {
		focused.add(branch.parentBranchId);
		branch = branchById.get(branch.parentBranchId);
	}
	return focused;
}

/**
 * Applies lightweight, non-highlighted rendering to graph edges during dragging.
 *
 * @param edges - Current controlled React Flow edges.
 * @param dragging - Whether a branch node is being moved.
 * @returns Edges configured for normal or drag-time rendering.
 *
 * @example
 * const lightweightEdges = setGraphEdgesDragging(edges, true);
 */
function setGraphEdgesDragging(
	edges: PathEditorEdge[],
	dragging: boolean,
): PathEditorEdge[] {
	if (!dragging) return edges;
	return edges.map((edge) => ({
		...edge,
		data: edge.data ? { ...edge.data, dragging: true } : edge.data,
		markerEnd:
			edge.markerEnd && typeof edge.markerEnd === "object"
				? {
						...edge.markerEnd,
						color: getPathStrokeColor(edge.data?.pathType ?? "choice"),
					}
				: edge.markerEnd,
	}));
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
	const updateNodeInternals = useUpdateNodeInternals();
	const { isOver, setNodeRef } = useDroppable({
		id: `branch-drop-${data.branch.id}`,
		data: {
			branchId: data.branch.id,
			type: "branch",
		} satisfies DroppableBranchData,
	});
	const blocksVisible = data.blocksExpanded && !data.descendantsCollapsed;
	const pathHandleLayoutRevision = `${data.graphDirection}:${[
		...data.incomingPaths.map((path) => `target:${path.id}:${path.type}`),
		...data.outgoingPaths.map((path) => `source:${path.id}:${path.type}`),
	].join("|")}`;

	useEffect(() => {
		if (pathHandleLayoutRevision) updateNodeInternals(data.branch.id);
	}, [data.branch.id, pathHandleLayoutRevision, updateNodeInternals]);

	return (
		<div
			data-reader-component="BranchEditorNodeView"
			data-reader-role="branch-node"
			className={`relative rounded-lg border bg-background/88 p-3 text-foreground ${
				data.graphDragging
					? "shadow-none"
					: "shadow-xl backdrop-blur transition-[width,border-color,box-shadow] hover:border-fuchsia-300 hover:shadow-fuchsia-300/15"
			} ${data.previewReachable ? "" : "grayscale"} ${
				data.descendantsCollapsed ? "w-64" : "w-72"
			} ${
				data.graphDragging
					? "border-foreground/12"
					: data.selectedBranchId === data.branch.id || data.hasSelectedBlock
						? "border-primary shadow-[#d9b56f]/15"
						: data.active
							? "border-violet-300 shadow-violet-300/15"
							: "border-foreground/12"
			}`}
			tabIndex={-1}
			onClick={() => data.onSelectBranch(data.branch.id)}
			onKeyDown={(event) => {
				if (event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				data.onSelectBranch(data.branch.id);
			}}
			onMouseEnter={() => {
				if (!data.graphDragging) data.onHover(data.branch.id);
			}}
			onMouseLeave={() => {
				if (!data.graphDragging) data.onHover(null);
			}}
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
				className={`!h-2.5 !w-2.5 !border-2 !border-background/80 !bg-foreground/35 transition-transform ${
					data.graphDragging
						? "pointer-events-none"
						: "hover:!scale-150 hover:!bg-foreground"
				}`}
			/>
			<header className="flex items-start gap-2">
				<button
					type="button"
					className="mt-0.5 grid h-7 w-7 place-items-center rounded border border-foreground/10 text-foreground/70 hover:bg-foreground/8 disabled:cursor-not-allowed disabled:opacity-25"
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
					<p className="truncate text-foreground/45 text-xs">
						{data.branch.path}
					</p>
				</button>
				<button
					type="button"
					className="branch-node-drag-handle grid h-7 w-7 cursor-grab place-items-center rounded border border-foreground/10 text-foreground/60 hover:bg-foreground/8 hover:text-foreground active:cursor-grabbing"
					title="Move branch"
					onClick={(event) => event.stopPropagation()}
				>
					<GripVertical size={14} />
				</button>
			</header>
			<div className="mt-3 flex items-center justify-between rounded border border-foreground/8 bg-foreground/[0.025] px-2 py-1.5 text-foreground/45 text-xs">
				<span>{data.blocks.length} blocks</span>
				<button
					type="button"
					className="grid h-6 w-6 place-items-center rounded text-foreground/65 hover:bg-foreground/8 hover:text-foreground disabled:opacity-25"
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
						isOver && !data.graphDragging
							? "border-cyan-300/55 bg-cyan-300/8"
							: ""
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
								graphDragging={data.graphDragging}
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
							className="flex w-full items-center justify-center gap-2 rounded border border-foreground/16 border-dashed bg-foreground/[0.025] px-2 py-1.5 text-foreground/55 text-xs hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
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
			className="!h-3.5 !w-3.5 !border-2 !border-background/80 hover:!scale-150 hover:!brightness-125 transition-transform duration-150"
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
 * @param props.active - Whether the preview currently displays this block.
 * @param props.block - Block represented by the row.
 * @param props.branchId - Branch containing the block.
 * @param props.graphDragging - Whether a branch node is currently moving.
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
	graphDragging,
	onHoverBlock,
	onSelectBlock,
	onTravelToBlock,
	selected,
}: {
	active: boolean;
	block: ResolvedTaleBlock;
	branchId: string;
	graphDragging: boolean;
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
				className={blockRowClassName(
					selected,
					active,
					isDragging,
					graphDragging,
				)}
				onClick={(event) => {
					event.stopPropagation();
					onSelectBlock(block.id);
				}}
				onMouseEnter={() => {
					if (!graphDragging) onHoverBlock(block.id);
				}}
				onMouseLeave={() => {
					if (!graphDragging) onHoverBlock(null);
				}}
				{...attributes}
				{...listeners}
			>
				<span className="min-w-0 flex-1 truncate">{block.title}</span>
				<span className="ml-2 text-foreground/38">#{index + 1}</span>
			</button>
			<button
				type="button"
				className="grid h-7 w-7 shrink-0 place-items-center rounded border border-foreground/10 text-foreground/55 hover:bg-foreground/10 hover:text-foreground"
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
			className="w-64 rounded border border-cyan-300 bg-background/92 px-2 py-1.5 text-left text-foreground text-xs shadow-2xl shadow-cyan-300/20"
		>
			<p className="truncate">{block.title}</p>
		</div>
	);
}

/**
 * Resolves sortable block row classes.
 *
 * @param selected - Whether the row is selected.
 * @param active - Whether the preview currently displays the row's block.
 * @param dragging - Whether the row is actively being dragged.
 * @param graphDragging - Whether a branch node is currently moving.
 * @returns Class name for a sortable block row.
 *
 * @example
 * const className = blockRowClassName(true, false);
 */
function blockRowClassName(
	selected: boolean,
	active: boolean,
	dragging: boolean,
	graphDragging: boolean,
): string {
	if (graphDragging) {
		return "flex min-w-0 flex-1 cursor-default items-center justify-between rounded border border-foreground/8 bg-foreground/[0.035] px-2 py-1.5 text-left text-xs";
	}
	if (selected) {
		return "flex min-w-0 flex-1 cursor-grab items-center justify-between rounded border border-cyan-300 bg-cyan-300/12 px-2 py-1.5 text-left text-xs hover:border-emerald-300/80 hover:bg-emerald-300/10 active:cursor-grabbing";
	}
	if (active) {
		return "flex min-w-0 flex-1 cursor-grab items-center justify-between rounded border border-violet-300 bg-violet-300/12 px-2 py-1.5 text-left text-xs hover:border-emerald-300/80 hover:bg-emerald-300/10 active:cursor-grabbing";
	}
	if (dragging) {
		return "flex min-w-0 flex-1 cursor-grabbing items-center justify-between rounded border border-cyan-300/70 bg-cyan-300/10 px-2 py-1.5 text-left text-xs";
	}
	return "flex min-w-0 flex-1 cursor-grab items-center justify-between rounded border border-foreground/8 bg-foreground/[0.035] px-2 py-1.5 text-left text-xs hover:border-emerald-300/80 hover:bg-emerald-300/10 active:cursor-grabbing";
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
 * const visible = isPathVisible(path, "linear", new Set());
 */
function isPathVisible(
	path: TalePath,
	mode: PathVisibilityMode,
	customTypes: Set<PathType>,
): boolean {
	if (mode === "all") return true;
	if (mode === "linear") return linearPathTypes.has(path.type);
	if (mode === "return") return returnPathTypes.has(path.type);
	if (mode === "teleport") return teleportPathTypes.has(path.type);
	return customTypes.has(path.type);
}
