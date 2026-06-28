import { gsap } from "gsap";
import type {
	AnimationTrack,
	CompiledReader,
	ResolvedTaleBlock,
	ResolvedTaleFragment,
	TaleNode,
	TimelineSegment,
	ViewportSize,
} from "../types";
import { clamp, lerp } from "./readerMath";

type AnimationValues = {
	blur: number;
	opacity: number;
	rotate: number;
	scale: number;
	translateX: number;
	translateY: number;
	translateZ: number;
};

type CompiledAnimationTrack = AnimationTrack & {
	commitId: string;
	ease: (progress: number) => number;
	inverseDuration: number;
	pathSampler?: (progress: number) => { x: number; y: number };
};

type CompiledAnimationSelection = readonly CompiledAnimationTrack[];

type FragmentAnimationPlan = {
	ambient: CompiledAnimationSelection;
	entering: CompiledAnimationSelection;
	hasAnimation: boolean;
	leaving: CompiledAnimationSelection;
	scrolling: CompiledAnimationSelection;
	visibleRange: ResolvedTaleFragment["resolvedVisibleRange"];
};

type BlockAnimationPlan = {
	ambient: CompiledAnimationSelection;
	previousVisibleDuringEnter: CompiledAnimationSelection;
	scrolling: CompiledAnimationSelection;
	transitionEntering: CompiledAnimationSelection;
	transitionLeaving: CompiledAnimationSelection;
};

export type ReaderAnimationPlan = {
	ambientBlockIds: Set<string>;
	animatedBlockIds: Set<string>;
	animatedFragmentIdsByBlockId: Map<string, string[]>;
	blockAnimationsById: Map<string, BlockAnimationPlan>;
	fragmentAnimationsById: Map<string, FragmentAnimationPlan>;
	nodeAnimationsById: Map<string, FragmentAnimationPlan>;
	animatedNodeIdsByBlockId: Map<string, string[]>;
};

const defaultGsapEase = gsap.parseEase("power2.out");
const writtenValuesByElement = new WeakMap<
	HTMLElement,
	{ filter: string; opacity: string; transform: string }
>();

/**
 * Compiles animation tracks and indexes once for the active reader route.
 *
 * @param compiled - Compiled reader route.
 * @param viewport - Active viewport used to compile viewport-relative translation values.
 * @returns Animation programs indexed by block and fragment id.
 *
 * @example
 * const animationPlan = compileReaderAnimationPlan(compiled);
 */
export function compileReaderAnimationPlan(
	compiled: CompiledReader,
	viewport: ViewportSize,
): ReaderAnimationPlan {
	const ambientBlockIds = new Set<string>();
	const animatedBlockIds = new Set<string>();
	const animatedFragmentIdsByBlockId = new Map<string, string[]>();
	const blockAnimationsById = new Map<string, BlockAnimationPlan>();
	const fragmentAnimationsById = new Map<string, FragmentAnimationPlan>();
	const nodeAnimationsById = new Map<string, FragmentAnimationPlan>();
	const animatedNodeIdsByBlockId = new Map<string, string[]>();

	for (
		let anchorIndex = 0;
		anchorIndex < compiled.anchors.length;
		anchorIndex++
	) {
		const anchor = compiled.anchors[anchorIndex];
		if (!anchor) continue;
		const block = anchor.block;
		const blockCompilation = compileBlockAnimations(block, viewport);
		blockAnimationsById.set(block.id, blockCompilation.plan);
		if (blockCompilation.hasAnimation) animatedBlockIds.add(block.id);
		if (blockCompilation.hasAmbient) ambientBlockIds.add(block.id);

		const previousAnchor = compiled.anchors[anchorIndex - 1];
		if (previousAnchor && blockCompilation.plan.transitionLeaving.length > 0) {
			animatedBlockIds.add(previousAnchor.block.id);
		}

		const animatedFragmentIds: string[] = [];
		for (const fragment of block.fragments) {
			const fragmentPlan = compileEntityAnimations(
				fragment.animations,
				fragment.resolvedVisibleRange,
				`fragment:${fragment.id}`,
				viewport,
			);
			fragmentAnimationsById.set(fragment.id, fragmentPlan);
			if (fragmentPlan.hasAnimation) animatedFragmentIds.push(fragment.id);
			if (fragmentPlan.ambient.length > 0) ambientBlockIds.add(block.id);
		}
		animatedFragmentIdsByBlockId.set(block.id, animatedFragmentIds);
		const animatedNodeIds: string[] = [];
		for (const node of block.nodes) {
			const nodePlan = compileEntityAnimations(
				node.animations,
				{ end: 1, start: 0 },
				`node:${node.id}`,
				viewport,
			);
			nodeAnimationsById.set(node.id, nodePlan);
			if (nodePlan.hasAnimation) animatedNodeIds.push(node.id);
			if (nodePlan.ambient.length > 0) ambientBlockIds.add(block.id);
		}
		animatedNodeIdsByBlockId.set(block.id, animatedNodeIds);
	}

	return {
		ambientBlockIds,
		animatedBlockIds,
		animatedFragmentIdsByBlockId,
		blockAnimationsById,
		fragmentAnimationsById,
		nodeAnimationsById,
		animatedNodeIdsByBlockId,
	};
}

