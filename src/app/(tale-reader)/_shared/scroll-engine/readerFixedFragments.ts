import { getReadingCamera } from "../services/readerGeometry";
import type { Anchor, TimelineSegment, ViewportSize } from "../types";
import type { ReaderDomRegistry } from "./readerDomRegistry";

/**
 * Creates a painter that keeps fixed layers aligned to each block's local
 * reading viewport while allowing transitions to move the layer with the block.
 *
 * @param registry - Mounted reader DOM element registry.
 * @param viewport - Current reader viewport dimensions.
 * @returns Fixed-layer paint function.
 *
 * @example
 * const paintFixedLayers = createReaderFixedFragmentPainter(registry, viewport);
 */
export function createReaderFixedFragmentPainter(
	registry: ReaderDomRegistry,
	viewport: ViewportSize,
): (
	anchor: Anchor,
	activeAnchor: Anchor,
	segment: TimelineSegment,
	segmentProgress: number,
) => void {
	const transformByElement = new WeakMap<HTMLElement, string>();

	return (anchor, activeAnchor, segment, segmentProgress): void => {
		const elements = registry.fixedElementsByBlockId.get(anchor.block.id);
		if (!elements?.size) return;
		const readingProgress = getFixedReadingProgress(
			anchor,
			activeAnchor,
			segment,
			segmentProgress,
		);
		const camera = getReadingCamera(anchor, readingProgress, viewport);
		const blockLeft =
			anchor.point.x + anchor.viewportOffset.x - anchor.width / 2;
		const blockTop =
			anchor.point.y + anchor.viewportOffset.y - anchor.height / 2;
		const x = camera.x - viewport.width / 2 - blockLeft;
		const y = camera.y - viewport.height / 2 - blockTop;
		const transform = `translate3d(${x}px, ${y}px, 0)`;

		for (const element of elements) {
			element.style.width = `${viewport.width}px`;
			element.style.height = `${viewport.height}px`;
			if (transformByElement.get(element) === transform) continue;
			element.style.transform = transform;
			transformByElement.set(element, transform);
		}
	};
}

/**
 * Resolves where a block-owned fixed layer rests on its reading path.
 *
 * @param anchor - Block owning the fixed layer.
 * @param activeAnchor - Current timeline anchor.
 * @param segment - Current timeline segment.
 * @param segmentProgress - Current segment progress.
 * @returns Reading progress used to position the fixed layer.
 *
 * @example
 * const progress = getFixedReadingProgress(anchor, active, segment, 0.5);
 */
function getFixedReadingProgress(
	anchor: Anchor,
	activeAnchor: Anchor,
	segment: TimelineSegment,
	segmentProgress: number,
): number {
	if (
		segment.type === "reading" &&
		segment.anchor.block.id === anchor.block.id
	) {
		return segmentProgress;
	}
	if (segment.type === "pause" && segment.anchor.block.id === anchor.block.id) {
		return segment.pauseType === "start" ? 0 : 1;
	}
	if (segment.type === "transition") {
		if (segment.from.block.id === anchor.block.id) return 1;
		if (segment.to.block.id === anchor.block.id) return 0;
	}
	return anchor.scroll < activeAnchor.scroll ? 1 : 0;
}
