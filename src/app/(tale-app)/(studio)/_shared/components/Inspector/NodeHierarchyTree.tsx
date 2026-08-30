"use client";

import { Boxes, ChevronRight, FileText } from "lucide-react";
import { useState } from "react";
import type {
	ResolvedTaleBlock,
	ResolvedTaleFragment,
	TaleNode,
} from "~/app/(tale-app)/_shared/types";
import cn from "~/lib/utils/cn";
import { useTaleStudioStore } from "../../hooks/useTaleStudioStore";

type NodeHierarchyTreeProps = {
	block: ResolvedTaleBlock;
	fragmentsById: Record<string, ResolvedTaleFragment>;
	nodes: TaleNode[];
	nodesById: Record<string, TaleNode>;
	onSelectNode: (nodeId: string) => void;
	selectedNodeId: string;
};

/**
 * Renders a block's node and fragment ownership as an expandable tree.
 *
 * @param props - Node hierarchy props.
 * @param props.block - Block whose hierarchy is shown.
 * @param props.onSelectNode - Selects a node for editing.
 * @param props.selectedNodeId - Currently edited node id.
 * @returns Expandable node hierarchy.
 *
 * @example
 * <NodeHierarchyTree block={block} selectedNodeId={id} onSelectNode={setId} />
 */
