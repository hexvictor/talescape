import type {
	Anchor,
	CompiledReader,
	Point,
	ResolvedBlockSize,
	ResolvedTaleBlock,
	SnapPoint,
	Tale,
	TaleBlock,
	TaleBlockSnapApproach,
	TaleBlockSnapBehavior,
	TaleBlockSnapMode,
	TimelineSegment,
	ViewportSize,
} from "../types";
import { compileReaderContents } from "./compileReaderContents";
import {
	resolveBlockCameraPoint,
	resolveGroupEdgeBlockPoint,
	resolveNonOverlappingBlockPoint,
} from "./readerBlockLayout";
import { countReaderDiagnostic } from "./readerDiagnostics";
import {
	compileReadingPathPoints,
	directionVector,
	flowDirection,
	getNextPoint,
	getReadingCamera,
	getReadingTravelDistance,
} from "./readerGeometry";
import { clamp, lerpPoint } from "./readerMath";
import { resolveBlockSnapBehavior } from "./readerSnapSettings";

function getVisibleBlockIds(tale: Tale, selectedBranchIds: string[]) {
	const branchIds = [tale.bounds.rootBranchId, ...selectedBranchIds]
		.filter((id): id is string => Boolean(id))
		.filter((id, index, ids) => ids.indexOf(id) === index);
	return branchIds.flatMap(
		(id) => tale.indexMap.branchesById[id]?.blockIds ?? [],
	);
}

export function getCompiledBlockIds(tale: Tale, selectedBranchIds: string[]) {
	return getVisibleBlockIds(tale, selectedBranchIds);
}

/**
 * Resolves the block snap mode after applying an optional debug override.
 *
 * @param block - Block being compiled.
 * @param override - Runtime debug override, or null for authored settings.
 * @returns Effective snap mode.
 *
 * @example
 * const mode = getEffectiveSnapMode(block, "snap");
 */
function getEffectiveSnapBehavior(
	block: TaleBlock,
	approach: TaleBlockSnapApproach,
	override: TaleBlockSnapMode | null,
): TaleBlockSnapBehavior {
	if (override) return { mode: override, settings: null };
	return resolveBlockSnapBehavior(block.snap, approach);
}

