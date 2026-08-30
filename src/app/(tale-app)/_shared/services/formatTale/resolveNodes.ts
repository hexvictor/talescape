import type { ResolvedTaleFragment, TaleBlock, TaleNode } from "../../types";

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
		clippedFragmentIds: placedFragments
			.filter((fragment) => fragment.placement.overflow !== "visible")
			.map((fragment) => fragment.id),
		fixedFragmentIds: fragments
			.filter((fragment) => fragment.placement.mode === "fixed")
			.map((fragment) => fragment.id),
		flowFragmentIds: fragments
			.filter(
				(fragment) =>
					fragment.placement.mode !== "absolute" &&
					fragment.placement.mode !== "fixed",
			)
			.map((fragment) => fragment.id),
		overflowingFragmentIds: placedFragments
			.filter((fragment) => fragment.placement.overflow === "visible")
			.map((fragment) => fragment.id),
		placedFragmentIds: placedFragments.map((fragment) => fragment.id),
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
	nodesById: Record<string, TaleNode>,
): { nodes: TaleNode[]; rootNodeId: string } {
	const authoredNodes = block.nodeIds.flatMap((nodeId) => {
		const node = nodesById[nodeId];
		return node ? [node] : [];
	});
	if (authoredNodes.length) {
		const nodes = normalizeNodeFragmentIds(authoredNodes, block.fragmentIds);
		return {
			nodes,
			rootNodeId:
				block.rootNodeId ??
				nodes.find((node) => !node.parentNodeId)?.id ??
				"root",
		};
	}

	const hasPlaced = buckets.placedFragmentIds.length > 0;
	const rootNodeId = `${block.id}:root`;
	const flowNodeId = `${block.id}:flow`;
	const root: TaleNode = {
		align: "center",
		animations: emptyNodeAnimations(),
		children: hasPlaced
			? [{ nodeId: flowNodeId, type: "node" }]
			: groupChildren(buckets.flowFragmentIds),
		gap: 18,
		id: rootNodeId,
		justify: "center",
		mode: "stack",
		overflow: "visible",
		parentNodeId: null,
	};
	const nodes = [root];
	if (hasPlaced) {
		nodes.push({
			align: "center",
			animations: emptyNodeAnimations(),
			children: groupChildren(buckets.flowFragmentIds),
			gap: 16,
			id: flowNodeId,
			justify: "center",
			mode: "stack",
			overflow: "visible",
			parentNodeId: rootNodeId,
			style: { padding: 24 },
		});
	}
	return { nodes, rootNodeId };
}

/**
 * Creates empty animation selections for generated fallback nodes.
 *
 * @returns Empty node animation configuration.
 */
function emptyNodeAnimations(): TaleNode["animations"] {
	return {
		ambient: { animations: [] },
		entering: { animations: [] },
		leaving: { animations: [] },
		scrolling: { animations: [] },
	};
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
	const nodesById = Object.fromEntries(nodes.map((node) => [node.id, node]));
	const collectChildren = (children: TaleNode["children"]): string[] =>
		children.flatMap((child) => {
			if (child.type === "fragment") return [child.fragmentId];
			const node = nodesById[child.nodeId];
			return node ? collectChildren(node.children) : [];
		});
	return nodes.flatMap((node) => collectChildren(node.children));
}
