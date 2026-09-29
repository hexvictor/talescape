import { clamp } from "../services/readerMath";
import type { CompiledReader, Tale, TimelineSegment } from "../types";

/**
 * Creates an imperative progress UI painter for the reader engine.
 *
 * @param progressRoot - DOM root containing progress indicators.
 * @param compiled - Compiled reader timeline.
 * @returns Function that paints story and segment progress without React state.
 *
 * @example
 * const paintProgress = createProgressPainter(root, compiled);
 */
export function createProgressPainter(
	progressRoot: HTMLElement | null,
	compiled: CompiledReader,
	tale?: Tale,
) {
	let storyFill: HTMLElement | null = null;
	let storyLabel: HTMLElement | null = null;
	let innerLabel: HTMLElement | null = null;
	let innerFill: HTMLElement | null = null;
	let transitionFill: HTMLElement | null = null;
	let previousStoryLabel = "";
	let previousInnerLabel = "";
	let previousStoryScale = "";
	let previousInnerScale = "";
	let previousInnerPhase = "";
	let previousTransitionScale = "";

	return (
		scroll: number,
		segment: TimelineSegment,
		segmentProgress: number,
	): void => {
		if (!storyFill?.isConnected) {
			storyFill =
				progressRoot?.querySelector<HTMLElement>(
					"[data-reader-story-progress-fill='true']",
				) ?? null;
			previousStoryScale = "";
		}
		if (!storyLabel?.isConnected) {
			storyLabel =
				progressRoot?.querySelector<HTMLElement>(
					"[data-reader-story-progress='true']",
				) ?? null;
			previousStoryLabel = "";
		}
		if (!innerLabel?.isConnected) {
			innerLabel =
				progressRoot?.querySelector<HTMLElement>(
					"[data-reader-inner-progress='true']",
				) ?? null;
			previousInnerLabel = "";
		}
		if (!innerFill?.isConnected) {
			innerFill =
				progressRoot?.querySelector<HTMLElement>(
					"[data-reader-inner-progress-fill='true']",
				) ?? null;
			previousInnerScale = "";
		}
		if (!transitionFill?.isConnected) {
			transitionFill =
				progressRoot?.querySelector<HTMLElement>(
					"[data-reader-transition-progress-fill='true']",
				) ?? null;
			previousTransitionScale = "";
		}
		const storyProgress = clamp(scroll / compiled.totalScroll, 0, 1);
		const storyScale = `scaleX(${storyProgress})`;
		if (storyFill && storyScale !== previousStoryScale) {
			storyFill.style.transform = storyScale;
			previousStoryScale = storyScale;
		}
		if (storyLabel) {
			const label = `Story ${Math.round(storyProgress * 100)}%`;
			if (label !== previousStoryLabel) {
				storyLabel.textContent = label;
				previousStoryLabel = label;
			}
		}
		if (!innerLabel) return;

		let label: string;
		let innerScale: string;
		let innerPhase = "reading";
		let transitionScale = "scaleX(0)";
		if (segment.type === "reading") {
			label = tale
				? `${getProgressOwnerLabel(tale, compiled, segment)}: Active ${formatProgress(segment, segmentProgress)}${getOwnerTotals(tale, compiled, segment)}`
				: `Page ${Math.round(segment.length * segmentProgress)} / ${segment.length}`;
			innerScale = `scaleX(${segmentProgress})`;
		} else if (segment.type === "pause") {
			const owner = tale
				? getProgressOwnerLabel(tale, compiled, segment)
				: "Frame";
			const phaseLabel =
				segment.phaseOwner === "frame" && segment.framePhase === "bridge"
					? `${owner}: Bridge`
					: segment.phaseOwner === "frame" && segment.framePhase === "intro"
						? `${owner}: Intro`
						: segment.phaseOwner === "frame" && segment.framePhase === "outro"
							? `${owner}: Outro`
							: segment.pauseType === "frame-enter"
								? `${owner}: Intro`
								: segment.pauseType === "frame-leave"
									? `${owner}: Outro`
									: segment.pauseType === "start"
										? `${owner}: Intro Pause`
										: `${owner}: Outro Pause`;
			label = `${phaseLabel} ${formatProgress(segment, segmentProgress)}${tale ? getOwnerTotals(tale, compiled, segment) : ""}`;
			innerScale = `scaleX(${segmentProgress})`;
			innerPhase =
				segment.pauseType === "start" || segment.pauseType === "frame-enter"
					? "enter-pause"
					: "leave-pause";
		} else {
			if (tale) {
				const sceneNumber =
					(compiled.anchorIndexBySceneId?.[segment.toSceneId] ?? -1) + 1;
				const phase =
					segment.phase === "opening" || segment.fromSceneId === null
						? "Intro"
						: "Bridge";
				label = `S${sceneNumber > 0 ? sceneNumber : "?"}: ${phase} ${formatProgress(segment, segmentProgress)}${getOwnerTotals(tale, compiled, segment)}`;
			} else {
				label = `Transition ${Math.round(segment.length * segmentProgress)} / ${segment.length}`;
			}
			innerScale = "scaleX(0)";
			transitionScale = `scaleX(${segmentProgress})`;
		}
		if (label !== previousInnerLabel) {
			innerLabel.textContent = label;
			previousInnerLabel = label;
		}
		if (innerFill && innerScale !== previousInnerScale) {
			innerFill.style.transform = innerScale;
			previousInnerScale = innerScale;
		}
		if (innerFill && innerPhase !== previousInnerPhase) {
			innerFill.dataset.readerProgressPhase = innerPhase;
			previousInnerPhase = innerPhase;
		}
		if (transitionFill && transitionScale !== previousTransitionScale) {
			transitionFill.style.transform = transitionScale;
			previousTransitionScale = transitionScale;
		}
	};
}