export function compileReader(
	tale: Tale,
	selectedBranchIds: string[],
	sizes: Record<string, ResolvedBlockSize>,
	viewport: ViewportSize,
	snapModeOverride: TaleBlockSnapMode | null = null,
): CompiledReader {
	countReaderDiagnostic("compileReader()", {
		selectedBranches: selectedBranchIds.length,
	});
	const anchors: Anchor[] = [];
	let point: Point = { x: 0, y: 0 };
	let previous: Anchor | null = null;

	for (const blockId of getVisibleBlockIds(tale, selectedBranchIds)) {
		const block = tale.indexMap.blocksById[blockId];
		const size = sizes[blockId];
		const branch = block && tale.indexMap.branchesById[block.branchId];
		const page = block && tale.indexMap.pagesById[block.pageId];
		const entry = block && tale.indexMap.entriesById[block.entryId];
		const part = block && tale.indexMap.partsById[block.partId];
		if (!block || !size || !branch || !page || !entry || !part) continue;
		const readingPathPoints = compileReadingPathPoints(size, block, viewport);
		const cameraFramingOffset = getCameraFramingOffset(
			block.size,
			size,
			viewport,
		);

		if (previous) {
			point = getNextPoint(previous, block, size, viewport);
			const flow = block.transition.flow;
			if (flow.type === "linear" && flow.placement === "groupEdge") {
				point = resolveGroupEdgeBlockPoint(
					point,
					size,
					flow.direction,
					anchors,
					{
						crossAxisAlignment: flow.alignment,
						horizontalAlignment: flow.groupHorizontalAlignment,
						referenceCamera: getReadingCamera(previous, 1, viewport),
						viewport,
					},
				);
			}
			if (
				flow.type === "linear" &&
				flow.placement !== "cameraEdge" &&
				shouldResolveNonOverlappingBlockPoint(flow.placement)
			) {
				point = resolveNonOverlappingBlockPoint(
					point,
					size,
					flow.direction,
					anchors,
				);
			}
		}
		const cameraPoint = resolveBlockCameraPoint(
			previous,
			block,
			point,
			cameraFramingOffset,
			size,
			readingPathPoints,
			viewport,
		);

		const anchor: Anchor = {
			blockId: block.id,
			branchId: branch.id,
			cameraFramingOffset,
			cameraPoint,
			entryId: entry.id,
			height: size.height,
			id: block.id,
			pageId: page.id,
			partId: part.id,
			point,
			readingPathPoints,
			scroll: 0,
			width: size.width,
		};
		anchors.push(anchor);
		previous = anchor;
	}

	const segments: TimelineSegment[] = [];
	const snapPoints: SnapPoint[] = [];
	const segmentIndexByBlockId: Record<string, number> = {};
	const transitionIntoByBlockId: Record<string, number> = {};
	const transitionOutOfByBlockId: Record<string, number> = {};
	let scroll = 0;

	const firstAnchor = anchors[0];
	const firstBlock = firstAnchor
		? tale.indexMap.blocksById[firstAnchor.blockId]
		: undefined;
	let openingTransitionAnchor: Anchor | null = null;
	if (firstAnchor && firstBlock) {
		const openingLength = Math.max(
			firstBlock.transition.enteringLength ?? viewport.height,
			1,
		);
		openingTransitionAnchor = createOpeningTransitionAnchor(
			firstAnchor,
			firstBlock,
			viewport,
			tale.firstBlockTransitionMode,
		);
		const transitionIndex = segments.length;
		segments.push({
			end: openingLength,
			fromBlockId: null,
			index: transitionIndex,
			length: openingLength,
			start: 0,
			toBlockId: firstAnchor.blockId,
			type: "transition",
		});
		transitionIntoByBlockId[firstAnchor.blockId] = transitionIndex;
		const firstSnap = getEffectiveSnapBehavior(
			firstBlock,
			"forward",
			snapModeOverride,
		);
		if (firstSnap.mode === "snap" || firstSnap.mode === "scroll-snap") {
			snapPoints.push({
				blockId: firstAnchor.blockId,
				direction: "fromPrevious",
				id: `${firstAnchor.blockId}-opening-transition-start`,
				mode: firstSnap.mode,
				scroll: openingLength,
				settings: firstSnap.settings,
				transitionEnd: openingLength,
				transitionStart: 0,
				type: "block-start",
			});
		}
		scroll = openingLength;
	}

	for (let index = 0; index < anchors.length; index++) {
		const anchor = anchors[index];
		const next = anchors[index + 1];
		if (!anchor) continue;
		const block = tale.indexMap.blocksById[anchor.blockId];
		if (!block) continue;
		anchor.scroll = scroll;
		const readingLength = getReadingLength(anchor, block, viewport);
		const startPauseLength = Math.max(block.reading.pauses?.atStart ?? 0, 0);
		const endPauseLength = Math.max(block.reading.pauses?.atEnd ?? 0, 0);
		if (startPauseLength > 0) {
			segments.push({
				blockId: anchor.blockId,
				end: scroll + startPauseLength,
				index: segments.length,
				length: startPauseLength,
				pauseType: "start",
				start: scroll,
				type: "pause",
			});
			scroll += startPauseLength;
		}
		segmentIndexByBlockId[anchor.blockId] = segments.length;
		segments.push({
			blockId: anchor.blockId,
			end: scroll + readingLength,
			index: segments.length,
			length: readingLength,
			start: scroll,
			type: "reading",
		});
		const forwardSnap = getEffectiveSnapBehavior(
			block,
			"forward",
			snapModeOverride,
		);
		const backwardSnap = getEffectiveSnapBehavior(
			block,
			"backward",
			snapModeOverride,
		);
		const blockEndScroll = scroll + readingLength;
		if (forwardSnap.mode === "scroll-snap") {
			snapPoints.push({
				blockId: anchor.blockId,
				direction: "fromPrevious",
				id: `${anchor.blockId}-start`,
				mode: forwardSnap.mode,
				scroll: anchor.scroll,
				settings: forwardSnap.settings,
				type: "block-start",
			});
		}
		if (backwardSnap.mode === "scroll-snap") {
			snapPoints.push({
				blockId: anchor.blockId,
				direction: "fromNext",
				id: `${anchor.blockId}-end`,
				mode: backwardSnap.mode,
				scroll: blockEndScroll,
				settings: backwardSnap.settings,
				type: "block-end",
			});
		}
		if (block.isChoiceBlock) {
			for (const [approach, behavior, direction] of [
				["forward", forwardSnap, "fromPrevious"],
				["backward", backwardSnap, "fromNext"],
			] as const) {
				if (behavior.mode === "snap-off") continue;
				snapPoints.push({
					blockId: anchor.blockId,
					direction,
					id: `${anchor.blockId}-choice-end-${approach}`,
					mode: behavior.mode,
					scroll: blockEndScroll,
					settings: behavior.settings,
					type: "choice-end",
				});
			}
		}
		scroll += readingLength;
		if (endPauseLength > 0) {
			segments.push({
				blockId: anchor.blockId,
				end: scroll + endPauseLength,
				index: segments.length,
				length: endPauseLength,
				pauseType: "end",
				start: scroll,
				type: "pause",
			});
			scroll += endPauseLength;
		}

		if (!next) continue;
		const nextBlock = tale.indexMap.blocksById[next.blockId];
		if (!nextBlock) continue;
		const effectiveTransition = nextBlock.transition;
		const automaticTransitionLength = getAutomaticTransitionLength(
			anchor,
			next,
			viewport,
		);
		const transitionLength = Math.max(
			effectiveTransition.leavingLength ?? automaticTransitionLength,
			effectiveTransition.enteringLength ?? automaticTransitionLength,
			effectiveTransition.scrollLength ?? automaticTransitionLength,
			1,
		);
		const transitionIndex = segments.length;
		segments.push({
			end: scroll + transitionLength,
			fromBlockId: anchor.blockId,
			index: segments.length,
			length: transitionLength,
			start: scroll,
			toBlockId: next.blockId,
			type: "transition",
		});
		const outgoingSnap = getEffectiveSnapBehavior(
			block,
			"backward",
			snapModeOverride,
		);
		if (outgoingSnap.mode === "snap") {
			snapPoints.push({
				blockId: anchor.blockId,
				direction: "fromNext",
				id: `${anchor.blockId}-transition-end`,
				mode: "snap",
				scroll,
				settings: outgoingSnap.settings,
				transitionEnd: scroll + transitionLength,
				transitionStart: scroll,
				type: "block-end",
			});
		}
		if (outgoingSnap.mode === "scroll-snap") {
			snapPoints.push({
				blockId: anchor.blockId,
				direction: "fromNext",
				id: `${anchor.blockId}-transition-scroll-end`,
				mode: "scroll-snap",
				scroll,
				settings: outgoingSnap.settings,
				transitionEnd: scroll + transitionLength,
				transitionStart: scroll,
				type: "block-end",
			});
		}
		const incomingSnap = getEffectiveSnapBehavior(
			nextBlock,
			"forward",
			snapModeOverride,
		);
		if (incomingSnap.mode === "snap") {
			snapPoints.push({
				blockId: next.blockId,
				direction: "fromPrevious",
				id: `${next.blockId}-transition-start`,
				mode: "snap",
				scroll: scroll + transitionLength,
				settings: incomingSnap.settings,
				transitionEnd: scroll + transitionLength,
				transitionStart: scroll,
				type: "block-start",
			});
		}
		if (incomingSnap.mode === "scroll-snap") {
			snapPoints.push({
				blockId: next.blockId,
				direction: "fromPrevious",
				id: `${next.blockId}-transition-scroll-start`,
				mode: "scroll-snap",
				scroll: scroll + transitionLength,
				settings: incomingSnap.settings,
				transitionEnd: scroll + transitionLength,
				transitionStart: scroll,
				type: "block-start",
			});
		}
		transitionOutOfByBlockId[anchor.blockId] = transitionIndex;
		transitionIntoByBlockId[next.blockId] = transitionIndex;
		scroll += transitionLength;
	}
	const navigation = compileReaderContents(tale, anchors);
	const previousVisibleTakeover = compilePreviousVisibleTakeoverMetadata(
		tale,
		anchors,
	);

	return {
		anchorIndexByBlockId: Object.fromEntries(
			anchors.map((anchor, index) => [anchor.blockId, index]),
		),
		anchors,
		contents: navigation.contents,
		entries: navigation.entries,
		entryIndexById: navigation.entryIndexById,
		heldPreviousTakeoverBlockIdByAnchorIndex:
			previousVisibleTakeover.heldBlockIdByAnchorIndex,
		openingTransitionAnchor,
		pageIndexById: navigation.pageIndexById,
		pages: navigation.pages,
		previousVisibleBlockIdsByEnteringBlockId:
			previousVisibleTakeover.blockIdsByEnteringBlockId,
		segmentIndexByBlockId,
		segments,
		segmentStarts: segments.map((segment) => segment.start),
		snapConfig: tale.snapConfig,
		snapPoints,
		totalScroll: Math.max(scroll, 1),
		transitionIntoByBlockId,
		transitionOutOfByBlockId,
	};
}

