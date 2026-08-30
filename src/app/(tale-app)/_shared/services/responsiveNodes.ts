import type {
	TaleBlock,
	TaleBlockResponsiveOverride,
	TaleNode,
} from "../types";
import { resolveIds } from "./taleLookups";

type PersistedResponsiveOverride = TaleBlockResponsiveOverride & {
	nodes?: TaleNode[];
};

export function normalizeResponsiveBlockNodes(block: TaleBlock): {
	block: TaleBlock;
	nodes: TaleNode[];
} {
	const nodes: TaleNode[] = [];
	const responsiveOverrides = Object.fromEntries(
		Object.entries(block.responsiveOverrides ?? {}).map(
			([breakpointId, value]) => {
				const { nodes: persistedNodes, ...override } =
					value as PersistedResponsiveOverride;
				if (!persistedNodes?.length) return [breakpointId, override];

				const idBySourceId = new Map(
					persistedNodes.map((node) => [
						node.id,
						responsiveNodeId(block.id, breakpointId, node.id),
					]),
				);
				const normalizedNodes = persistedNodes.map((node) => ({
					...node,
					children: node.children.map((child) =>
						child.type === "node"
							? {
									...child,
									nodeId: idBySourceId.get(child.nodeId) ?? child.nodeId,
								}
							: child,
					),
					id: idBySourceId.get(node.id) ?? node.id,
					parentNodeId: node.parentNodeId
						? (idBySourceId.get(node.parentNodeId) ?? node.parentNodeId)
						: null,
				})) as TaleNode[];
				nodes.push(...normalizedNodes);
				return [
					breakpointId,
					{
						...override,
						nodeIds: normalizedNodes.map((node) => node.id),
						rootNodeId: override.rootNodeId
							? (idBySourceId.get(override.rootNodeId) ?? override.rootNodeId)
							: undefined,
					},
				];
			},
		),
	) as Record<string, TaleBlockResponsiveOverride>;

	return {
		block: { ...block, responsiveOverrides },
		nodes,
	};
}

export function serializeResponsiveBlockNodes(
	block: TaleBlock,
	nodesById: Record<string, TaleNode>,
): Record<string, PersistedResponsiveOverride> {
	return Object.fromEntries(
		Object.entries(block.responsiveOverrides ?? {}).map(
			([breakpointId, value]) => {
				if (!value.nodeIds?.length) return [breakpointId, value];
				const prefix = responsiveNodePrefix(block.id, breakpointId);
				const nodes = resolveIds(value.nodeIds, nodesById).map((node) => ({
					...node,
					children: node.children.map((child) =>
						child.type === "node"
							? { ...child, nodeId: removePrefix(child.nodeId, prefix) }
							: child,
					),
					id: removePrefix(node.id, prefix),
					parentNodeId: node.parentNodeId
						? removePrefix(node.parentNodeId, prefix)
						: null,
				})) as TaleNode[];
				const { nodeIds: _nodeIds, ...override } = value;
				return [
					breakpointId,
					{
						...override,
						nodes,
						rootNodeId: override.rootNodeId
							? removePrefix(override.rootNodeId, prefix)
							: undefined,
					},
				];
			},
		),
	);
}

export function scopeResponsiveNodes(
	blockId: string,
	breakpointId: string,
	nodes: TaleNode[],
	rootNodeId: string,
): { nodes: TaleNode[]; rootNodeId: string } {
	const prefix = responsiveNodePrefix(blockId, breakpointId);
	const idBySourceId = new Map(
		nodes.map((node) => [
			node.id,
			node.id.startsWith(prefix) ? node.id : `${prefix}${node.id}`,
		]),
	);
	return {
		nodes: nodes.map((node) => ({
			...node,
			children: node.children.map((child) =>
				child.type === "node"
					? { ...child, nodeId: idBySourceId.get(child.nodeId) ?? child.nodeId }
					: child,
			),
			id: idBySourceId.get(node.id) ?? node.id,
			parentNodeId: node.parentNodeId
				? (idBySourceId.get(node.parentNodeId) ?? node.parentNodeId)
				: null,
		})) as TaleNode[],
		rootNodeId: idBySourceId.get(rootNodeId) ?? rootNodeId,
	};
}

function responsiveNodeId(
	blockId: string,
	breakpointId: string,
	nodeId: string,
): string {
	return `${responsiveNodePrefix(blockId, breakpointId)}${nodeId}`;
}

function responsiveNodePrefix(blockId: string, breakpointId: string): string {
	return `responsive:${blockId}:${breakpointId}:`;
}

function removePrefix(value: string, prefix: string): string {
	return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}
