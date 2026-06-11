import { gsap } from "gsap";
import type {
	AnimationTrack,
	CompiledReader,
	ResolvedTaleFragment,
	TimelineSegment,
} from "../types";
import { clamp, lerp } from "./readerMath";

type AnimationValues = {
	blur: number;
	opacity: number;
	rotate: number;
	scale: number;
	translateX: number;
	translateY: number;
};

type CompiledAnimationTrack = AnimationTrack & {
	inverseDuration: number;
};

type CompiledAnimationSelection = readonly CompiledAnimationTrack[];

type FragmentAnimationPlan = {
	entering: CompiledAnimationSelection;
	hasAnimation: boolean;
	leaving: CompiledAnimationSelection;
	scrolling: CompiledAnimationSelection;
	visibleRange: ResolvedTaleFragment["resolvedVisibleRange"];
};

export type ReaderAnimationPlan = {
	animatedBlockIds: Set<string>;
	animatedFragmentIdsByBlockId: Map<string, string[]>;
	blockAnimationsById: Map<
		string,
		{
			reading: CompiledAnimationSelection;
			transitionEntering: CompiledAnimationSelection;
			transitionLeaving: CompiledAnimationSelection;
		}
	>;
	fragmentAnimationsById: Map<string, FragmentAnimationPlan>;
};

const defaultGsapEase = gsap.parseEase("power2.out");
const writtenValuesByElement = new WeakMap<
	HTMLElement,
	{ filter: string; opacity: string; transform: string }
>();

/**
 * Compiles animation ranges and target indexes once for the active reader
 * route.
 *
 * @param compiled - Compiled reader route.
 * @returns Animation programs indexed by block and fragment id.
 *
 * @example
 * const animationPlan = compileReaderAnimationPlan(compiled);
 */
export function compileReaderAnimationPlan(
	compiled: CompiledReader,
): ReaderAnimationPlan {
	const animatedBlockIds = new Set<string>();
	const animatedFragmentIdsByBlockId = new Map<string, string[]>();
	const blockAnimationsById = new Map<
		string,
		{
			reading: CompiledAnimationSelection;
			transitionEntering: CompiledAnimationSelection;
			transitionLeaving: CompiledAnimationSelection;
		}
	>();
	const fragmentAnimationsById = new Map<string, FragmentAnimationPlan>();

	for (
		let anchorIndex = 0;
		anchorIndex < compiled.anchors.length;
		anchorIndex++
	) {
		const anchor = compiled.anchors[anchorIndex];
		if (!anchor) continue;
		const block = anchor.block;
		const animatedFragmentIds: string[] = [];
		const reading = compileTracks(block.resolved.readingAnimations.scrolling);
		const transitionEntering = compileTracks(
			block.resolved.transitionAnimations.entering,
		);
		const transitionLeaving = compileTracks(
			block.resolved.transitionAnimations.leaving,
		);
		blockAnimationsById.set(block.id, {
			reading,
			transitionEntering,
			transitionLeaving,
		});
		if (
			reading.length > 0 ||
			transitionEntering.length > 0 ||
			transitionLeaving.length > 0
		) {
			animatedBlockIds.add(block.id);
		}

		const nextAnchor = compiled.anchors[anchorIndex + 1];
		if (transitionEntering.length > 0 && nextAnchor) {
			animatedBlockIds.add(nextAnchor.block.id);
		}

		for (const fragment of block.fragments) {
			const entering = compileTracks(fragment.resolvedAnimations.entering);
			const leaving = compileTracks(fragment.resolvedAnimations.leaving);
			const scrolling = compileTracks(fragment.resolvedAnimations.scrolling);
			const visibleRange = fragment.resolvedVisibleRange;
			fragmentAnimationsById.set(fragment.id, {
				entering,
				hasAnimation:
					entering.length > 0 ||
					leaving.length > 0 ||
					scrolling.length > 0 ||
					visibleRange.start !== 0 ||
					visibleRange.end !== 1,
				leaving,
				scrolling,
				visibleRange,
			});
			if (
				entering.length > 0 ||
				leaving.length > 0 ||
				scrolling.length > 0 ||
				visibleRange.start !== 0 ||
				visibleRange.end !== 1
			) {
				animatedFragmentIds.push(fragment.id);
			}
		}
		animatedFragmentIdsByBlockId.set(block.id, animatedFragmentIds);
	}

	return {
		animatedBlockIds,
		animatedFragmentIdsByBlockId,
		blockAnimationsById,
		fragmentAnimationsById,
	};
}

/**
 * Evaluates a block animation into a reusable values object.
 *
 * @param plan - Compiled animation plan.
 * @param blockId - Block being painted.
 * @param segment - Active timeline segment.
 * @param progress - Normalized segment progress.
 * @param target - Mutable values object reused by the caller.
 * @returns Whether the block requires an animation style write.
 */