function getProgressOwnerLabel(
	tale: Tale,
	compiled: CompiledReader,
	segment: Exclude<TimelineSegment, { type: "transition" }>,
): string {
	const scene = tale.indexMap.scenesById[segment.sceneId];
	if (segment.type === "pause" && segment.phaseOwner === "frame" && scene) {
		const frameId = segment.frameId ?? segment.toFrameId ?? segment.fromFrameId;
		const sourceFrameId = frameId?.split(":").at(-1) ?? frameId;
		const frameIds = scene.frameIds.filter(
			(id) =>
				id !== scene.rootFrameId &&
				tale.indexMap.framesById[id]?.kind !== "group",
		);
		const frameNumber =
			frameIds.findIndex(
				(id) =>
					id === frameId || (id.split(":").at(-1) ?? id) === sourceFrameId,
			) + 1;
		const sceneNumber =
			(compiled.anchorIndexBySceneId[segment.sceneId] ?? -1) + 1;
		return `S${sceneNumber > 0 ? sceneNumber : "?"}-F${frameNumber > 0 ? frameNumber : "?"}`;
	}
	const step = tale.indexMap.keyframesById[segment.keyframeId];
	if (step?.frameId && scene) {
		const frameIds = scene.frameIds.filter(
			(id) =>
				id !== scene.rootFrameId &&
				tale.indexMap.framesById[id]?.kind !== "group",
		);
		const sourceFrameId = step.frameId.split(":").at(-1) ?? step.frameId;
		const frameNumber =
			frameIds.findIndex(
				(id) =>
					id === step.frameId || (id.split(":").at(-1) ?? id) === sourceFrameId,
			) + 1;
		const frameKeyframeIds = scene.keyframeIds.filter(
			(keyframeId) =>
				tale.indexMap.keyframesById[keyframeId]?.frameId === step.frameId,
		);
		const stepNumber = frameKeyframeIds.indexOf(step.id) + 1;
		const sceneNumber =
			(compiled.anchorIndexBySceneId[segment.sceneId] ?? -1) + 1;
		return `S${sceneNumber > 0 ? sceneNumber : "?"}-F${frameNumber > 0 ? frameNumber : "?"}-K${stepNumber > 0 ? stepNumber : "?"}`;
	}
	const sceneNumber =
		(compiled.anchorIndexBySceneId[segment.sceneId] ?? -1) + 1;
	return `S${sceneNumber > 0 ? sceneNumber : "?"}`;
}

function formatProgress(
	segment: TimelineSegment,
	segmentProgress: number,
): string {
	return `${Math.round(segment.length * segmentProgress)}/${Math.round(segment.length)}`;
}

function getOwnerTotals(
	tale: Tale,
	compiled: CompiledReader,
	segment: TimelineSegment,
): string {
	const sceneId =
		segment.type === "transition" ? segment.toSceneId : segment.sceneId;
	const sceneTotal = compiled.segments.reduce((total, candidate) => {
		if (candidate.type === "transition")
			return (
				total +
				(candidate.toSceneId === sceneId || candidate.fromSceneId === sceneId
					? candidate.length
					: 0)
			);
		return total + (candidate.sceneId === sceneId ? candidate.length : 0);
	}, 0);
	if (segment.type === "transition")
		return `\nScene total ${Math.round(sceneTotal)}`;
	const keyframe = tale.indexMap.keyframesById[segment.keyframeId];
	if (!keyframe?.frameId) return `\nScene total ${Math.round(sceneTotal)}`;
	const sourceFrameId = keyframe.frameId.split(":").at(-1) ?? keyframe.frameId;
	const frameTotal = compiled.segments.reduce((total, candidate) => {
		if (candidate.type === "transition") return total;
		const owner = tale.indexMap.keyframesById[candidate.keyframeId]?.frameId;
		return (
			total +
			(owner && (owner.split(":").at(-1) ?? owner) === sourceFrameId
				? candidate.length
				: 0)
		);
	}, 0);
	return `\nScene total ${Math.round(sceneTotal)} | Frame total ${Math.round(frameTotal)}`;
}