/**
 * Compiles one block's scroll, transition, override, and ambient tracks.
 *
 * @param block - Resolved block animation source.
 * @param viewport - Active viewport used for relative translation values.
 * @returns Compiled block plan and indexing flags.
 */
function compileBlockAnimations(
	block: ResolvedTaleBlock,
	viewport: ViewportSize,
): {
	hasAmbient: boolean;
	hasAnimation: boolean;
	plan: BlockAnimationPlan;
} {
	const plan: BlockAnimationPlan = {
		ambient: compileAmbientTracks(
			block.resolved.readingAnimations.ambient,
			block.resolved.readingAnimations.ambientCycleDurationMs,
			block.resolved.readingAnimations.ambientPlayback,
			`block:${block.id}:loop`,
			viewport,
		),
		scrolling: compileTracks(
			block.resolved.readingAnimations.scrolling,
			`block:${block.id}:scrolling`,
			viewport,
		),
		previousVisibleDuringEnter: compileTracks(
			block.resolved.transitionAnimations.previousVisible,
			`block:${block.id}:previous-visible`,
			viewport,
		),
		transitionEntering: compileTracks(
			block.resolved.transitionAnimations.entering,
			`block:${block.id}:entering`,
			viewport,
		),
		transitionLeaving: compileTracks(
			block.resolved.transitionAnimations.leaving,
			`block:${block.id}:leaving`,
			viewport,
		),
	};
	return {
		hasAmbient: plan.ambient.length > 0,
		hasAnimation: [
			plan.ambient,
			plan.previousVisibleDuringEnter,
			plan.scrolling,
			plan.transitionEntering,
			plan.transitionLeaving,
		].some((selection) => selection.length > 0),
		plan,
	};
}

/**
 * Compiles one fragment's animation tracks and visibility behavior.
 *
 * @param animations - Resolved fragment or node animation source.
 * @param visibleRange - Entity visibility range inside block reading progress.
 * @param commitPrefix - Stable prefix used for committed track identifiers.
 * @param viewport - Active viewport used for relative translation values.
 * @returns Compiled fragment animation plan.
 */