type PreviousVisibleTakeoverMetadata = {
	blockIdsByEnteringBlockId: Record<string, string[]>;
	heldBlockIdByAnchorIndex: Array<string | null>;
};

/**
 * Precomputes previous-visible takeover lists and held takeover ownership for
 * every anchor position in the route.
 *
 * @param anchors - Ordered route anchors for the compiled reader path.
 * @returns Takeover metadata consumed by the frame painter.
 *
 * @example
 * const metadata = compilePreviousVisibleTakeoverMetadata(anchors);
 */
function compilePreviousVisibleTakeoverMetadata(
	tale: Tale,
	anchors: readonly Anchor[],
): PreviousVisibleTakeoverMetadata {
	const blockIdsByEnteringBlockId: Record<string, string[]> = {};
	const heldBlockIdByAnchorIndex: Array<string | null> = [];
	const previousBlockIds: string[] = [];
	let heldBlockId: string | null = null;
	for (const anchor of anchors) {
		const block = tale.indexMap.blocksById[anchor.blockId];
		if (!block) continue;
		if (
			block.transition.previousBlocksDuringEnter ===
				"customAllVisiblePrevious" ||
			block.transition.previousBlocksDuringEnter === "fadeAllVisiblePrevious"
		) {
			blockIdsByEnteringBlockId[anchor.blockId] = [...previousBlockIds];
			heldBlockId = anchor.blockId;
		}
		heldBlockIdByAnchorIndex.push(heldBlockId);
		previousBlockIds.push(anchor.blockId);
	}
	return { blockIdsByEnteringBlockId, heldBlockIdByAnchorIndex };
}

