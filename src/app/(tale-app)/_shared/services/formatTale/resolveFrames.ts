import type { ResolvedTaleElement, TaleFrame, TaleScene } from "../../types";

export type ElementPlacementBuckets = ReturnType<
	typeof createElementPlacementBuckets
>;

/**
 * Groups fragments by the renderer layer they require.
 *
 * @param fragments - Resolved block fragments.
 * @returns Placement buckets consumed by block rendering.
 */
export function createElementPlacementBuckets(
	fragments: ResolvedTaleElement[],
) {
	const placedFragments = fragments.filter(
		(fragment) => fragment.placement.mode === "absolute",
	);
	return {
		clippedElementIds: placedFragments
			.filter((fragment) => fragment.placement.overflow !== "visible")
			.map((fragment) => fragment.id),
		fixedElementIds: fragments
			.filter((fragment) => fragment.placement.mode === "fixed")
			.map((fragment) => fragment.id),
		flowElementIds: fragments
			.filter(
				(fragment) =>
					fragment.placement.mode !== "absolute" &&
					fragment.placement.mode !== "fixed",
			)
			.map((fragment) => fragment.id),
		overflowingElementIds: placedFragments
			.filter((fragment) => fragment.placement.overflow === "visible")
			.map((fragment) => fragment.id),
		placedElementIds: placedFragments.map((fragment) => fragment.id),
	};
}

/**
 * Resolves authored nodes or creates a minimal root layout.
 *
 * @param block - Raw block configuration.
 * @param buckets - Fragment placement buckets.
 * @returns Node tree and root node id.
 */
export function resolveSceneFrames(
	block: TaleScene,
	buckets: ElementPlacementBuckets,
	framesById: Record<string, TaleFrame>,
): { frames: TaleFrame[]; rootFrameId: string } {
	const authoredNodes = block.frameIds.flatMap((frameId) => {
		const node = framesById[frameId];
		return node ? [node] : [];
	});
	if (block.container) return { frames: normalizeFrameElementIds(authoredNodes, block.elementIds), rootFrameId: "" };
	if (authoredNodes.length) {
		const frames = normalizeFrameElementIds(authoredNodes, block.elementIds);
		return {
			frames,
			rootFrameId:
				block.rootFrameId ??
				frames.find((frame) => !frame.parentFrameId)?.id ??
				"root",
		};
	}

	const hasPlaced = buckets.placedElementIds.length > 0;
	const rootFrameId = `${block.id}:root`;
	const flowFrameId = `${block.id}:flow`;
	const root: TaleFrame = {
		align: "center",
		animations: emptyFrameAnimations(),
		children: hasPlaced
			? [{ frameId: flowFrameId, type: "frame" }]
			: groupChildren(buckets.flowElementIds),
		gap: 18,
		id: rootFrameId,
		justify: "center",
		mode: "stack",
		overflow: "visible",
		parentFrameId: null,
	};
	const frames = [root];
	if (hasPlaced) {
		frames.push({
			align: "center",
			animations: emptyFrameAnimations(),
			children: groupChildren(buckets.flowElementIds),
			gap: 16,
			id: flowFrameId,
			justify: "center",
			mode: "stack",
			overflow: "visible",
			parentFrameId: rootFrameId,
			style: { padding: 24 },
		});
	}
	return { frames, rootFrameId };
}

/**
 * Creates empty animation selections for generated fallback nodes.
 *
 * @returns Empty node animation configuration.
 */
function emptyFrameAnimations(): TaleFrame["animations"] {
	return {
		ambient: { animations: [] },
		intro: { animations: [] },
		outro: { animations: [] },
		active: { animations: [] },
	};
}

function groupChildren(elementIds: string[]) {
	return elementIds.map((elementId) => ({
		elementId,
		type: "element" as const,
	}));
}

function normalizeFrameElementIds(
	nodes: TaleFrame[],
	elementIds: string[],
): TaleFrame[] {
	const validIds = new Set(elementIds);
	const nodeElementIds = collectFrameElementIds(nodes);
	if (!nodeElementIds.some((id) => !validIds.has(id))) return nodes;

	let index = 0;
	return nodes.map((node) => ({
		...node,
		children: node.children.map((child) => {
			if (child.type === "frame") return child;
			const elementId = elementIds[index] ?? child.elementId;
			index += 1;
			return { ...child, elementId };
		}),
	}));
}

function collectFrameElementIds(nodes: TaleFrame[]): string[] {
	const framesById = Object.fromEntries(nodes.map((node) => [node.id, node]));
	const collectChildren = (children: TaleFrame["children"]): string[] =>
		children.flatMap((child) => {
			if (child.type === "element") return [child.elementId];
			const node = framesById[child.frameId];
			return node ? collectChildren(node.children) : [];
		});
	return nodes.flatMap((node) => collectChildren(node.children));
}
