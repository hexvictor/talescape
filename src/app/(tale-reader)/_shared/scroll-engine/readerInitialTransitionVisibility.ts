import type { Anchor, CompiledReader } from "../types";

/**
 * Keeps the initial entrance empty until the first block reaches the viewport,
 * then reveals only the contiguous visible route prefix.
 *
 * @param compiled - Compiled route containing stable anchor order.
 * @param spatialAnchors - Anchors currently intersecting the viewport.
 * @returns Visible initial-route anchors in story order.
 *
 * @example
 * const visible = getInitialTransitionVisibleAnchors(compiled, spatial);
 */
export function getInitialTransitionVisibleAnchors(
	compiled: CompiledReader,
	spatialAnchors: readonly Anchor[],
): Anchor[] {
	const spatialBlockIds = new Set(
		spatialAnchors.map((anchor) => anchor.block.id),
	);
	const firstAnchor = compiled.anchors[0];
	if (!firstAnchor || !spatialBlockIds.has(firstAnchor.block.id)) return [];

	const visibleAnchors: Anchor[] = [];
	for (const anchor of compiled.anchors) {
		if (!spatialBlockIds.has(anchor.block.id)) break;
		visibleAnchors.push(anchor);
	}
	return visibleAnchors;
}
