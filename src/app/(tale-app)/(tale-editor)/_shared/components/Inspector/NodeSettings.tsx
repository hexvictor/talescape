import { useState } from "react";
import {
	DebugCard,
	DebugField,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type {
	ResolvedTaleBlock,
	TaleNode,
} from "~/app/(tale-app)/_shared/types";
import { AnimationSelectionEditor } from "./AnimationSelectionEditor";
import { NumberSetting } from "./InspectorValueFields";
import { LoopingAnimationEditor } from "./LoopingAnimationEditor";
import { NodeHierarchyTree } from "./NodeHierarchyTree";
import { StyleSettings } from "./StyleSettings";

/**
 * Edits the layout nodes owned by a block.
 *
 * @param props - Component props.
 * @param props.block - Current block.
 * @param props.initialNodeId - Optional node id selected by a preview inspector click.
 * @param props.onChange - Receives updated nodes and root id.
 * @returns Node tree controls.
 */
export function NodeSettings({
	block,
	initialNodeId,
	onChange,
}: {
	block: ResolvedTaleBlock;
	initialNodeId?: string;
	onChange: (nodes: TaleNode[], rootNodeId: string) => void;
}): React.JSX.Element {
	const rootNode = block.nodesById[block.rootNodeId] ?? block.nodes[0];
	const firstEditableNode = rootNode?.children.find(
		(child) => child.type === "node",
	);
	const [selectedNodeId, setSelectedNodeId] = useState(
		initialNodeId ??
			(firstEditableNode?.type === "node"
				? firstEditableNode.nodeId
				: block.rootNodeId),
	);
	const selectedNode =
		block.nodesById[selectedNodeId] ??
		block.nodesById[block.rootNodeId] ??
		block.nodes[0];

	const updateNode = (nextNode: TaleNode): void => {
		onChange(
			block.nodes.map((node) => (node.id === nextNode.id ? nextNode : node)),
			block.rootNodeId,
		);
	};
	const moveNode = (nodeId: string, parentNodeId: string | null): void => {
		const movedNodes = block.nodes.map((node) => ({
			...node,
			children: node.children.filter(
				(child) => child.type !== "node" || child.nodeId !== nodeId,
			),
			parentNodeId: node.id === nodeId ? parentNodeId : node.parentNodeId,
		})) as TaleNode[];
		if (parentNodeId) {
			const parentIndex = movedNodes.findIndex(
				(node) => node.id === parentNodeId,
			);
			const parent = movedNodes[parentIndex];
			if (parent) {
				movedNodes[parentIndex] = {
					...parent,
					children: [...parent.children, { nodeId, type: "node" }],
				} as TaleNode;
			}
		}
		onChange(movedNodes, block.rootNodeId);
	};

	return (
		<div
			data-reader-component="NodeSettings"
			data-reader-role="node-settings"
			className="space-y-3"
		>
			<DebugCard title="Root layout">
				<DebugField label="Nodes" value={String(block.nodes.length)} />
			</DebugCard>
			{rootNode ? (
				<NodeEditor
					key={rootNode.id}
					node={rootNode}
					nodes={block.nodes}
					rootNodeId={block.rootNodeId}
					onChange={updateNode}
					onParentChange={() => undefined}
				/>
			) : null}
			<NodeHierarchyTree
				block={block}
				selectedNodeId={selectedNode?.id ?? block.rootNodeId}
				onSelectNode={setSelectedNodeId}
			/>
			{selectedNode && selectedNode.id !== block.rootNodeId ? (
				<NodeEditor
					key={selectedNode.id}
					node={selectedNode}
					nodes={block.nodes}
					rootNodeId={block.rootNodeId}
					onChange={updateNode}
					onParentChange={(parentNodeId) =>
						moveNode(selectedNode.id, parentNodeId)
					}
				/>
			) : null}
		</div>
	);
}

/**
 * Edits one node's hierarchy, layout, and style.
 *
 * @param props - Component props.
 * @param props.node - Current node.
 * @param props.nodes - Available parent nodes.
 * @param props.onChange - Receives the updated node.
 * @returns Node editor.
 */
function NodeEditor({
	node,
	nodes,
	onChange,
	onParentChange,
	rootNodeId,
}: {
	node: TaleNode;
	nodes: TaleNode[];
	onChange: (node: TaleNode) => void;
	onParentChange: (parentNodeId: string | null) => void;
	rootNodeId: string;
}): React.JSX.Element {
	const descendantNodeIds = collectDescendantNodeIds(nodes, node.id);
	const [styleOpen, setStyleOpen] = useState(true);
	const [animationOpen, setAnimationOpen] = useState(false);
	return (
		<section
			data-reader-component="NodeEditor"
			data-reader-role="node-settings-card"
			className="rounded-md border border-foreground/10 bg-foreground/[0.035] p-3"
		>
			<div className="mb-3 flex items-center justify-between gap-2">
				<h3 className="truncate font-black text-[10px] text-primary uppercase">
					{node.id}
				</h3>
				<span className="text-foreground/38 text-xs">
					{node.children.length} children
				</span>
			</div>
			<div className="@container/inspector-group grid min-w-0 @min-[32rem]/inspector-group:grid-cols-2 grid-cols-1 gap-2">
				<Setting label="Display mode">
					<select
						className={settingClassName}
						value={node.mode}
						onChange={(event) =>
							onChange(
								changeNodeMode(node, event.target.value as TaleNode["mode"]),
							)
						}
					>
						<option value="stack">Stack</option>
						<option value="flex">Flex</option>
						<option value="grid">Grid</option>
						<option value="free">Free</option>
					</select>
				</Setting>
				<Setting label="Parent node">
					<select
						className={settingClassName}
						disabled={node.id === rootNodeId}
						value={node.parentNodeId ?? ""}
						onChange={(event) => onParentChange(event.target.value || null)}
					>
						<option value="">None</option>
						{nodes
							.filter(
								(item) =>
									item.id !== node.id && !descendantNodeIds.has(item.id),
							)
							.map((item) => (
								<option key={item.id} value={item.id}>
									{item.id}
								</option>
							))}
					</select>
				</Setting>
				<NumberSetting
					label="Gap"
					value={"gap" in node ? (node.gap ?? 0) : 0}
					onChange={(gap) => onChange({ ...node, gap } as TaleNode)}
				/>
				<Setting label="Overflow">
					<select
						className={settingClassName}
						value={node.overflow ?? "visible"}
						onChange={(event) =>
							onChange({
								...node,
								overflow: event.target.value as "clip" | "visible",
							} as TaleNode)
						}
					>
						<option value="visible">Visible</option>
						<option value="clip">Clip</option>
					</select>
				</Setting>
			</div>
			<CollapsibleNodeSection
				open={styleOpen}
				title="Node style"
				onToggle={() => setStyleOpen((open) => !open)}
			>
				<StyleSettings
					className="mt-3"
					layoutMode={node.mode}
					style={node.style}
					title="Node style"
					onChange={(style) => onChange({ ...node, style } as TaleNode)}
				/>
			</CollapsibleNodeSection>
			<CollapsibleNodeSection
				open={animationOpen}
				title="Node animations"
				onToggle={() => setAnimationOpen((open) => !open)}
			>
				<div className="mt-3 space-y-3">
					<AnimationSelectionEditor
						title="Entering"
						selection={node.animations.entering}
						onChange={(entering) =>
							onChange({
								...node,
								animations: { ...node.animations, entering },
							} as TaleNode)
						}
					/>
					<AnimationSelectionEditor
						title="Scrolling"
						selection={node.animations.scrolling}
						onChange={(scrolling) =>
							onChange({
								...node,
								animations: { ...node.animations, scrolling },
							} as TaleNode)
						}
					/>
					<AnimationSelectionEditor
						title="Leaving"
						selection={node.animations.leaving}
						onChange={(leaving) =>
							onChange({
								...node,
								animations: { ...node.animations, leaving },
							} as TaleNode)
						}
					/>
					<LoopingAnimationEditor
						selection={node.animations.ambient}
						onChange={(ambient) =>
							onChange({
								...node,
								animations: { ...node.animations, ambient },
							} as TaleNode)
						}
					/>
				</div>
			</CollapsibleNodeSection>
		</section>
	);
}

/**
 * Renders a collapsible node editor group.
 *
 * @param props - Section props.
 * @param props.children - Collapsible content.
 * @param props.onToggle - Toggles the content.
 * @param props.open - Whether content is visible.
 * @param props.title - Section title.
 * @returns Collapsible node section.
 *
 * @example
 * <CollapsibleNodeSection title="Node style" open onToggle={toggle}>...</CollapsibleNodeSection>
 */
function CollapsibleNodeSection({
	children,
	onToggle,
	open,
	title,
}: {
	children: React.ReactNode;
	onToggle: () => void;
	open: boolean;
	title: string;
}): React.JSX.Element {
	return (
		<section className="mt-3 rounded border border-foreground/8 bg-background/20 p-2">
			<button
				type="button"
				className="flex w-full items-center justify-between text-left font-bold text-[10px] text-foreground/56 uppercase hover:text-foreground"
				onClick={onToggle}
			>
				{title}
				<span>{open ? "Hide" : "Show"}</span>
			</button>
			{open ? children : null}
		</section>
	);
}

/**
 * Converts a node to another display mode while preserving shared fields.
 *
 * @param node - Current node.
 * @param mode - Target display mode.
 * @returns Mode-compatible node.
 */
function changeNodeMode(node: TaleNode, mode: TaleNode["mode"]): TaleNode {
	const base = {
		animations: node.animations,
		children: node.children,
		id: node.id,
		overflow: node.overflow,
		parentNodeId: node.parentNodeId,
		style: node.style,
	};
	if (mode === "flex") return { ...base, direction: "column", gap: 16, mode };
	if (mode === "grid") return { ...base, columns: 2, gap: 16, mode };
	if (mode === "free") return { ...base, mode };
	return { ...base, align: "center", gap: 16, justify: "center", mode };
}

/**
 * Collects node descendants that cannot become the node's parent.
 *
 * @param nodes - Nodes in the current block.
 * @param nodeId - Node whose descendants are collected.
 * @returns Descendant node ids.
 *
 * @example
 * const descendants = collectDescendantNodeIds(nodes, node.id);
 */
function collectDescendantNodeIds(
	nodes: TaleNode[],
	nodeId: string,
): Set<string> {
	const nodesById = new Map(nodes.map((node) => [node.id, node]));
	const descendants = new Set<string>();
	const visit = (currentNodeId: string): void => {
		for (const child of nodesById.get(currentNodeId)?.children ?? []) {
			if (child.type !== "node" || descendants.has(child.nodeId)) continue;
			descendants.add(child.nodeId);
			visit(child.nodeId);
		}
	};
	visit(nodeId);
	return descendants;
}
