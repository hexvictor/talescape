import type {
	Anchor,
	CompiledReader,
	Point,
	ResolvedSceneSize,
	ResolvedTaleElement,
	ResolvedTaleKeyframe,
	ResolvedTaleScene,
	SnapPoint,
	Tale,
	TaleFrame,
	TaleScene,
	TaleSceneSnapApproach,
	TaleSceneSnapBehavior,
	TaleSceneSnapMode,
	TimelineSegment,
	ViewportSize,
} from "../types";
import { compileReaderContents } from "./compileReaderContents";
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
import {
	resolveGroupEdgeBlockPoint,
	resolveNonOverlappingBlockPoint,
	resolveSceneCameraPoint,
} from "./readerSceneLayout";
import { resolveSceneSnapBehavior } from "./readerSnapSettings";

function getVisibleSceneIds(tale: Tale, selectedBranchIds: string[]) {
	const branchIds = [tale.bounds.rootBranchId, ...selectedBranchIds]
		.filter((id): id is string => Boolean(id))
		.filter((id, index, ids) => ids.indexOf(id) === index);
	const routeBranches = new Set(branchIds);
	return branchIds
		.flatMap((id) => tale.indexMap.branchesById[id]?.sceneIds ?? [])
		.filter((id, index, ids) => ids.indexOf(id) === index)
		.filter((sceneId) => {
			const scene = tale.indexMap.scenesById[sceneId];
			if (!scene || !scene.keyframeIds?.length) return true;
			return scene.keyframeIds.some((keyframeId) => {
				const step = tale.indexMap.keyframesById?.[keyframeId];
				return step ? routeBranches.has(step.branchId) : false;
			});
		});
}

export function getCompiledSceneIds(tale: Tale, selectedBranchIds: string[]) {
	return getVisibleSceneIds(tale, selectedBranchIds);
}

/**
 * Resolves the block snap mode after applying an optional debug override.
 *
 * @param block - Scene being compiled.
 * @param override - Runtime debug override, or null for authored settings.
 * @returns Effective snap mode.
 *
 * @example
 * const mode = getEffectiveSnapMode(block, "snap");
 */
function getEffectiveSnapBehavior(
	target: Pick<TaleScene | ResolvedTaleKeyframe, "snap">,
	approach: TaleSceneSnapApproach,
	override: TaleSceneSnapMode | null,
): TaleSceneSnapBehavior {
	if (override) return { mode: override, settings: null };
	return resolveSceneSnapBehavior(target.snap, approach);
}

