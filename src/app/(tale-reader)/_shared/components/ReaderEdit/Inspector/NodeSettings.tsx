import type { ResolvedTaleBlock, TaleNode } from "../../../types";
import {
	DebugCard,
	DebugField,
	Setting,
	settingClassName,
} from "../../ReaderUi/TaleDebug/DebugPrimitives";
import { NumberSetting } from "./InspectorValueFields";
import { StyleSettings } from "./StyleSettings";

/**
 * Edits the layout nodes owned by a block.
 *
 * @param props - Component props.
 * @param props.block - Current block.
 * @param props.onChange - Receives updated nodes and root id.
 * @returns Node tree controls.
 */
export function NodeSettings({
	block,
	onChange,
}: {
	block: ResolvedTaleBlock;
	onChange: (nodes: TaleNode[], rootNodeId: string) => void;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="NodeSettings"
			data-reader-role="node-settings"
			className="space-y-3"
		>
			<DebugCard title="Node tree">
				<DebugField label="Root" value={block.rootNodeId} />
				<DebugField label="Nodes" value={String(block.nodes.length)} />
			</DebugCard>
			{block.nodes.map((node) => (
				<NodeEditor
					key={node.id}
					node={node}
					nodes={block.nodes}
					onChange={(next) =>
						onChange(
							block.nodes.map((item) => (item.id === node.id ? next : item)),
							block.rootNodeId,
						)
					}
				/>
			))}
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
}: {
	node: TaleNode;
	nodes: TaleNode[];
	onChange: (node: TaleNode) => void;
}): React.JSX.Element {
	return (
		<section
			data-reader-component="NodeEditor"
			data-reader-role="node-settings-card"
			className="rounded-md border border-white/10 bg-white/[0.035] p-3"
		>
			<div className="mb-3 flex items-center justify-between gap-2">
				<h3 className="truncate font-black text-[#d9b56f] text-[10px] uppercase">
					{node.id}
				</h3>
				<span className="text-white/38 text-xs">
					{node.children.length} children
				</span>
			</div>
			<div className="grid grid-cols-2 gap-2">
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
						value={node.parentNodeId ?? ""}
						onChange={(event) =>
							onChange({
								...node,
								parentNodeId: event.target.value || null,
							} as TaleNode)
						}
					>
						<option value="">None</option>
						{nodes
							.filter((item) => item.id !== node.id)
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
			<StyleSettings
				className="mt-3"
				style={node.style}
				title="Node style"
				onChange={(style) => onChange({ ...node, style } as TaleNode)}
			/>
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
