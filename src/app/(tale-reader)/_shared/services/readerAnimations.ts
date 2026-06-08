import { gsap } from "gsap";
import type { CSSProperties } from "react";
import type {
	AnimationTrack,
	ResolvedTaleBlock,
	ResolvedTaleFragment,
	TimelineSegment,
} from "../types";
import { clamp, lerp } from "./readerMath";

const defaultGsapEase = gsap.parseEase("power2.out");

export function getBlockStyle(
	block: ResolvedTaleBlock,
	segment: TimelineSegment,
	progress: number,
) {
	if (segment.type === "reading" || segment.type === "pause") {
		const readingProgress =
			segment.type === "pause"
				? segment.pauseType === "start"
					? 0
					: 1
				: progress;
		return animationStyle(
			block.resolved.readingAnimations.scrolling,
			readingProgress,
		);
	}
	const transitionAnimations = segment.from.block.resolved.transitionAnimations;
	return segment.to.block.id === block.id
		? animationStyle(transitionAnimations.entering, progress)
		: animationStyle(transitionAnimations.leaving, progress);
}

export function getFragmentStyle(
	fragment: ResolvedTaleFragment,
	segment: TimelineSegment,
	blockId: string,
	progress: number,
	options?: { committed?: boolean },
): CSSProperties {
	if (options?.committed) {
		return readingFragmentStyle(fragment, fragment.resolvedVisibleRange.end);
	}
	const inReadingBlock =
		segment.type === "reading" && segment.anchor.block.id === blockId;
	if (inReadingBlock) {
		return readingFragmentStyle(fragment, progress);
	}
	if (segment.type === "pause" && segment.anchor.block.id === blockId) {
		return readingFragmentStyle(
			fragment,
			segment.pauseType === "start" ? 0 : 1,
		);
	}

	if (segment.type === "transition" && segment.to.block.id === blockId) {
		return mergeAnimationStyles(
			readingFragmentValues(fragment, 0),
			animationValues(fragment.resolvedAnimations.entering, progress),
		);
	}
	if (segment.type === "transition" && segment.from.block.id === blockId) {
		return mergeAnimationStyles(
			readingFragmentValues(fragment, 1),
			animationValues(fragment.resolvedAnimations.leaving, progress),
		);
	}
	return { opacity: 0 };
}

function readingFragmentStyle(
	fragment: ResolvedTaleFragment,
	progress: number,
) {
	return mergeAnimationStyles(readingFragmentValues(fragment, progress));
}

function readingFragmentValues(
	fragment: ResolvedTaleFragment,
	progress: number,
) {
	const range = fragment.resolvedVisibleRange;
	const visible = progress >= range.start && progress <= range.end;
	const local = clamp(
		(progress - range.start) / Math.max(0.0001, range.end - range.start),
		0,
		1,
	);
	const values = animationValues(fragment.resolvedAnimations.scrolling, local);
	values.opacity *= visible ? 1 : 0;
	return values;
}

function animationStyle(tracks: readonly AnimationTrack[], progress: number) {
	return mergeAnimationStyles(animationValues(tracks, progress));
}

function animationValues(tracks: readonly AnimationTrack[], progress: number) {
	const values = {
		blur: 0,
		opacity: 1,
		rotate: 0,
		scale: 1,
		translateX: 0,
		translateY: 0,
	};
	for (const track of tracks) {
		const local = defaultGsapEase(
			clamp(
				(progress - track.start) / Math.max(0.0001, track.end - track.start),
				0,
				1,
			),
		);
		switch (track.property) {
			case "opacity":
				values.opacity *= lerp(track.from, track.to, local);
				break;
			case "translate":
				if (track.axis === "x") {
					values.translateX += lerp(track.from, track.to, local);
				} else {
					values.translateY += lerp(track.from, track.to, local);
				}
				break;
			case "scale":
				values.scale *= lerp(track.from, track.to, local);
				break;
			case "rotate":
				values.rotate += lerp(track.from, track.to, local);
				break;
			case "blur":
				values.blur += Math.sin(local * Math.PI) * track.strength;
				break;
			case "glitch":
				values.translateX += Math.sin(progress * 70) * track.strength * 8;
				break;
		}
	}
	return values;
}

function mergeAnimationStyles(
	baseStyle: CSSProperties | ReturnType<typeof animationValues>,
	...valuesList: ReturnType<typeof animationValues>[]
): CSSProperties {
	const base =
		"translateX" in baseStyle
			? baseStyle
			: {
					blur: 0,
					opacity: Number(baseStyle.opacity ?? 1),
					rotate: 0,
					scale: 1,
					translateX: 0,
					translateY: 0,
				};
	const values = { ...base };
	for (const next of valuesList) {
		values.blur += next.blur;
		values.opacity *= next.opacity;
		values.rotate += next.rotate;
		values.scale *= next.scale;
		values.translateX += next.translateX;
		values.translateY += next.translateY;
	}
	return {
		filter: `blur(${values.blur}px)`,
		opacity: values.opacity,
		transform: `translate3d(${values.translateX}px, ${values.translateY}px, 0) scale(${values.scale}) rotate(${values.rotate}deg)`,
	};
}

export function writeAnimationStyle(
	element: HTMLElement,
	style: CSSProperties,
) {
	gsap.set(element, {
		filter: String(style.filter ?? ""),
		opacity: style.opacity ?? 1,
		transform: String(style.transform ?? ""),
	});
}
