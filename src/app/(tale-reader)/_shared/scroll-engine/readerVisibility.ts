import type { Anchor, CompiledReader } from "../types";

/**
 * Returns the active anchor and its immediate route neighbors.
 *
 * @param compiled - Compiled reader route.
 * @param anchor - Active anchor.
 * @returns Nearby anchors in route order.
 */
export function getAdjacentAnchors(
	compiled: CompiledReader,
	anchor: Anchor,
): Anchor[] {
	const index = compiled.anchorIndexByBlockId[anchor.block.id];
	if (index === undefined) return [anchor];
	return compiled.anchors.slice(
		Math.max(0, index - 1),
		Math.min(compiled.anchors.length, index + 2),
	);
}

/**
 * Removes duplicate anchors while preserving order.
 *
 * @param anchors - Candidate anchors.
 * @returns Unique anchors.
 */
export function getUniqueAnchors(anchors: Anchor[]): Anchor[] {
	const seen = new Set<string>();
	return anchors.filter((anchor) => {
		if (seen.has(anchor.block.id)) return false;
		seen.add(anchor.block.id);
		return true;
	});
}

/**
 * Resolves the mounted block window around visible anchors.
 *
 * @param compiled - Compiled reader route.
 * @param anchors - Currently visible anchors.
 * @param overscan - Additional blocks mounted on each side.
 * @returns Block ids to mount.
 */
export function getRenderWindowBlockIds(
	compiled: CompiledReader,
	anchors: Anchor[],
	overscan: number,
): string[] {
	const indices = anchors.flatMap((anchor) => {
		const index = compiled.anchorIndexByBlockId[anchor.block.id];
		return index === undefined ? [] : [index];
	});
	const first = Math.max(0, Math.min(...indices) - overscan);
	const last = Math.min(
		compiled.anchors.length - 1,
		Math.max(...indices) + overscan,
	);
	return compiled.anchors
		.slice(first, last + 1)
		.map((anchor) => anchor.block.id);
}

/**
 * Applies visibility and stacking to currently mounted reader blocks.
 *
 * @param stage - Reader stage containing block elements.
 * @param progressRoot - Root containing fixed fragment layers.
 * @param anchors - Blocks that should remain visible.
 * @param foregroundBlockIds - Visible blocks that should paint above neighbors.
 * @returns Nothing.
 */
export function paintVisibleAnchors(
	stage: HTMLElement,
	progressRoot: HTMLElement | null,
	anchors: Anchor[],
	foregroundBlockIds: Set<string>,
): void {
	const visibleIds = new Set(anchors.map((anchor) => anchor.block.id));
	const mounted = stage.querySelectorAll<HTMLElement>("[data-reader-block-id]");
	for (const element of mounted) {
		const blockId = element.dataset.readerBlockId;
		if (!blockId) continue;
		const visible = visibleIds.has(blockId);
		element.style.visibility = visible ? "visible" : "hidden";
		element.style.pointerEvents = visible ? "auto" : "none";
		element.style.zIndex = visible
			? foregroundBlockIds.has(blockId)
				? "20"
				: "5"
			: "0";
		for (const fixedElement of fixedElements(progressRoot, blockId)) {
			fixedElement.style.visibility = visible ? "visible" : "hidden";
			fixedElement.style.pointerEvents = visible ? "auto" : "none";
		}
	}
}

/**
 * Finds fixed fragment layers for one block.
 *
 * @param progressRoot - Reader DOM root.
 * @param blockId - Owning block id.
 * @returns Fixed layer elements.
 */
function fixedElements(
	progressRoot: HTMLElement | null,
	blockId: string,
): HTMLElement[] {
	return Array.from(
		progressRoot?.querySelectorAll<HTMLElement>(
			`[data-reader-fixed-block-id="${blockId}"]`,
		) ?? [],
	);
}
