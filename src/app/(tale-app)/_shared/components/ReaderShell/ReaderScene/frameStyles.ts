"use client";

import type { CSSProperties } from "react";
import type {
	AnimationSelection,
	ReaderStyle,
	TaleFrame,
} from "../../../types";
import {
	getReaderDisplayStyle,
	getReaderLayoutItemStyle,
	getSharedReaderStyle,
} from "./readerStyleProperties";

type FlexFrame = Extract<TaleFrame, { mode: "flex" }>;
type GridFrame = Extract<TaleFrame, { mode: "grid" }>;

/**
 * Converts frame style config into DOM CSS for the frame container.
 *
 * @param frame - The frame being rendered.
 * @param measurement - Whether intrinsic Scene size is being measured.
 * @returns CSS properties for the frame wrapper.
 *
 * @example
 * const style = getFrameStyle(frame);
 */
export function getFrameStyle(
	frame: TaleFrame,
	measurement = false,
): CSSProperties {
	const style = frame.style;
	const base = getBaseFrameStyle(frame, style);
	if (
		measurement &&
		typeof base.height === "string" &&
		base.height.trim().endsWith("%")
	) {
		base.height = "auto";
	}
	if (
		measurement &&
		typeof base.width === "string" &&
		base.width.trim().endsWith("%")
	) {
		base.width = "max-content";
	}

	if (frame.mode === "grid") {
		return getGridFrameStyle(frame, style, base);
	}

	if (frame.mode === "flex") {
		return getFlexFrameStyle(frame, style, base);
	}

	if (frame.mode === "free") {
		return {
			...base,
			height: measurement ? (base.height ?? "auto") : (base.height ?? "100%"),
			position: "relative",
			width: measurement
				? (base.width ?? "max-content")
				: (base.width ?? "100%"),
		};
	}

	return {
		...base,
		alignItems: frame.align ?? style?.alignItems,
		display: "grid",
		gap: frame.gap ?? style?.gap,
		justifyItems: frame.justify,
	};
}

/**
 * Converts Element style config into DOM CSS inside a parent frame context.
 *
 * @param style - Element style config.
 * @param parentFrame - Node that owns the Element.
 * @returns CSS properties for the Element wrapper.
 *
 * @example
 * const style = getFrameElementStyle(Element.style, frame);
 */
export function getFrameElementStyle(
	style: ReaderStyle | undefined,
	parentFrame: TaleFrame,
): CSSProperties {
	const parentIsGrid = parentFrame.mode === "grid";
	return {
		...getSharedReaderStyle(style),
		...getReaderLayoutItemStyle(style, parentIsGrid),
		...getReaderDisplayStyle(style),
	} satisfies CSSProperties;
}

/** Provides the authored pre-entry appearance before the animation engine paints. */
export function getAnimationInitialStyle(
	selection: AnimationSelection,
): CSSProperties {
	if (!(selection.applyInitialStateBeforeStart ?? true)) return {};
	let opacity: number | undefined;
	let blur = 0;
	let rotate = 0;
	let scale = 1;
	let x: number | string = 0;
	let y: number | string = 0;
	let z: number | string = 0;
	let hasTransform = false;
	for (const track of selection.animations) {
		if (track.property === "opacity") opacity = track.from;
		if (track.property === "blur") blur = 0;
		if (track.property === "rotate") {
			rotate = track.from;
			hasTransform = true;
		}
		if (track.property === "scale") {
			scale = track.from;
			hasTransform = true;
		}
		if (track.property === "translate") {
			const viewport = track.unit === "viewport";
			x =
				track.axis === "y"
					? 0
					: viewport
						? `${track.from * 100}vw`
						: track.from;
			y =
				track.axis === "y"
					? viewport
						? `${track.from * 100}vh`
						: track.from
					: viewport
						? `${(track.fromY ?? 0) * 100}vh`
						: (track.fromY ?? 0);
			z =
				track.axis === "xyz"
					? viewport
						? `${(track.fromZ ?? 0) * 100}vmin`
						: (track.fromZ ?? 0)
					: 0;
			hasTransform = true;
		}
	}
	return {
		filter: blur > 0 ? `blur(${blur}px)` : undefined,
		opacity,
		transform: hasTransform
			? `translate3d(${cssLength(x)}, ${cssLength(y)}, ${cssLength(z)}) rotate(${rotate}deg) scale(${scale})`
			: undefined,
	};
}

function cssLength(value: number | string): string {
	return typeof value === "number" ? `${value}px` : value;
}

/**
 * Builds the frame CSS shared by every frame display mode.
 *
 * @param frame - Node that owns layout behavior such as overflow.
 * @param style - Optional persisted reader style config.
 * @returns Base CSS properties shared by all frame modes.
 *
 * @example
 * const base = getBaseFrameStyle(frame, frame.style);
 */
function getBaseFrameStyle(
	frame: TaleFrame,
	style: ReaderStyle | undefined,
): CSSProperties {
	return {
		...getSharedReaderStyle(style),
		...getReaderLayoutItemStyle(style),
		position:
			!style?.position || style.position === "static"
				? "relative"
				: style.position,
		overflow:
			frame.overflow === "clip" ? "hidden" : (style?.overflow ?? "visible"),
	};
}

/**
 * Builds CSS for grid-mode frames.
 *
 * @param frame - Grid frame being rendered.
 * @param style - Optional persisted reader style config.
 * @param base - Base frame CSS shared by every mode.
 * @returns Grid-mode CSS properties.
 *
 * @example
 * const style = getGridFrameStyle(frame, frame.style, base);
 */
function getGridFrameStyle(
	frame: GridFrame,
	style: ReaderStyle | undefined,
	base: CSSProperties,
): CSSProperties {
	return {
		...base,
		display: "grid",
		alignContent: style?.alignContent,
		alignItems: style?.alignItems,
		columnGap: style?.columnGap,
		gap: frame.gap ?? style?.gap,
		gridAutoColumns: style?.gridAutoColumns,
		gridAutoFlow: style?.gridAutoFlow,
		gridAutoRows: style?.gridAutoRows,
		gridTemplateAreas: style?.gridTemplateAreas,
		gridTemplateColumns:
			style?.gridTemplateColumns ??
			(frame.columns
				? `repeat(${frame.columns}, minmax(0, 1fr))`
				: "minmax(0, 1fr)"),
		gridTemplateRows:
			style?.gridTemplateRows ??
			(frame.rows ? `repeat(${frame.rows}, minmax(0, 1fr))` : "auto"),
		justifyContent: style?.justifyContent,
		justifyItems: style?.justifyItems,
		rowGap: style?.rowGap,
	};
}

/**
 * Builds CSS for flex-mode frames.
 *
 * @param frame - Flex frame being rendered.
 * @param style - Optional persisted reader style config.
 * @param base - Base frame CSS shared by every mode.
 * @returns Flex-mode CSS properties.
 *
 * @example
 * const style = getFlexFrameStyle(frame, frame.style, base);
 */
function getFlexFrameStyle(
	frame: FlexFrame,
	style: ReaderStyle | undefined,
	base: CSSProperties,
): CSSProperties {
	return {
		...base,
		alignItems: frame.align ?? style?.alignItems,
		alignContent: style?.alignContent,
		columnGap: style?.columnGap,
		display: "flex",
		flexDirection: style?.flexDirection ?? frame.direction ?? "row",
		flexWrap: style?.flexWrap ?? (frame.wrap ? "wrap" : "nowrap"),
		gap: frame.gap ?? style?.gap,
		justifyContent: frame.justify ?? style?.justifyContent,
		rowGap: style?.rowGap,
	};
}
