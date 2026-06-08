import type { ResolvedTaleFragment, TaleBlock, TaleNode } from "../../types";
import { recordById } from "./shared";

export type FragmentPlacementBuckets = ReturnType<
	typeof createFragmentPlacementBuckets
>;

/**
 * Groups fragments by the renderer layer they require.
 *
 * @param fragments - Resolved block fragments.
 * @returns Placement buckets consumed by block rendering.
 */
export function createFragmentPlacementBuckets(
	fragments: ResolvedTaleFragment[],
) {
	const placedFragments = fragments.filter(
		(fragment) => fragment.placement.mode === "absolute",
	);
	return {
		clippedFragments: placedFragments.filter(
			(fragment) => fragment.placement.overflow !== "visible",
		),
		fixedFragments: fragments.filter(
			(fragment) => fragment.placement.mode === "fixed",
		),
		flowFragments: fragments.filter(
			(fragment) =>
				fragment.placement.mode !== "absolute" &&
				fragment.placement.mode !== "fixed",
		),
		overflowingFragments: placedFragments.filter(
			(fragment) => fragment.placement.overflow === "visible",
		),
		placedFragments,
	};
}

/**
 * Resolves authored nodes or creates a minimal root layout.
 *
 * @param block - Raw block configuration.
 * @param buckets - Fragment placement buckets.
 * @returns Node tree and root node id.
 */
export function resolveBlockNodes(
	block: TaleBlock,
	buckets: FragmentPlacementBuckets,
): { nodes: TaleNode[]; rootNodeId: string } {
	if (block.nodes?.length) {
		const nodes = normalizeNodeFragmentIds(block.nodes, block.fragmentIds);
		return {
			nodes,
			rootNodeId:
				block.rootNodeId ??
				nodes.find((node) => !node.parentNodeId)?.id ??
				"root",
		};
	}

	const hasPlaced = buckets.placedFragments.length > 0;
	const root: TaleNode = {
		align: "center",
		children: hasPlaced
			? [{ nodeId: "flow", type: "node" }]
			: groupChildren(buckets.flowFragments.map((item) => item.id)),
		gap: 18,
		id: "root",
		justify: "center",
		mode: "stack",
		overflow: "visible",
		parentNodeId: null,
	};
	const nodes = [root];
	if (hasPlaced) {
		nodes.push({
			align: "center",
			children: groupChildren(buckets.flowFragments.map((item) => item.id)),
			gap: 16,
			id: "flow",
			justify: "center",
			mode: "stack",
			overflow: "visible",
			parentNodeId: "root",
			style: { padding: 24 },
		});
	}
	return { nodes, rootNodeId: "root" };
}

function groupChildren(fragmentIds: string[]) {
	return fragmentIds.map((fragmentId) => ({
		fragmentId,
		type: "fragment" as const,
	}));
}

function normalizeNodeFragmentIds(
	nodes: TaleNode[],
	fragmentIds: string[],
): TaleNode[] {
	const validIds = new Set(fragmentIds);
	const nodeFragmentIds = collectNodeFragmentIds(nodes);
	if (!nodeFragmentIds.some((id) => !validIds.has(id))) return nodes;

	let index = 0;
	return nodes.map((node) => ({
		...node,
		children: node.children.map((child) => {
			if (child.type === "node") return child;
			const fragmentId = fragmentIds[index] ?? child.fragmentId;
			index += 1;
			return { ...child, fragmentId };
		}),
	}));
}

function collectNodeFragmentIds(nodes: TaleNode[]): string[] {
	const nodesById = recordById(nodes);
	const collectChildren = (children: TaleNode["children"]): string[] =>
		children.flatMap((child) => {
			if (child.type === "fragment") return [child.fragmentId];
			const node = nodesById[child.nodeId];
			return node ? collectChildren(node.children) : [];
		});
	return nodes.flatMap((node) => collectChildren(node.children));
}