export function compileReader(
	tale: Tale,
	selectedBranchIds: string[],
	sizes: Record<string, ResolvedSceneSize>,
	viewport: ViewportSize,
	snapModeOverride: TaleSceneSnapMode | null = null,
	frameSizes: Record<string, ResolvedSceneSize> = {},
): CompiledReader {
	countReaderDiagnostic("compileReader()", {
		selectedBranches: selectedBranchIds.length,
	});
	const anchors: Anchor[] = [];
	let point: Point = { x: 0, y: 0 };
	let previous: Anchor | null = null;

	for (const sceneId of getVisibleSceneIds(tale, selectedBranchIds)) {
		const block = tale.indexMap.scenesById[sceneId];
		const size = sizes[sceneId];
		const branch = block && tale.indexMap.branchesById[block.branchId];
		const firstNarrativeKeyframe = block
			? getSceneKeyframes(tale, block, selectedBranchIds).find(
					(step) => step.pageId !== null,
				)
			: undefined;
		const pageId = firstNarrativeKeyframe?.pageId ?? block?.pageId;
		const page = pageId ? tale.indexMap.pagesById[pageId] : undefined;
		const entryId = page?.entryId ?? block?.entryId;
		const partId = page?.partId ?? block?.partId;
		const entry = entryId ? tale.indexMap.entriesById[entryId] : undefined;
		const part = partId ? tale.indexMap.partsById[partId] : undefined;
		if (!block || !size || !branch) continue;
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
		const cameraPoint = resolveSceneCameraPoint(
			previous,
			block,
			point,
			cameraFramingOffset,
			size,
			readingPathPoints,
			viewport,
		);

		const anchor: Anchor = {
			sceneId: block.id,
			branchId: branch.id,
			cameraFramingOffset,
			cameraPoint,
			entryId: entry?.id ?? "",
			height: size.height,
			id: block.id,
			pageId: page?.id ?? "",
			partId: part?.id ?? "",
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
	const segmentIndexBySceneId: Record<string, number> = {};
	const segmentIndexByKeyframeId: Record<string, number> = {};
	const transitionIntoBySceneId: Record<string, number> = {};
	const transitionOutOfBySceneId: Record<string, number> = {};
	let scroll = 0;

	const firstAnchor = anchors[0];
	const firstBlock = firstAnchor
		? tale.indexMap.scenesById[firstAnchor.sceneId]
		: undefined;
	const firstKeyframe = firstBlock
		? getSceneKeyframes(tale, firstBlock, selectedBranchIds)[0]
		: undefined;
	let openingTransitionAnchor: Anchor | null = null;
	if (firstAnchor && firstBlock) {
		const openingLength =
			firstBlock.transition.introEnabled === true
				? Math.max(firstBlock.transition.introLength ?? viewport.height, 0)
				: 0;
		openingTransitionAnchor = createOpeningTransitionAnchor(
			firstAnchor,
			firstBlock,
			viewport,
			tale.firstSceneTransitionMode,
		);
		if (openingLength > 0) {
			const transitionIndex = segments.length;
			segments.push({
				end: openingLength,
				fromSceneId: null,
				index: transitionIndex,
				length: openingLength,
				start: 0,
				toSceneId: firstAnchor.sceneId,
				phase: "opening",
				type: "transition",
			});
			transitionIntoBySceneId[firstAnchor.sceneId] = transitionIndex;
		}
		const firstSnap = getEffectiveSnapBehavior(
			firstBlock,
			"forward",
			snapModeOverride,
		);
		if (firstSnap.mode === "snap" || firstSnap.mode === "scroll-snap") {
			snapPoints.push({
				sceneId: firstAnchor.sceneId,
				keyframeId:
					firstKeyframe?.id ?? `${firstAnchor.sceneId}:default-keyframe`,
				direction: "fromPrevious",
				id: `${firstAnchor.sceneId}-opening-transition-start`,
				mode: firstSnap.mode,
				scroll: openingLength,
				settings: firstSnap.settings,
				transitionEnd: openingLength,
				transitionStart: 0,
				type: "scene-start",
			});
		}
		scroll = openingLength;
	}

	for (let index = 0; index < anchors.length; index++) {
		const anchor = anchors[index];
		const next = anchors[index + 1];
		if (!anchor) continue;
		const block = tale.indexMap.scenesById[anchor.sceneId];
		if (!block) continue;
		anchor.scroll = scroll;
		const sceneKeyframes = getSceneKeyframes(tale, block, selectedBranchIds);
		const sceneIntroLength =
			index > 0 && block.transition.introEnabled === true
				? Math.max(block.transition.introLength ?? 0, 0)
				: 0;
		if (sceneIntroLength > 0) {
			segments.push({
				cameraProgress: 0,
				sceneId: anchor.sceneId,
				keyframeId: `${anchor.sceneId}:scene-intro`,
				end: scroll + sceneIntroLength,
				index: segments.length,
				length: sceneIntroLength,
				pauseType: "frame-enter",
				phaseOwner: "scene",
				start: scroll,
				type: "pause",
			});
			scroll += sceneIntroLength;
		}
		const stepLengths = sceneKeyframes.map((step) =>
			getKeyframeActiveLength(
				tale,
				anchor,
				block,
				step,
				viewport,
				sceneKeyframes,
				frameSizes,
			),
		);
		const totalKeyframeLength = Math.max(
			stepLengths.reduce((total, length) => total + length, 0),
			1,
		);
		let completedKeyframeLength = 0;
		const getStepFrame = (
			step: ResolvedTaleKeyframe,
		): TaleFrame | undefined => {
			const id = step.frameId;
			if (!id) return undefined;
			return (
				tale.indexMap.framesById[id] ??
				tale.indexMap.framesById[id.split(":").at(-1) ?? id]
			);
		};
		for (let stepIndex = 0; stepIndex < sceneKeyframes.length; stepIndex++) {
			const step = sceneKeyframes[stepIndex];
			if (!step) continue;
			const frame = getStepFrame(step);
			const previousStep = sceneKeyframes[stepIndex - 1];
			const nextStep = sceneKeyframes[stepIndex + 1];
			const previousFrame = previousStep
				? getStepFrame(previousStep)
				: undefined;
			const nextFrame = nextStep ? getStepFrame(nextStep) : undefined;
			const isFirstFrameKeyframe = previousFrame?.id !== frame?.id;
			const isLastFrameKeyframe = nextFrame?.id !== frame?.id;
			const cameraProgressAtStart =
				completedKeyframeLength / totalKeyframeLength;
			if (isFirstFrameKeyframe && frame) {
				if (previousFrame) {
					const outgoingEnabled =
						previousFrame.transition?.nextBridgeEnabled === true;
					const incomingEnabled =
						frame.transition?.previousBridgeEnabled === true;
					const lengths = [
						outgoingEnabled ? previousFrame.transition?.nextBridgeLength : null,
						incomingEnabled ? frame.transition?.previousBridgeLength : null,
					].filter((length): length is number => length != null);
					const bridgeLength =
						outgoingEnabled || incomingEnabled
							? Math.max(lengths.length > 0 ? Math.max(...lengths) : 0, 0)
							: 0;
					if (bridgeLength > 0) {
						segments.push({
							cameraProgress: cameraProgressAtStart,
							end: scroll + bridgeLength,
							framePhase: "bridge",
							fromFrameId: previousFrame.id,
							index: segments.length,
							keyframeId: step.id,
							length: bridgeLength,
							pauseType: "frame-enter",
							phaseOwner: "frame",
							sceneId: anchor.sceneId,
							start: scroll,
							toFrameId: frame.id,
							type: "pause",
						});
						scroll += bridgeLength;
					}
				}
				const frameIntroLength = frame.transition?.introEnabled
					? Math.max(frame.transition.introLength ?? 0, 0)
					: 0;
				if (frameIntroLength > 0) {
					segments.push({
						cameraProgress: cameraProgressAtStart,
						end: scroll + frameIntroLength,
						frameId: frame.id,
						framePhase: "intro",
						index: segments.length,
						keyframeId: step.id,
						length: frameIntroLength,
						pauseType: "frame-enter",
						phaseOwner: "frame",
						sceneId: anchor.sceneId,
						start: scroll,
						type: "pause",
					});
					scroll += frameIntroLength;
				}
			}
			const stepTransitionStartScroll = scroll;
			const snapPointOwnerId = step.id.endsWith(":default-keyframe")
				? block.id
				: step.id;
			const activeLength = stepLengths[stepIndex] ?? 1;
			const cameraProgressStart = completedKeyframeLength / totalKeyframeLength;
			const cameraProgressEnd =
				(completedKeyframeLength + activeLength) / totalKeyframeLength;
			if (stepIndex === 0)
				segmentIndexBySceneId[anchor.sceneId] = segments.length;
			segmentIndexByKeyframeId[step.id] = segments.length;

			const introLength = Math.max(step.transition?.introLength ?? 0, 0);
			const startPauseLength = Math.max(step.reading.pauses?.atStart ?? 0, 0);
			const endPauseLength = Math.max(step.reading.pauses?.atEnd ?? 0, 0);
			const outroLength = Math.max(step.transition?.outroLength ?? 0, 0);
			if (introLength > 0) {
				segments.push({
					cameraProgress: cameraProgressStart,
					sceneId: anchor.sceneId,
					keyframeId: step.id,
					end: scroll + introLength,
					index: segments.length,
					length: introLength,
					pauseType: "frame-enter",
					start: scroll,
					type: "pause",
				});
				scroll += introLength;
			}
			if (startPauseLength > 0) {
				segments.push({
					cameraProgress: cameraProgressStart,
					sceneId: anchor.sceneId,
					keyframeId: step.id,
					end: scroll + startPauseLength,
					index: segments.length,
					length: startPauseLength,
					pauseType: "start",
					start: scroll,
					type: "pause",
				});
				scroll += startPauseLength;
			}
			const stepStartScroll = scroll;
			segments.push({
				cameraProgressEnd,
				cameraProgressStart,
				sceneId: anchor.sceneId,
				keyframeId: step.id,
				end: scroll + activeLength,
				index: segments.length,
				length: activeLength,
				start: scroll,
				type: "reading",
			});
			const forwardSnap = getEffectiveSnapBehavior(
				step,
				"forward",
				snapModeOverride,
			);
			const backwardSnap = getEffectiveSnapBehavior(
				step,
				"backward",
				snapModeOverride,
			);
			const stepEndScroll = scroll + activeLength;
			const progressingElements = getProgressingKeyframeElements(
				tale,
				block,
				step,
			);
			if (forwardSnap.mode === "snap" || forwardSnap.mode === "scroll-snap") {
				snapPoints.push({
					sceneId: anchor.sceneId,
					keyframeId: step.id,
					direction: "fromPrevious",
					id: `${snapPointOwnerId}-start`,
					mode: forwardSnap.mode,
					scroll: stepStartScroll,
					settings: forwardSnap.settings,
					transitionEnd: stepStartScroll,
					transitionStart: stepTransitionStartScroll,
					type: "step-start",
				});
			}
			if (backwardSnap.mode === "snap" || backwardSnap.mode === "scroll-snap") {
				snapPoints.push({
					sceneId: anchor.sceneId,
					keyframeId: step.id,
					direction: "fromNext",
					id: `${snapPointOwnerId}-end`,
					mode: backwardSnap.mode,
					scroll: stepEndScroll,
					settings: backwardSnap.settings,
					transitionEnd: stepEndScroll + endPauseLength + outroLength,
					transitionStart: stepEndScroll,
					type: "step-end",
				});
			}
			let completedElementLength = 0;
			for (const element of progressingElements) {
				const progression = element.progression;
				if (!progression) continue;
				const intro = Math.max(progression.introLength, 0);
				const pauseStart = Math.max(progression.pauses.atStart, 0);
				const reading = Math.max(progression.activeLength, 1);
				const pauseEnd = Math.max(progression.pauses.atEnd, 0);
				const outro = Math.max(progression.outroLength, 0);
				const elementStart = stepStartScroll + completedElementLength;
				const elementReadingStart = elementStart + intro + pauseStart;
				const elementReadingEnd = elementReadingStart + reading;
				const elementEnd = elementReadingEnd + pauseEnd + outro;
				const elementForwardSnap = getEffectiveSnapBehavior(
					progression,
					"forward",
					snapModeOverride,
				);
				const elementBackwardSnap = getEffectiveSnapBehavior(
					progression,
					"backward",
					snapModeOverride,
				);
				if (elementForwardSnap.mode !== "snap-off") {
					snapPoints.push({
						direction: "fromPrevious",
						id: `${element.id}-element-start`,
						mode: elementForwardSnap.mode,
						sceneId: block.id,
						scroll: elementReadingStart,
						settings: elementForwardSnap.settings,
						keyframeId: step.id,
						transitionEnd: elementReadingStart,
						transitionStart: elementStart,
						type: "element-start",
					});
				}
				if (elementBackwardSnap.mode !== "snap-off") {
					snapPoints.push({
						direction: "fromNext",
						id: `${element.id}-element-end`,
						mode: elementBackwardSnap.mode,
						sceneId: block.id,
						scroll: elementReadingEnd,
						settings: elementBackwardSnap.settings,
						keyframeId: step.id,
						transitionEnd: elementEnd,
						transitionStart: elementReadingEnd,
						type: "element-end",
					});
				}
				completedElementLength += elementEnd - elementStart;
			}
			const isChoiceKeyframe = (tale.order.pathIds ?? []).some((pathId) => {
				const path = tale.indexMap.pathsById[pathId];
				return (
					path?.type === "choice" &&
					(path.fromKeyframeId === step.id ||
						(path.fromKeyframeId === null &&
							path.fromSceneId === block.id &&
							stepIndex === sceneKeyframes.length - 1))
				);
			});
			if (isChoiceKeyframe) {
				for (const [approach, behavior, direction] of [
					["forward", forwardSnap, "fromPrevious"],
					["backward", backwardSnap, "fromNext"],
				] as const) {
					if (behavior.mode === "snap-off") continue;
					snapPoints.push({
						sceneId: anchor.sceneId,
						keyframeId: step.id,
						direction,
						id: `${step.id}-choice-end-${approach}`,
						mode: behavior.mode,
						scroll: stepEndScroll,
						settings: behavior.settings,
						type: "choice-end",
					});
				}
			}
			scroll += activeLength;
			completedKeyframeLength += activeLength;
			if (endPauseLength > 0) {
				segments.push({
					cameraProgress: cameraProgressEnd,
					sceneId: anchor.sceneId,
					keyframeId: step.id,
					end: scroll + endPauseLength,
					index: segments.length,
					length: endPauseLength,
					pauseType: "end",
					start: scroll,
					type: "pause",
				});
				scroll += endPauseLength;
			}
			if (outroLength > 0) {
				segments.push({
					cameraProgress: cameraProgressEnd,
					sceneId: anchor.sceneId,
					keyframeId: step.id,
					end: scroll + outroLength,
					index: segments.length,
					length: outroLength,
					pauseType: "frame-leave",
					start: scroll,
					type: "pause",
				});
				scroll += outroLength;
			}
			if (isLastFrameKeyframe && frame) {
				const frameOutroLength = frame.transition?.outroEnabled
					? Math.max(frame.transition.outroLength ?? 0, 0)
					: 0;
				if (frameOutroLength > 0) {
					segments.push({
						cameraProgress: cameraProgressEnd,
						end: scroll + frameOutroLength,
						frameId: frame.id,
						framePhase: "outro",
						index: segments.length,
						keyframeId: step.id,
						length: frameOutroLength,
						pauseType: "frame-leave",
						phaseOwner: "frame",
						sceneId: anchor.sceneId,
						start: scroll,
						type: "pause",
					});
					scroll += frameOutroLength;
				}
			}
		}

		const sceneOutroLength =
			block.transition.outroEnabled === true
				? Math.max(block.transition.outroLength ?? 0, 0)
				: 0;
		if (sceneOutroLength > 0) {
			segments.push({
				cameraProgress: 1,
				sceneId: anchor.sceneId,
				keyframeId: `${anchor.sceneId}:scene-outro`,
				end: scroll + sceneOutroLength,
				index: segments.length,
				length: sceneOutroLength,
				pauseType: "frame-leave",
				phaseOwner: "scene",
				start: scroll,
				type: "pause",
			});
			scroll += sceneOutroLength;
		}

		if (!next) continue;
		const nextBlock = tale.indexMap.scenesById[next.sceneId];
		if (!nextBlock) continue;
		const effectiveTransition = nextBlock.transition;
		const automaticTransitionLength = getAutomaticTransitionLength(
			anchor,
			next,
			viewport,
		);
		// Every adjacent Scene pair owns one route-derived bridge. Scene authors
		// control what participates in it, while geometry controls its duration.
		const outgoingBridgeEnabled = true;
		const incomingBridgeEnabled = true;
		const transitionLength = Math.max(automaticTransitionLength, 0);
		if (transitionLength <= 0) continue;
		const transitionIndex = segments.length;
		segments.push({
			end: scroll + transitionLength,
			fromSceneId: anchor.sceneId,
			incomingBridgeEnabled,
			index: segments.length,
			length: transitionLength,
			start: scroll,
			toSceneId: next.sceneId,
			outgoingBridgeEnabled,
			phase: "bridge",
			type: "transition",
		});
		const outgoingSnap = getEffectiveSnapBehavior(
			block,
			"backward",
			snapModeOverride,
		);
		if (outgoingSnap.mode === "snap") {
			snapPoints.push({
				sceneId: anchor.sceneId,
				keyframeId: `${anchor.sceneId}:scene-boundary`,
				direction: "fromNext",
				id: `${anchor.sceneId}-transition-end`,
				mode: "snap",
				scroll,
				settings: outgoingSnap.settings,
				transitionEnd: scroll + transitionLength,
				transitionStart: scroll,
				type: "scene-end",
			});
		}
		if (outgoingSnap.mode === "scroll-snap") {
			snapPoints.push({
				sceneId: anchor.sceneId,
				keyframeId: `${anchor.sceneId}:scene-boundary`,
				direction: "fromNext",
				id: `${anchor.sceneId}-transition-scroll-end`,
				mode: "scroll-snap",
				scroll,
				settings: outgoingSnap.settings,
				transitionEnd: scroll + transitionLength,
				transitionStart: scroll,
				type: "scene-end",
			});
		}
		const incomingSnap = getEffectiveSnapBehavior(
			nextBlock,
			"forward",
			snapModeOverride,
		);
		if (incomingSnap.mode === "snap") {
			snapPoints.push({
				sceneId: next.sceneId,
				keyframeId: `${next.sceneId}:scene-boundary`,
				direction: "fromPrevious",
				id: `${next.sceneId}-transition-start`,
				mode: "snap",
				scroll: scroll + transitionLength,
				settings: incomingSnap.settings,
				transitionEnd: scroll + transitionLength,
				transitionStart: scroll,
				type: "scene-start",
			});
		}
		if (incomingSnap.mode === "scroll-snap") {
			snapPoints.push({
				sceneId: next.sceneId,
				keyframeId: `${next.sceneId}:scene-boundary`,
				direction: "fromPrevious",
				id: `${next.sceneId}-transition-scroll-start`,
				mode: "scroll-snap",
				scroll: scroll + transitionLength,
				settings: incomingSnap.settings,
				transitionEnd: scroll + transitionLength,
				transitionStart: scroll,
				type: "scene-start",
			});
		}
		transitionOutOfBySceneId[anchor.sceneId] = transitionIndex;
		transitionIntoBySceneId[next.sceneId] = transitionIndex;
		scroll += transitionLength;
	}
	const navigation = compileReaderContents(
		tale,
		anchors,
		new Set(Object.keys(segmentIndexByKeyframeId)),
	);
	const previousVisibleTakeover = compilePreviousVisibleTakeoverMetadata(
		tale,
		anchors,
	);

	return {
		anchorIndexBySceneId: Object.fromEntries(
			anchors.map((anchor, index) => [anchor.sceneId, index]),
		),
		anchors,
		contents: navigation.contents,
		entries: navigation.entries,
		entryIndexById: navigation.entryIndexById,
		heldPreviousTakeoverSceneIdByAnchorIndex:
			previousVisibleTakeover.heldSceneIdByAnchorIndex,
		openingTransitionAnchor,
		pageIndexById: navigation.pageIndexById,
		pages: navigation.pages,
		previousVisibleSceneIdsByEnteringSceneId:
			previousVisibleTakeover.sceneIdsByEnteringSceneId,
		segmentIndexBySceneId,
		segmentIndexByKeyframeId,
		segments,
		segmentStarts: segments.map((segment) => segment.start),
		snapConfig: tale.snapConfig,
		snapPoints,
		totalScroll: Math.max(scroll, 1),
		transitionIntoBySceneId,
		transitionOutOfBySceneId,
	};
}

type PreviousVisibleTakeoverMetadata = {
	sceneIdsByEnteringSceneId: Record<string, string[]>;
	heldSceneIdByAnchorIndex: Array<string | null>;
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
	const sceneIdsByEnteringSceneId: Record<string, string[]> = {};
	const heldSceneIdByAnchorIndex: Array<string | null> = [];
	const previousSceneIds: string[] = [];
	let heldSceneId: string | null = null;
	for (const anchor of anchors) {
		const block = tale.indexMap.scenesById[anchor.sceneId];
		if (!block) continue;
		if (
			block.transition.previousScenesDuringEnter ===
				"customAllVisiblePrevious" ||
			block.transition.previousScenesDuringEnter === "fadeAllVisiblePrevious"
		) {
			sceneIdsByEnteringSceneId[anchor.sceneId] = [...previousSceneIds];
			heldSceneId = anchor.sceneId;
		}
		heldSceneIdByAnchorIndex.push(heldSceneId);
		previousSceneIds.push(anchor.sceneId);
	}
	return { sceneIdsByEnteringSceneId, heldSceneIdByAnchorIndex };
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
	block: ResolvedTaleScene,
	viewport: ViewportSize,
	mode: Tale["firstSceneTransitionMode"],
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
 * Derives transition scroll length from the camera distance between scenes.
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
 * @param sizeConfig - Scene sizing and viewport alignment configuration.
 * @param size - Measured block dimensions.
 * @param viewport - Current viewport dimensions.
 * @returns Pixel offset from the centered anchor position.
 */
function getCameraFramingOffset(
	sizeConfig: TaleScene["size"],
	size: ResolvedSceneSize,
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
 * const length = getActiveLength(anchor, viewport);
 */
export function getActiveLength(
	anchor: Anchor,
	block: ResolvedTaleScene,
	viewport: ViewportSize,
) {
	const travelDistance = getReadingTravelDistance(anchor, viewport);
	const direction = flowDirection(block.resolved.flow);
	const viewportAxis =
		direction === "left" || direction === "right"
			? viewport.width
			: viewport.height;

	return Math.max(travelDistance, viewportAxis * 0.65, 1);
}

function getSceneKeyframes(
	tale: Tale,
	scene: TaleScene,
	selectedBranchIds: string[],
): ResolvedTaleKeyframe[] {
	const visibleBranchIds = new Set([
		tale.bounds.rootBranchId,
		...selectedBranchIds,
	]);
	const keyframes = (scene.keyframeIds ?? []).flatMap((keyframeId) => {
		const step = tale.indexMap.keyframesById?.[keyframeId];
		return step && visibleBranchIds.has(step.branchId) ? [step] : [];
	});
	const frameOrder = new Map(
		(scene.frameIds ?? [])
			.filter(
				(frameId) =>
					frameId !== scene.rootFrameId &&
					tale.indexMap.framesById[frameId]?.kind !== "group",
			)
			.map((frameId, index) => [frameId.split(":").at(-1) ?? frameId, index]),
	);
	keyframes.sort((left, right) => {
		const leftFrame = left.frameId?.split(":").at(-1) ?? "";
		const rightFrame = right.frameId?.split(":").at(-1) ?? "";
		const frameDelta =
			(frameOrder.get(leftFrame) ?? Number.MAX_SAFE_INTEGER) -
			(frameOrder.get(rightFrame) ?? Number.MAX_SAFE_INTEGER);
		return frameDelta || left.order - right.order;
	});
	if (keyframes.length > 0) return keyframes;
	if ((scene.keyframeIds ?? []).length > 0) return [];
	if (Number(scene.id) < 0) return [];
	return [
		{
			actions: [],
			autoplay: scene.autoplay,
			branchId: scene.branchId,
			description: "Compatibility Keyframe",
			frameId: scene.rootFrameId ?? null,
			id: `${scene.id}:default-keyframe`,
			links: { nextKeyframeId: null, previousKeyframeId: null },
			order: 0,
			pageId: scene.pageId || null,
			position: { index: 0, isFirst: true, isLast: true },
			reading: scene.reading,
			sceneId: scene.id,
			snap: scene.snap,
			title: "Scene",
			transition: { introLength: null, outroLength: null },
		},
	];
}

function getKeyframeActiveLength(
	tale: Tale,
	anchor: Anchor,
	scene: ResolvedTaleScene,
	step: ResolvedTaleKeyframe,
	viewport: ViewportSize,
	sceneKeyframes: ResolvedTaleKeyframe[],
	frameSizes: Record<string, ResolvedSceneSize>,
): number {
	const frameId = step.frameId;
	const sourceFrameId = frameId?.split(":").at(-1) ?? frameId;
	const frame = frameId
		? (tale.indexMap.framesById[frameId] ??
			tale.indexMap.framesById[sourceFrameId ?? ""])
		: undefined;
	const frameKeyframes = sceneKeyframes.filter(
		(item) =>
			item.frameId === frameId ||
			item.frameId?.split(":").at(-1) === sourceFrameId,
	);
	const progression = frame?.progression;
	if (progression?.mode === "manual") {
		return Math.max(progression.allocations?.[step.id] ?? 0, 0);
	}
	if (progression?.mode === "content") {
		const measuredFrame = frame
			? (frameSizes[frame.id] ?? frameSizes[sourceFrameId ?? ""])
			: undefined;
		const readingTravel = anchor.readingPathPoints.at(-1);
		const readsHorizontally =
			readingTravel !== undefined &&
			Math.abs(readingTravel.x) > Math.abs(readingTravel.y);
		const frameSpan = measuredFrame
			? readsHorizontally
				? measuredFrame.width
				: measuredFrame.height
			: getActiveLength(anchor, scene, viewport) /
				Math.max(new Set(sceneKeyframes.map((item) => item.frameId)).size, 1);
		const weights = frameKeyframes.map(
			(item) => progression.allocations?.[item.id] ?? 1,
		);
		const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
		const weight = progression.allocations?.[step.id] ?? 1;
		return Math.max(frameSpan * (weight / Math.max(totalWeight, 1)), 1);
	}

	// Compatibility for stories authored before Frame-owned reading spans.
	if (step.reading.activeLengthMode === "manual")
		return Math.max(step.reading.activeLength ?? 0, 0);
	return Math.max(
		getActiveLength(anchor, scene, viewport) /
			Math.max(sceneKeyframes.length, 1),
		1,
	);
}

function getProgressingKeyframeElements(
	tale: Tale,
	scene: TaleScene,
	step: ResolvedTaleKeyframe,
): ResolvedTaleElement[] {
	const stepFrameId = step.frameId;
	if (!stepFrameId) return [];
	return scene.elementIds
		.flatMap((elementId) => {
			const element = tale.indexMap.elementsById[elementId];
			return element?.progression?.enabled ? [element] : [];
		})
		.filter((element) =>
			isFrameInsideKeyframe(tale, element.frameId, stepFrameId),
		)
		.sort((left, right) => left.order - right.order);
}

function isFrameInsideKeyframe(
	tale: Tale,
	frameId: string | null,
	stepFrameId: string,
): boolean {
	let currentId = frameId;
	const visited = new Set<string>();
	while (currentId && !visited.has(currentId)) {
		visited.add(currentId);
		if (
			currentId === stepFrameId ||
			(currentId.split(":").at(-1) ?? currentId) ===
				(stepFrameId.split(":").at(-1) ?? stepFrameId)
		)
			return true;
		currentId = tale.indexMap.framesById[currentId]?.parentFrameId ?? null;
	}
	return false;
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
	if (segment.length === 0) return 1;
	return clamp((scroll - segment.start) / segment.length, 0, 1);
}

export function getSegmentCamera(
	compiled: CompiledReader,
	segment: TimelineSegment,
	progress: number,
	viewport: ViewportSize,
) {
	if (segment.type === "reading") {
		const anchor = getCompiledAnchor(compiled, segment.sceneId);
		return anchor
			? getReadingCamera(
					anchor,
					segment.cameraProgressStart +
						(segment.cameraProgressEnd - segment.cameraProgressStart) *
							progress,
					viewport,
				)
			: { x: 0, y: 0 };
	}
	if (segment.type === "pause") {
		const anchor = getCompiledAnchor(compiled, segment.sceneId);
		if (!anchor) return { x: 0, y: 0 };
		return getReadingCamera(anchor, segment.cameraProgress, viewport);
	}
	const from =
		segment.fromSceneId === null
			? compiled.openingTransitionAnchor
			: getCompiledAnchor(compiled, segment.fromSceneId);
	const to = getCompiledAnchor(compiled, segment.toSceneId);
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
		return getCompiledAnchor(compiled, segment.sceneId);
	if (progress >= 0.5) return getCompiledAnchor(compiled, segment.toSceneId);
	return segment.fromSceneId === null
		? (compiled.openingTransitionAnchor ?? undefined)
		: getCompiledAnchor(compiled, segment.fromSceneId);
}

function getCompiledAnchor(
	compiled: CompiledReader,
	sceneId: string,
): Anchor | undefined {
	const index = compiled.anchorIndexBySceneId[sceneId];
	return index === undefined ? undefined : compiled.anchors[index];
}