function compileEntityAnimations(
	animations: TaleNode["animations"] | ResolvedTaleFragment["animations"],
	visibleRange: ResolvedTaleFragment["resolvedVisibleRange"],
	commitPrefix: string,
	viewport: ViewportSize,
): FragmentAnimationPlan {
	const plan: FragmentAnimationPlan = {
		ambient: compileAmbientTracks(
			animations.ambient.animations,
			animations.ambient.cycleDurationMs ?? 2400,
			animations.ambient.playback ?? "alternate",
			`${commitPrefix}:loop`,
			viewport,
		),
		entering: compileTracks(
			animations.entering.animations,
			`${commitPrefix}:entering`,
			viewport,
		),
		hasAnimation: false,
		leaving: compileTracks(
			animations.leaving.animations,
			`${commitPrefix}:leaving`,
			viewport,
		),
		scrolling: compileTracks(
			animations.scrolling.animations,
			`${commitPrefix}:scrolling`,
			viewport,
		),
		visibleRange,
	};
	plan.hasAnimation =
		plan.ambient.length > 0 ||
		plan.entering.length > 0 ||
		plan.leaving.length > 0 ||
		plan.scrolling.length > 0 ||
		plan.visibleRange.start !== 0 ||
		plan.visibleRange.end !== 1;
	return plan;
}

/**
 * Checks whether any visible block requires continuous animation frames.
 *
 * @param plan - Compiled animation plan.
 * @param blockIds - Visible block ids.
 * @returns Whether the frame loop should continue while scroll is idle.
 */
export function hasAmbientAnimations(
	plan: ReaderAnimationPlan,
	blockIds: readonly string[],
): boolean {
	return blockIds.some((blockId) => plan.ambientBlockIds.has(blockId));
}

/**
 * Evaluates a block animation into a reusable values object.
 *
 * @param plan - Compiled animation plan.
 * @param blockId - Block being painted.
 * @param segment - Active timeline segment.
 * @param progress - Normalized segment progress.
 * @param committedAnimationIds - Completed one-way animation track ids.
 * @param timeMs - Current animation clock time.
 * @param target - Mutable values object reused by the caller.
 * @returns Whether the block requires an animation style write.
 */
export function evaluateBlockAnimation(
	plan: ReaderAnimationPlan,
	blockId: string,
	segment: TimelineSegment,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
): boolean {
	if (!plan.animatedBlockIds.has(blockId)) return false;
	resetValues(target);
	const blockAnimations = plan.blockAnimationsById.get(blockId);

	if (segment.type === "reading" || segment.type === "pause") {
		const readingProgress =
			segment.type === "pause"
				? segment.pauseType === "start"
					? 0
					: 1
				: progress;
		evaluateTracks(
			blockAnimations?.scrolling ?? [],
			readingProgress,
			target,
			committedAnimationIds,
		);
		evaluateAmbient(
			blockAnimations?.ambient ?? [],
			timeMs,
			readingProgress,
			target,
		);
		return true;
	}

	const isEntering = segment.to.block.id === blockId;
	const destinationAnimations = plan.blockAnimationsById.get(
		segment.to.block.id,
	);
	const currentBlockAnimations = plan.blockAnimationsById.get(blockId);
	const transition = segment.to.block.transition;
	const configuredLength = isEntering
		? transition.enteringLength
		: transition.leavingLength;
	const phaseLength = Math.max(configuredLength ?? segment.length, 1);
	const traveled = progress * segment.length;
	const phaseProgress = isEntering
		? clamp((traveled - (segment.length - phaseLength)) / phaseLength, 0, 1)
		: clamp(traveled / phaseLength, 0, 1);
	const tracks = isEntering
		? (destinationAnimations?.transitionEntering ?? [])
		: (currentBlockAnimations?.transitionLeaving ?? []);
	evaluateTracks(tracks, phaseProgress, target, committedAnimationIds);
	evaluateAmbient(blockAnimations?.ambient ?? [], timeMs, progress, target);
	return true;
}