export function NodeHierarchyTree({
	block,
	fragmentsById,
	nodes,
	nodesById,
	onSelectNode,
	selectedNodeId,
}: NodeHierarchyTreeProps): React.JSX.Element {
	const openSecondaryInspector = useTaleStudioStore(
		(state) => state.studioSelection.openSecondaryInspector,
	);
	const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
		() => new Set([block.rootNodeId]),
	);
	const reachableNodeIds = collectReachableNodeIds(nodesById, block.rootNodeId);
	const rootNode = nodesById[block.rootNodeId];
	const unlinkedNodes = nodes.filter((node) => !reachableNodeIds.has(node.id));

	const toggleNode = (nodeId: string): void => {
		setExpandedNodeIds((current) => {
			const next = new Set(current);
			if (next.has(nodeId)) next.delete(nodeId);
			else next.add(nodeId);
			return next;
		});
	};

	return (
		<div
			data-reader-component="NodeHierarchyTree"
			data-reader-role="node-hierarchy"
			className="rounded-md border border-foreground/10 bg-background/20 p-2"
		>
			{rootNode?.children.map((child) =>
				child.type === "node" ? (
					<NodeTreeBranch
						key={child.nodeId}
						block={block}
						expandedNodeIds={expandedNodeIds}
						fragmentsById={fragmentsById}
						nodeId={child.nodeId}
						nodesById={nodesById}
						selectedNodeId={selectedNodeId}
						onInspectFragment={(fragmentId) =>
							openSecondaryInspector({
								blockId: block.id,
								id: fragmentId,
								type: "fragment",
							})
						}
						onSelectNode={onSelectNode}
						onToggleNode={toggleNode}
					/>
				) : (
					<FragmentTreeButton
						key={child.fragmentId}
						block={block}
						fragmentsById={fragmentsById}
						fragmentId={child.fragmentId}
						onInspectFragment={(fragmentId) =>
							openSecondaryInspector({
								blockId: block.id,
								id: fragmentId,
								type: "fragment",
							})
						}
					/>
				),
			)}
			{unlinkedNodes.length > 0 ? (
				<div className="mt-2 border-foreground/8 border-t pt-2">
					<p className="px-2 py-1 font-bold text-[9px] text-foreground/35 uppercase">
						Unlinked nodes
					</p>
					{unlinkedNodes.map((node) => (
						<NodeTreeBranch
							key={node.id}
							block={block}
							expandedNodeIds={expandedNodeIds}
							fragmentsById={fragmentsById}
							nodeId={node.id}
							nodesById={nodesById}
							selectedNodeId={selectedNodeId}
							onInspectFragment={(fragmentId) =>
								openSecondaryInspector({
									blockId: block.id,
									id: fragmentId,
									type: "fragment",
								})
							}
							onSelectNode={onSelectNode}
							onToggleNode={toggleNode}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}

type NodeTreeBranchProps = {
	block: ResolvedTaleBlock;
	expandedNodeIds: Set<string>;
	fragmentsById: Record<string, ResolvedTaleFragment>;
	nodeId: string;
	nodesById: Record<string, TaleNode>;
	onInspectFragment: (fragmentId: string) => void;
	onSelectNode: (nodeId: string) => void;
	onToggleNode: (nodeId: string) => void;
	selectedNodeId: string;
};

/**
 * Renders one recursive branch of the node hierarchy.
 *
 * @param props - Recursive branch props.
 * @returns One node row and its expanded children.
 */
function NodeTreeBranch({
	block,
	expandedNodeIds,
	fragmentsById,
	nodeId,
	nodesById,
	onInspectFragment,
	onSelectNode,
	onToggleNode,
	selectedNodeId,
}: NodeTreeBranchProps): React.JSX.Element | null {
	const node = nodesById[nodeId];
	if (!node) return null;
	const expanded = expandedNodeIds.has(node.id);
	const hasChildren = node.children.length > 0;

	return (
		<div data-reader-component="NodeTreeBranch" data-reader-role="node-branch">
			<div className="flex min-w-0 items-center gap-1">
				<button
					type="button"
					aria-label={expanded ? "Collapse node" : "Expand node"}
					disabled={!hasChildren}
					className="grid h-7 w-7 shrink-0 place-items-center text-foreground/38 disabled:opacity-20"
					onClick={() => onToggleNode(node.id)}
				>
					<ChevronRight
						size={13}
						className={cn("transition-transform", expanded && "rotate-90")}
					/>
				</button>
				<button
					type="button"
					className={cn(
						"flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-xs",
						selectedNodeId === node.id
							? "bg-primary/18 text-primary"
							: "text-foreground/62 hover:bg-foreground/7 hover:text-foreground",
					)}
					onClick={() => onSelectNode(node.id)}
				>
					<Boxes size={13} className="shrink-0" />
					<span className="truncate">{node.id}</span>
					<span className="ml-auto shrink-0 text-[9px] text-foreground/32">
						{node.children.length}
					</span>
				</button>
			</div>
			{expanded ? (
				<div className="ml-3 border-foreground/10 border-l pl-2">
					{node.children.map((child) =>
						child.type === "node" ? (
							<NodeTreeBranch
								key={child.nodeId}
								block={block}
								expandedNodeIds={expandedNodeIds}
								fragmentsById={fragmentsById}
								nodeId={child.nodeId}
								nodesById={nodesById}
								selectedNodeId={selectedNodeId}
								onInspectFragment={onInspectFragment}
								onSelectNode={onSelectNode}
								onToggleNode={onToggleNode}
							/>
						) : (
							<FragmentTreeButton
								key={child.fragmentId}
								block={block}
								fragmentsById={fragmentsById}
								fragmentId={child.fragmentId}
								onInspectFragment={onInspectFragment}
							/>
						),
					)}
				</div>
			) : null}
		</div>
	);
}

/**
 * Renders a fragment child in the node hierarchy.
 *
 * @param props - Fragment ownership and inspection callback.
 * @returns Fragment tree control.
 */
function FragmentTreeButton({
	block,
	fragmentsById,
	fragmentId,
	onInspectFragment,
}: {
	block: ResolvedTaleBlock;
	fragmentsById: Record<string, ResolvedTaleFragment>;
	fragmentId: string;
	onInspectFragment: (fragmentId: string) => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			className="flex w-full min-w-0 items-center gap-2 rounded px-9 py-1.5 text-left text-[11px] text-foreground/48 hover:bg-foreground/7 hover:text-foreground"
			onClick={() => onInspectFragment(fragmentId)}
		>
			<FileText size={12} className="shrink-0" />
			<span className="truncate">
				{fragmentsById[fragmentId]?.type ?? "fragment"} · {fragmentId}
			</span>
		</button>
	);
}

/**
 * Collects node ids reachable through authored child relationships.
 *
 * @param block - Block containing indexed nodes.
 * @param rootNodeId - Node from which traversal starts.
 * @returns Reachable node id set.
 */
function collectReachableNodeIds(
	nodesById: Record<string, TaleNode>,
	rootNodeId: string,
): Set<string> {
	const reachable = new Set<string>();
	const visit = (nodeId: string): void => {
		if (reachable.has(nodeId)) return;
		reachable.add(nodeId);
		const node = nodesById[nodeId];
		for (const child of node?.children ?? []) {
			if (child.type === "node") visit(child.nodeId);
		}
	};
	visit(rootNodeId);
	return reachable;
}
