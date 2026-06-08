import type {
	Anchor,
	CompiledReader,
	Point,
	ResolvedBlockSize,
	SnapPoint,
	Tale,
	TimelineSegment,
	ViewportSize,
} from "../types";
import { compileReaderContents } from "./compileReaderContents";
import { countReaderDiagnostic } from "./readerDiagnostics";
import {
	compileReadingPathPoints,
	flowDirection,
	getNextPoint,
	getReadingCamera,
	getReadingTravelDistance,
} from "./readerGeometry";
import { clamp, lerpPoint } from "./readerMath";

function getVisibleBlockIds(tale: Tale, selectedBranchIds: string[]) {
	const branchIds = [tale.bounds.rootBranchId, ...selectedBranchIds]
		.filter((id): id is string => Boolean(id))
		.filter((id, index, ids) => ids.indexOf(id) === index);
	return branchIds.flatMap(
		(id) =>
			tale.indexMap.branchesById[id]?.blockIds ??
			tale.indexMap.branchesById[id]?.children.blockIds ??
			[],
	);
}

export function getCompiledBlockIds(tale: Tale, selectedBranchIds: string[]) {
	return getVisibleBlockIds(tale, selectedBranchIds);
}

export function compileReader(
	tale: Tale,
	selectedBranchIds: string[],
	sizes: Record<string, ResolvedBlockSize>,
	viewport: ViewportSize,
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
		const viewportOffset = getViewportOffset(block.size, size, viewport);

		if (previous) {
			point = getNextPoint(
				previous,
				block,
				size,
				readingPathPoints,
				viewportOffset,
				previous.point,
				viewport,
			);
		}

		const anchor: Anchor = {
			block,
			branch,
			entry,
			height: size.height,
			id: block.id,
			page,
			part,
			point,
			readingPathPoints,
			scroll: 0,
			viewportOffset,
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

	for (let index = 0; index < anchors.length; index++) {
		const anchor = anchors[index];
		const next = anchors[index + 1];
		if (!anchor) continue;
		anchor.scroll = scroll;
		const readingLength = getReadingLength(anchor, viewport);
		const startPauseLength = Math.max(
			anchor.block.reading.pauses?.atStart ?? 0,
			0,
		);
		const endPauseLength = Math.max(anchor.block.reading.pauses?.atEnd ?? 0, 0);
		if (startPauseLength > 0) {
			segments.push({
				anchor,
				end: scroll + startPauseLength,
				index: segments.length,
				length: startPauseLength,
				pauseType: "start",
				start: scroll,
				type: "pause",
			});
			scroll += startPauseLength;
		}
		segmentIndexByBlockId[anchor.block.id] = segments.length;
		segments.push({
			anchor,
			end: scroll + readingLength,
			index: segments.length,
			length: readingLength,
			start: scroll,
			type: "reading",
		});
		if (anchor.block.snap) {
			snapPoints.push({
				blockId: anchor.block.id,
				id: `${anchor.block.id}-start`,
				scroll: anchor.scroll,
				type: "block-start",
			});
		}
		if (anchor.block.isChoiceBlock) {
			snapPoints.push({
				blockId: anchor.block.id,
				id: `${anchor.block.id}-choice-end`,
				scroll: scroll + readingLength,
				type: "choice-end",
			});
		}
		scroll += readingLength;
		if (endPauseLength > 0) {
			segments.push({
				anchor,
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
		const transitionLength = Math.max(
			anchor.block.transition.leavingLength,
			next.block.transition.enteringLength,
			anchor.block.transition.scrollLength,
			1,
		);
		const transitionIndex = segments.length;
		segments.push({
			end: scroll + transitionLength,
			from: anchor,
			index: segments.length,
			length: transitionLength,
			start: scroll,
			to: next,
			type: "transition",
		});
		transitionOutOfByBlockId[anchor.block.id] = transitionIndex;
		transitionIntoByBlockId[next.block.id] = transitionIndex;
		scroll += transitionLength;
	}
	const navigation = compileReaderContents(tale, anchors);

	return {
		anchorIndexByBlockId: Object.fromEntries(
			anchors.map((anchor, index) => [anchor.block.id, index]),
		),
		anchors,
		anchorsByBlockId: Object.fromEntries(
			anchors.map((anchor) => [anchor.block.id, anchor]),
		),
		contents: navigation.contents,
		entries: navigation.entries,
		entryIndexById: navigation.entryIndexById,
		pageIndexById: navigation.pageIndexById,
		pages: navigation.pages,
		segmentIndexByBlockId,
		segments,
		segmentStarts: segments.map((segment) => segment.start),
		snapPoints,
		totalScroll: Math.max(scroll, 1),
		transitionIntoByBlockId,
		transitionOutOfByBlockId,
	};
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
function getViewportOffset(
	sizeConfig: Tale["structure"]["blocks"][number]["size"],
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
export function getReadingLength(anchor: Anchor, viewport: ViewportSize) {
	if (anchor.block.reading.readingLengthMode === "manual") {
		return Math.max(anchor.block.reading.readingLength ?? 1, 1);
	}

	const travelDistance = getReadingTravelDistance(anchor, viewport);
	const direction = flowDirection(anchor.block.resolved.flow);
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
	segment: TimelineSegment,
	progress: number,
	viewport: ViewportSize,
) {
	if (segment.type === "reading") {
		return getReadingCamera(segment.anchor, progress, viewport);
	}
	if (segment.type === "pause") {
		return getReadingCamera(
			segment.anchor,
			segment.pauseType === "start" ? 0 : 1,
			viewport,
		);
	}
	return lerpPoint(
		getReadingCamera(segment.from, 1, viewport),
		getReadingCamera(segment.to, 0, viewport),
		progress,
	);
}

export function getSegmentAnchor(
	segment: TimelineSegment,
	progress: number,
): Anchor {
	if (segment.type === "reading" || segment.type === "pause")
		return segment.anchor;
	return progress < 0.5 ? segment.from : segment.to;
}