/**
 * Evaluates the destination block's custom takeover tracks onto one previous
 * visible block while that destination block is entering.
 *
 * @param plan - Compiled animation plan.
 * @param destinationBlockId - Incoming block that owns the takeover policy.
 * @param progress - Normalized destination entering progress.
 * @param committedAnimationIds - Completed one-way animation track ids.
 * @param target - Mutable values object reused by the caller.
 * @returns Whether any custom previous-visible tracks were applied.
 *
 * @example
 * evaluatePreviousVisibleBlockAnimation(plan, segment.to.block.id, 0.5, committedIds, values);
 */
export function evaluatePreviousVisibleBlockAnimation(
	plan: ReaderAnimationPlan,
	destinationBlockId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	target: AnimationValues,
): boolean {
	const destinationAnimations = plan.blockAnimationsById.get(destinationBlockId);
	const tracks = destinationAnimations?.previousVisibleDuringEnter ?? [];
	if (tracks.length === 0) return false;
	evaluateTracks(tracks, progress, target, committedAnimationIds);
	return true;
}

/**
 * Evaluates a fragment animation into a reusable values object.
 *
 * @param plan - Compiled animation plan.
 * @param fragmentId - Fragment being painted.
 * @param segment - Active timeline segment.
 * @param blockId - Owning block id.
 * @param progress - Normalized segment progress.
 * @param committedAnimationIds - Completed one-way animation track ids.
 * @param timeMs - Current animation clock time.
 * @param target - Mutable values object reused by the caller.
 * @returns Whether the fragment requires an animation style write.
 */
