import type { Anchor, CompiledReader } from "../types";
import type { ReaderDomRegistry } from "./readerDomRegistry";

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
 * Creates a visibility painter that updates mounted blocks only when the
 * visible set, foreground set, or DOM registry changes.
 *
 * @param registry - Direct references to mounted reader elements.
 * @returns Cached visibility painter.
 */
export function createReaderVisibilityPainter(
	registry: ReaderDomRegistry,
): (anchors: Anchor[], foregroundBlockIds: Set<string>) => void {
	let previousKey = "";

	return (anchors, foregroundBlockIds): void => {
		const visibleIds = new Set(anchors.map((anchor) => anchor.block.id));
		const visibleKey = anchors.map((anchor) => anchor.block.id).join("|");
		const foregroundKey = [...foregroundBlockIds].join("|");
		const key = `${registry.getRevision()}:${visibleKey}:${foregroundKey}`;
		if (key === previousKey) return;
		previousKey = key;

		for (const [blockId, element] of registry.blockElementById) {
			const visible = visibleIds.has(blockId);
			const visibility = visible ? "visible" : "hidden";
			const pointerEvents = visible ? "auto" : "none";
			const zIndex = visible
				? foregroundBlockIds.has(blockId)
					? "20"
					: "5"
				: "0";
			if (element.style.visibility !== visibility) {
				element.style.visibility = visibility;
			}
			if (element.style.pointerEvents !== pointerEvents) {
				element.style.pointerEvents = pointerEvents;
			}
			if (element.style.zIndex !== zIndex) element.style.zIndex = zIndex;

			for (const fixedElement of registry.fixedElementsByBlockId.get(blockId) ??
				[]) {
				if (fixedElement.style.visibility !== visibility) {
					fixedElement.style.visibility = visibility;
				}
				if (fixedElement.style.pointerEvents !== pointerEvents) {
					fixedElement.style.pointerEvents = pointerEvents;
				}
			}
		}
	};
}