export function evaluateBlockAnimation(
	plan: ReaderAnimationPlan,
	blockId: string,
	segment: TimelineSegment,
	progress: number,
	target: AnimationValues,
): boolean {
	if (!plan.animatedBlockIds.has(blockId)) return false;
	resetValues(target);

	if (segment.type === "reading" || segment.type === "pause") {
		const animations = plan.blockAnimationsById.get(blockId);
		const readingProgress =
			segment.type === "pause"
				? segment.pauseType === "start"
					? 0
					: 1
				: progress;
		evaluateTracks(animations?.reading ?? [], readingProgress, target);
		return true;
	}

	const transitionAnimations = plan.blockAnimationsById.get(
		segment.from.block.id,
	);
	evaluateTracks(
		segment.to.block.id === blockId
			? (transitionAnimations?.transitionEntering ?? [])
			: (transitionAnimations?.transitionLeaving ?? []),
		progress,
		target,
	);
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
 * @param committed - Whether a one-way animation has completed.
 * @param target - Mutable values object reused by the caller.
 * @returns Whether the fragment requires an animation style write.
 */
export function evaluateFragmentAnimation(
	plan: ReaderAnimationPlan,
	fragmentId: string,
	segment: TimelineSegment,
	blockId: string,
	progress: number,
	committed: boolean,
	target: AnimationValues,
): boolean {
	const animations = plan.fragmentAnimationsById.get(fragmentId);
	if (!animations?.hasAnimation) return false;
	resetValues(target);

	if (committed) {
		evaluateReadingFragment(animations, animations.visibleRange.end, target);
		return true;
	}
	if (segment.type === "reading" && segment.anchor.block.id === blockId) {
		evaluateReadingFragment(animations, progress, target);
		return true;
	}
	if (segment.type === "pause" && segment.anchor.block.id === blockId) {
		evaluateReadingFragment(
			animations,
			segment.pauseType === "start" ? 0 : 1,
			target,
		);
		return true;
	}
	if (segment.type === "transition" && segment.to.block.id === blockId) {
		evaluateReadingFragment(animations, 0, target);
		evaluateTracks(animations.entering, progress, target);
		return true;
	}
	if (segment.type === "transition" && segment.from.block.id === blockId) {
		evaluateReadingFragment(animations, 1, target);
		evaluateTracks(animations.leaving, progress, target);
		return true;
	}
	target.opacity = 0;
	return true;
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
	const transform = `translate3d(${values.translateX}px, ${values.translateY}px, 0) scale(${values.scale}) rotate(${values.rotate}deg)`;
	const filter =
		Math.abs(values.blur) < 0.001 ? "none" : `blur(${values.blur}px)`;
	const previous = writtenValuesByElement.get(element);

	if (previous?.opacity !== opacity) element.style.opacity = opacity;
	if (previous?.transform !== transform) element.style.transform = transform;
	if (previous?.filter !== filter) element.style.filter = filter;
	writtenValuesByElement.set(element, { filter, opacity, transform });
}

function compileTracks(
	tracks: readonly AnimationTrack[],
): CompiledAnimationSelection {
	return tracks.map((track) => ({
		...track,
		inverseDuration: 1 / Math.max(0.0001, track.end - track.start),
	}));
}

function evaluateReadingFragment(
	animations: FragmentAnimationPlan,
	progress: number,
	target: AnimationValues,
): void {
	const range = animations.visibleRange;
	const visible = progress >= range.start && progress <= range.end;
	const local = clamp(
		(progress - range.start) / Math.max(0.0001, range.end - range.start),
		0,
		1,
	);
	evaluateTracks(animations.scrolling, local, target);
	target.opacity *= visible ? 1 : 0;
}

function evaluateTracks(
	tracks: CompiledAnimationSelection,
	progress: number,
	target: AnimationValues,
): void {
	for (const track of tracks) {
		const local = defaultGsapEase(
			clamp((progress - track.start) * track.inverseDuration, 0, 1),
		);
		switch (track.property) {
			case "opacity":
				target.opacity *= lerp(track.from, track.to, local);
				break;
			case "translate":
				if (track.axis === "x") {
					target.translateX += lerp(track.from, track.to, local);
				} else {
					target.translateY += lerp(track.from, track.to, local);
				}
				break;
			case "scale":
				target.scale *= lerp(track.from, track.to, local);
				break;
			case "rotate":
				target.rotate += lerp(track.from, track.to, local);
				break;
			case "blur":
				target.blur += Math.sin(local * Math.PI) * track.strength;
				break;
			case "glitch":
				target.translateX += Math.sin(progress * 70) * track.strength * 8;
				break;
		}
	}
}

function resetValues(values: AnimationValues): void {
	values.blur = 0;
	values.opacity = 1;
	values.rotate = 0;
	values.scale = 1;
	values.translateX = 0;
	values.translateY = 0;
}