export function evaluateFragmentAnimation(
	plan: ReaderAnimationPlan,
	fragmentId: string,
	segment: TimelineSegment,
	blockId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
): boolean {
	const animations = plan.fragmentAnimationsById.get(fragmentId);
	if (!animations?.hasAnimation) return false;
	resetValues(target);

	if (segment.type === "reading" && segment.anchor.block.id === blockId) {
		evaluateReadingFragment(
			animations,
			progress,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(animations, timeMs, progress, target);
		return true;
	}
	if (segment.type === "pause" && segment.anchor.block.id === blockId) {
		evaluateReadingFragment(
			animations,
			segment.pauseType === "start" ? 0 : 1,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(
			animations,
			timeMs,
			segment.pauseType === "start" ? 0 : 1,
			target,
		);
		return true;
	}
	if (segment.type === "transition" && segment.to.block.id === blockId) {
		evaluateReadingFragment(animations, 0, committedAnimationIds, target);
		evaluateTracks(
			animations.entering,
			progress,
			target,
			committedAnimationIds,
		);
		evaluateFragmentAmbient(animations, timeMs, 0, target);
		return true;
	}
	if (segment.type === "transition" && segment.from.block.id === blockId) {
		evaluateReadingFragment(animations, 1, committedAnimationIds, target);
		evaluateTracks(animations.leaving, progress, target, committedAnimationIds);
		evaluateFragmentAmbient(animations, timeMs, 1, target);
		return true;
	}
	target.opacity = 0;
	evaluateFragmentAmbient(animations, timeMs, 0, target);
	return true;
}

/**
 * Evaluates one node animation using the same timeline semantics as fragments.
 *
 * @param plan - Compiled reader animation plan.
 * @param nodeId - Node being painted.
 * @param segment - Active reader segment.
 * @param blockId - Node owner block id.
 * @param progress - Normalized segment progress.
 * @param committedAnimationIds - Completed one-way animation track ids.
 * @param timeMs - Current animation clock.
 * @param target - Reusable output values.
 * @returns Whether the node needs an animation style write.
 */
export function evaluateNodeAnimation(
	plan: ReaderAnimationPlan,
	nodeId: string,
	segment: TimelineSegment,
	blockId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
): boolean {
	const animations = plan.nodeAnimationsById.get(nodeId);
	if (!animations) return false;
	return evaluateEntityAnimation(
		animations,
		segment,
		blockId,
		progress,
		committedAnimationIds,
		timeMs,
		target,
	);
}

/**
 * Evaluates a compiled node or fragment animation plan.
 *
 * @param animations - Compiled entity animations.
 * @param segment - Active reader segment.
 * @param blockId - Owning block id.
 * @param progress - Segment progress.
 * @param committedAnimationIds - Completed one-way track ids.
 * @param timeMs - Current animation clock.
 * @param target - Reusable output values.
 * @returns Whether styles should be written.
 */
function evaluateEntityAnimation(
	animations: FragmentAnimationPlan,
	segment: TimelineSegment,
	blockId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
): boolean {
	if (!animations.hasAnimation) return false;
	resetValues(target);
	if (segment.type === "reading" && segment.anchor.block.id === blockId) {
		evaluateReadingFragment(
			animations,
			progress,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(animations, timeMs, progress, target);
		return true;
	}
	if (segment.type === "pause" && segment.anchor.block.id === blockId) {
		const readingProgress = segment.pauseType === "start" ? 0 : 1;
		evaluateReadingFragment(
			animations,
			readingProgress,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(animations, timeMs, readingProgress, target);
		return true;
	}
	if (segment.type === "transition" && segment.to.block.id === blockId) {
		evaluateReadingFragment(animations, 0, committedAnimationIds, target);
		evaluateTracks(
			animations.entering,
			progress,
			target,
			committedAnimationIds,
		);
		evaluateFragmentAmbient(animations, timeMs, 0, target);
		return true;
	}
	if (segment.type === "transition" && segment.from.block.id === blockId) {
		evaluateReadingFragment(animations, 1, committedAnimationIds, target);
		evaluateTracks(animations.leaving, progress, target, committedAnimationIds);
		evaluateFragmentAmbient(animations, timeMs, 1, target);
		return true;
	}
	target.opacity = 0;
	return true;
}

/**
 * Composes one fragment's repeating tracks over its timeline animation.
 *
 * @param animations - Compiled fragment animation plan.
 * @param timeMs - Current animation clock time.
 * @param target - Mutable animation values receiving the composition.
 * @returns Nothing.
 *
 * @example
 * evaluateFragmentAmbient(animations, performance.now(), values);
 */
function evaluateFragmentAmbient(
	animations: FragmentAnimationPlan,
	timeMs: number,
	readingProgress: number,
	target: AnimationValues,
): void {
	evaluateAmbient(animations.ambient, timeMs, readingProgress, target);
}

/**
 * Creates a reusable identity animation values object.
 *
 * @returns Mutable identity values.
 */
export function createAnimationValues(): AnimationValues {
	return {
		blur: 0,
		opacity: 1,
		rotate: 0,
		scale: 1,
		translateX: 0,
		translateY: 0,
		translateZ: 0,
	};
}

/**
 * Writes evaluated animation values directly and skips unchanged properties.
 *
 * @param element - Animated DOM element.
 * @param values - Evaluated animation values.
 * @returns Nothing.
 */
export function writeAnimationValues(
	element: HTMLElement,
	values: AnimationValues,
): void {
	const opacity = String(values.opacity);
	const transform = `translate3d(${values.translateX}px, ${values.translateY}px, ${values.translateZ}px) scale(${values.scale}) rotate(${values.rotate}deg)`;
	const filter =
		Math.abs(values.blur) < 0.001 ? "none" : `blur(${values.blur}px)`;
	const previous = writtenValuesByElement.get(element);

	if (previous?.opacity !== opacity) element.style.opacity = opacity;
	if (previous?.transform !== transform) element.style.transform = transform;
	if (previous?.filter !== filter) element.style.filter = filter;
	writtenValuesByElement.set(element, { filter, opacity, transform });
}

/**
 * Compiles normalized animation track ranges.
 *
 * @param tracks - Authored animation tracks.
 * @param commitPrefix - Stable prefix used for committed track identifiers.
 * @param viewport - Active viewport used for relative translation values.
 * @returns Tracks with precomputed inverse durations.
 */
function compileTracks(
	tracks: readonly AnimationTrack[],
	commitPrefix: string,
	viewport: ViewportSize,
): CompiledAnimationSelection {
	return tracks.map((track, index) => {
		const id = track.id ?? `${track.property}-${index}`;
		const compiledTrack = compileTranslateTrack(track, viewport);
		return {
			...compiledTrack,
			commitId: `${commitPrefix}:${id}`,
			ease:
				gsap.parseEase(compiledTrack.easing ?? "power2.out") ?? defaultGsapEase,
			inverseDuration:
				1 / Math.max(0.0001, compiledTrack.end - compiledTrack.start),
			pathSampler:
				compiledTrack.property === "motionPath"
					? compileMotionPathSampler(compiledTrack.path)
					: undefined,
		};
	});
}

/**
 * Compiles ambient tracks as full-cycle animations without timeline offsets.
 *
 * @param tracks - Authored looping animation tracks.
 * @param fallbackDurationMs - Legacy selection duration used by older data.
 * @param fallbackPlayback - Legacy selection direction used by older data.
 * @param commitPrefix - Stable prefix used for committed track identifiers.
 * @param viewport - Active viewport used for relative translation values.
 * @returns Ambient tracks normalized to the complete repeating cycle.
 */
function compileAmbientTracks(
	tracks: readonly AnimationTrack[],
	fallbackDurationMs: number,
	fallbackPlayback: "alternate" | "restart",
	commitPrefix: string,
	viewport: ViewportSize,
): CompiledAnimationSelection {
	return compileTracks(
		tracks.map((track) => ({
			...track,
			end: 1,
			loopDurationSeconds:
				track.loopDurationSeconds ?? fallbackDurationMs / 1000,
			loopPlayback: track.loopPlayback ?? fallbackPlayback,
			start: 0,
		})),
		commitPrefix,
		viewport,
	);
}

/**
 * Converts viewport-relative translation values into pixels during compilation.
 *
 * @param track - Authored animation track.
 * @param viewport - Active viewport dimensions.
 * @returns Track with pixel translation values ready for frame evaluation.
 */
function compileTranslateTrack(
	track: AnimationTrack,
	viewport: ViewportSize,
): AnimationTrack {
	if (track.property !== "translate" || track.unit !== "viewport") return track;
	const depthScale = Math.min(viewport.width, viewport.height);
	return {
		...track,
		from: track.from * (track.axis === "y" ? viewport.height : viewport.width),
		fromY:
			track.axis === "xy" || track.axis === "xyz"
				? (track.fromY ?? 0) * viewport.height
				: track.fromY,
		fromZ: track.axis === "xyz" ? (track.fromZ ?? 0) * depthScale : track.fromZ,
		to: track.to * (track.axis === "y" ? viewport.height : viewport.width),
		toY:
			track.axis === "xy" || track.axis === "xyz"
				? (track.toY ?? 0) * viewport.height
				: track.toY,
		toZ: track.axis === "xyz" ? (track.toZ ?? 0) * depthScale : track.toZ,
		unit: "px",
	};
}

/**
 * Evaluates scroll-linked fragment tracks and visibility.
 *
 * @param animations - Fragment animation plan.
 * @param progress - Block reading progress.
 * @param target - Mutable animation values.
 * @returns Nothing.
 */
function evaluateReadingFragment(
	animations: FragmentAnimationPlan,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	target: AnimationValues,
): void {
	const range = animations.visibleRange;
	const visible = progress >= range.start && progress <= range.end;
	const local = clamp(
		(progress - range.start) / Math.max(0.0001, range.end - range.start),
		0,
		1,
	);
	evaluateTracks(animations.scrolling, local, target, committedAnimationIds);
	if (!visible) target.opacity = 0;
}

/**
 * Evaluates one track selection with later tracks replacing the same property.
 *
 * @param tracks - Compiled animation tracks.
 * @param progress - Normalized selection progress.
 * @param target - Mutable animation values.
 * @returns Nothing.
 */
function evaluateTracks(
	tracks: CompiledAnimationSelection,
	progress: number,
	target: AnimationValues,
	committedAnimationIds?: ReadonlySet<string>,
	composition: "compose" | "replace" = "replace",
): void {
	for (const track of tracks) {
		if (!isTrackVisible(track, progress)) continue;
		const evaluatedProgress =
			track.playback === "commitOnComplete" &&
			committedAnimationIds?.has(track.commitId)
				? 1
				: progress;
		evaluateTrack(track, evaluatedProgress, target, composition);
	}
}

/**
 * Evaluates one compiled animation track into mutable output values.
 *
 * @param track - Compiled animation track.
 * @param progress - Normalized track progress.
 * @param target - Mutable output values.
 * @param composition - Whether values replace or compose with current output.
 * @returns Nothing.
 */
function evaluateTrack(
	track: CompiledAnimationTrack,
	progress: number,
	target: AnimationValues,
	composition: "compose" | "replace",
): void {
	const local = track.ease(
		clamp((progress - track.start) * track.inverseDuration, 0, 1),
	);
	switch (track.property) {
		case "opacity":
			target.opacity =
				composition === "compose"
					? target.opacity * lerp(track.from, track.to, local)
					: lerp(track.from, track.to, local);
			break;
		case "translate":
			if (track.axis === "x") {
				target.translateX =
					composition === "compose"
						? target.translateX + lerp(track.from, track.to, local)
						: lerp(track.from, track.to, local);
			} else if (track.axis === "y") {
				target.translateY =
					composition === "compose"
						? target.translateY + lerp(track.from, track.to, local)
						: lerp(track.from, track.to, local);
			} else {
				const x = lerp(track.from, track.to, local);
				const y = lerp(track.fromY ?? 0, track.toY ?? 0, local);
				target.translateX =
					composition === "compose" ? target.translateX + x : x;
				target.translateY =
					composition === "compose" ? target.translateY + y : y;
				if (track.axis === "xyz") {
					const z = lerp(track.fromZ ?? 0, track.toZ ?? 0, local);
					target.translateZ =
						composition === "compose" ? target.translateZ + z : z;
				}
			}
			break;
		case "scale":
			target.scale =
				composition === "compose"
					? target.scale * lerp(track.from, track.to, local)
					: lerp(track.from, track.to, local);
			break;
		case "rotate":
			target.rotate =
				composition === "compose"
					? target.rotate + lerp(track.from, track.to, local)
					: lerp(track.from, track.to, local);
			break;
		case "blur":
			target.blur =
				(composition === "compose" ? target.blur : 0) +
				Math.sin(local * Math.PI) * track.strength;
			break;
		case "motionPath": {
			const point = track.pathSampler?.(lerp(track.from, track.to, local));
			if (!point) break;
			target.translateX =
				composition === "compose" ? target.translateX + point.x : point.x;
			target.translateY =
				composition === "compose" ? target.translateY + point.y : point.y;
			break;
		}
	}
}

/**
 * Evaluates continuously repeating tracks with independent timing.
 *
 * @param tracks - Compiled looping tracks.
 * @param timeMs - Current animation clock time.
 * @param target - Mutable animation values.
 * @returns Nothing.
 */
function evaluateAmbient(
	tracks: CompiledAnimationSelection,
	timeMs: number,
	readingProgress: number,
	target: AnimationValues,
): void {
	for (const track of tracks) {
		if (!isTrackVisible(track, readingProgress)) continue;
		const durationMs = Math.max((track.loopDurationSeconds ?? 2.4) * 1000, 100);
		const cycle = (timeMs % durationMs) / durationMs;
		const progress =
			(track.loopPlayback ?? "alternate") === "alternate"
				? cycle <= 0.5
					? cycle * 2
					: (1 - cycle) * 2
				: cycle;
		evaluateTrack(track, progress, target, "compose");
	}
}

/**
 * Restores a reusable values object to transform identity.
 *
 * @param values - Mutable animation values.
 * @returns Nothing.
 */
function resetValues(values: AnimationValues): void {
	values.blur = 0;
	values.opacity = 1;
	values.rotate = 0;
	values.scale = 1;
	values.translateX = 0;
	values.translateY = 0;
	values.translateZ = 0;
}

/**
 * Returns whether a track is active inside its authored visibility window.
 *
 * @param track - Compiled animation track.
 * @param progress - Current normalized block progress.
 * @returns Whether the track should contribute animation values.
 */
function isTrackVisible(
	track: CompiledAnimationTrack,
	progress: number,
): boolean {
	const range = track.visibleRange ?? { end: 1, start: 0 };
	return progress >= range.start && progress <= range.end;
}

/**
 * Compiles an SVG path string into a reusable point sampler.
 *
 * @param pathData - SVG path data.
 * @returns Path sampler, or undefined when the path is invalid.
 */
function compileMotionPathSampler(
	pathData: string,
): ((progress: number) => { x: number; y: number }) | undefined {
	if (typeof document === "undefined" || !pathData.trim()) return undefined;
	const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("d", pathData);
	try {
		const length = path.getTotalLength();
		if (!Number.isFinite(length) || length <= 0) return undefined;
		return (progress) => {
			const point = path.getPointAtLength(clamp(progress, 0, 1) * length);
			return { x: point.x, y: point.y };
		};
	} catch {
		return undefined;
	}
}

/**
 * Finds one-way animation tracks completed by the active timeline state.
 *
 * @param plan - Compiled animation plan.
 * @param blockId - Block being evaluated.
 * @param segment - Active timeline segment.
 * @param progress - Normalized segment progress.
 * @returns Completed animation track ids.
 */
export function getCompletedAnimationIds(
	plan: ReaderAnimationPlan,
	blockId: string,
	segment: TimelineSegment,
	progress: number,
): string[] {
	const plans = [...getEntityPlansForBlock(plan, blockId)];
	const completed: string[] = [];
	for (const animation of plans) {
		const tracks =
			segment.type === "transition"
				? segment.to.block.id === blockId
					? animation.entering
					: animation.leaving
				: animation.scrolling;
		for (const track of tracks) {
			if (
				track.playback === "commitOnComplete" &&
				progress >= track.end &&
				isTrackVisible(track, progress)
			) {
				completed.push(track.commitId);
			}
		}
	}
	const blockAnimations = plan.blockAnimationsById.get(blockId);
	const blockTracks =
		segment.type === "transition"
			? segment.to.block.id === blockId
				? (blockAnimations?.transitionEntering ?? [])
				: (plan.blockAnimationsById.get(segment.to.block.id)
						?.transitionLeaving ?? [])
			: (blockAnimations?.scrolling ?? []);
	for (const track of blockTracks) {
		if (
			track.playback === "commitOnComplete" &&
			progress >= track.end &&
			isTrackVisible(track, progress)
		) {
			completed.push(track.commitId);
		}
	}
	return completed;
}

/**
 * Collects fragment and node animation plans owned by a block.
 *
 * @param plan - Compiled animation plan.
 * @param blockId - Owner block id.
 * @returns Entity animation plans for that block.
 */
function getEntityPlansForBlock(
	plan: ReaderAnimationPlan,
	blockId: string,
): FragmentAnimationPlan[] {
	return [
		...(plan.animatedFragmentIdsByBlockId.get(blockId) ?? []).flatMap((id) => {
			const item = plan.fragmentAnimationsById.get(id);
			return item ? [item] : [];
		}),
		...(plan.animatedNodeIdsByBlockId.get(blockId) ?? []).flatMap((id) => {
			const item = plan.nodeAnimationsById.get(id);
			return item ? [item] : [];
		}),
	];
}