/**
 * Determines whether a linear block placement should avoid all previous route
 * geometry after its initial point is resolved.
 *
 * Previous block edge is an explicit local placement mode, so it should not be
 * corrected by unrelated older geometry.
 *
 * @param placement - Current linear placement reference.
 * @returns Whether global non-overlap adjustment should run.
 *
 * @example
 * const shouldAdjust = shouldResolveNonOverlappingBlockPoint("blockEdge");
 */
function shouldResolveNonOverlappingBlockPoint(
	placement:
		| "blockEdge"
		| "blockEdgeWithViewportAlignment"
		| "cameraEdge"
		| "groupEdge"
		| undefined,
): boolean {
	return (
		(placement ?? "blockEdge") !== "blockEdge" && placement !== "groupEdge"
	);
}

/**
 * Creates the virtual pre-story source anchor for the opening transition.
 *
 * @param anchor - First visible block anchor.
 * @param viewport - Active reader viewport.
 * @returns Virtual source anchor used by the opening transition.
 */
function createOpeningTransitionAnchor(
	anchor: Anchor,
	block: ResolvedTaleBlock,
	viewport: ViewportSize,
	mode: Tale["firstBlockTransitionMode"],
): Anchor {
	if (mode === "inPlace") {
		return {
			...anchor,
			id: `${anchor.id}-opening-transition`,
		};
	}
	const direction = flowDirection(block.transition.flow) ?? "down";
	const vector = directionVector(direction);
	return {
		...anchor,
		cameraPoint: {
			x: anchor.cameraPoint.x - vector.x * viewport.width,
			y: anchor.cameraPoint.y - vector.y * viewport.height,
		},
		id: `${anchor.id}-opening-transition`,
	};
}

/**
 * Derives transition scroll length from the camera distance between blocks.
 *
 * @param from - Source block anchor.
 * @param to - Destination block anchor.
 * @param viewport - Active reader viewport.
 * @returns Camera travel distance in pixels.
 */
function getAutomaticTransitionLength(
	from: Anchor,
	to: Anchor,
	viewport: ViewportSize,
): number {
	const start = getReadingCamera(from, 1, viewport);
	const end = getReadingCamera(to, 0, viewport);
	return Math.max(
		Math.hypot(end.x - start.x, end.y - start.y),
		Math.min(viewport.width, viewport.height) * 0.65,
	);
}

/**
 * Resolves where a block smaller than the viewport is placed around its camera
 * anchor.
 *
 * @param sizeConfig - Block sizing and viewport alignment configuration.
 * @param size - Measured block dimensions.
 * @param viewport - Current viewport dimensions.
 * @returns Pixel offset from the centered anchor position.
 */
function getCameraFramingOffset(
	sizeConfig: TaleBlock["size"],
	size: ResolvedBlockSize,
	viewport: ViewportSize,
): Point {
	const availableX = Math.max(viewport.width - size.width, 0) / 2;
	const availableY = Math.max(viewport.height - size.height, 0) / 2;
	return {
		x:
			sizeConfig.horizontalAlignment === "left"
				? -availableX
				: sizeConfig.horizontalAlignment === "right"
					? availableX
					: 0,
		y:
			sizeConfig.verticalAlignment === "top"
				? -availableY
				: sizeConfig.verticalAlignment === "bottom"
					? availableY
					: 0,
	};
}

/**
 * Resolves the scroll distance used while the reader camera travels through a block.
 *
 * @param anchor - The compiled anchor containing the block and measured dimensions.
 * @param viewport - Current viewport dimensions.
 * @returns Scroll distance for the block's internal reading segment.
 *
 * @example
 * const length = getReadingLength(anchor, viewport);
 */
export function getReadingLength(
	anchor: Anchor,
	block: ResolvedTaleBlock,
	viewport: ViewportSize,
) {
	if (block.reading.readingLengthMode === "manual") {
		return Math.max(block.reading.readingLength ?? 1, 1);
	}

	const travelDistance = getReadingTravelDistance(anchor, viewport);
	const direction = flowDirection(block.resolved.flow);
	const viewportAxis =
		direction === "left" || direction === "right"
			? viewport.width
			: viewport.height;

	return Math.max(travelDistance, viewportAxis * 0.65, 1);
}

function binarySearchSegmentIndex(starts: number[], scroll: number) {
	let low = 0;
	let high = starts.length - 1;
	let result = 0;
	while (low <= high) {
		const mid = (low + high) >> 1;
		const start = starts[mid] ?? 0;
		if (start <= scroll) {
			result = mid;
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}
	return result;
}

export function resolveSegmentIndex(
	compiled: CompiledReader,
	scroll: number,
	previousScroll: number,
	currentIndex: number,
) {
	const current = compiled.segments[currentIndex];
	if (current && scroll >= current.start && scroll < current.end) {
		return currentIndex;
	}

	const direction = scroll >= previousScroll ? 1 : -1;
	const neighborIndex = currentIndex + direction;
	const neighbor = compiled.segments[neighborIndex];
	if (neighbor && scroll >= neighbor.start && scroll < neighbor.end) {
		return neighborIndex;
	}

	return binarySearchSegmentIndex(compiled.segmentStarts, scroll);
}

export function getSegmentProgress(segment: TimelineSegment, scroll: number) {
	return clamp((scroll - segment.start) / segment.length, 0, 1);
}

export function getSegmentCamera(
	compiled: CompiledReader,
	segment: TimelineSegment,
	progress: number,
	viewport: ViewportSize,
) {
	if (segment.type === "reading") {
		const anchor = getCompiledAnchor(compiled, segment.blockId);
		return anchor
			? getReadingCamera(anchor, progress, viewport)
			: { x: 0, y: 0 };
	}
	if (segment.type === "pause") {
		const anchor = getCompiledAnchor(compiled, segment.blockId);
		if (!anchor) return { x: 0, y: 0 };
		return getReadingCamera(
			anchor,
			segment.pauseType === "start" ? 0 : 1,
			viewport,
		);
	}
	const from =
		segment.fromBlockId === null
			? compiled.openingTransitionAnchor
			: getCompiledAnchor(compiled, segment.fromBlockId);
	const to = getCompiledAnchor(compiled, segment.toBlockId);
	if (!from || !to) return { x: 0, y: 0 };
	return lerpPoint(
		getReadingCamera(from, 1, viewport),
		getReadingCamera(to, 0, viewport),
		progress,
	);
}

export function getSegmentAnchor(
	compiled: CompiledReader,
	segment: TimelineSegment,
	progress: number,
): Anchor | undefined {
	if (segment.type === "reading" || segment.type === "pause")
		return getCompiledAnchor(compiled, segment.blockId);
	if (progress >= 0.5) return getCompiledAnchor(compiled, segment.toBlockId);
	return segment.fromBlockId === null
		? (compiled.openingTransitionAnchor ?? undefined)
		: getCompiledAnchor(compiled, segment.fromBlockId);
}

function getCompiledAnchor(
	compiled: CompiledReader,
	blockId: string,
): Anchor | undefined {
	const index = compiled.anchorIndexByBlockId[blockId];
	return index === undefined ? undefined : compiled.anchors[index];
}
