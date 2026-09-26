import type { CSSProperties } from "react";
import type { ReaderStyle } from "../../../types";

/**
 * Converts shared visual and sizing configuration into React CSS properties.
 *
 * @param style - Optional persisted reader style.
 * @returns Shared visual and sizing properties.
 *
 * @example
 * const styleProperties = getSharedReaderStyle(node.style);
 */
export function getSharedReaderStyle(
	style: ReaderStyle | undefined,
): CSSProperties {
	return {
		background: style?.background ?? style?.backgroundCss,
		backgroundImage: style?.backgroundImage
			? `url(${style.backgroundImage})`
			: undefined,
		backgroundPosition: style?.backgroundPosition,
		backgroundRepeat: style?.backgroundRepeat,
		backgroundSize: style?.backgroundSize,
		border: style?.border,
		borderRadius: style?.borderRadius,
		bottom: readerViewportLength(style?.bottom),
		boxShadow: style?.boxShadow,
		clipPath: style?.clipPath,
		color: style?.color,
		fontSize: style?.fontSize,
		fontWeight: style?.fontWeight,
		height: readerViewportLength(style?.height),
		lineHeight: style?.lineHeight,
		left: readerViewportLength(style?.left),
		margin: style?.margin,
		maxHeight: readerViewportLength(style?.maxHeight),
		maxWidth: readerViewportLength(style?.maxWidth),
		minHeight: readerViewportLength(style?.minHeight),
		minWidth: readerViewportLength(style?.minWidth),
		objectFit: style?.objectFit,
		objectPosition: style?.objectPosition,
		opacity: style?.opacity,
		overflow: style?.overflow,
		padding: style?.padding,
		paddingBlock: style?.paddingBlock,
		paddingInline: style?.paddingInline,
		position: style?.position,
		right: readerViewportLength(style?.right),
		textAlign: style?.textAlign,
		top: readerViewportLength(style?.top),
		width: readerViewportLength(style?.width),
		zIndex: style?.zIndex,
	};
}

/**
 * Resolves author-entered viewport units against the actual reader canvas.
 * Studio preview may be shorter than the browser's `vh`, while Scene sizing
 * already uses that canvas size. Keeping both on the same variable prevents
 * Frame and Scene "viewport" dimensions from drifting apart.
 */
function readerViewportLength(value: string | number | undefined) {
	if (typeof value !== "string") return value;
	const match = value.trim().match(/^(-?(?:\d+\.?\d*|\.\d+))(d?v[hw])$/i);
	if (!match) return value;
	const amount = Number(match[1]) / 100;
	const unit = match[2]?.toLowerCase();
	const axis = unit?.endsWith("w") ? "width" : "height";
	return `calc(var(--reader-viewport-${axis}) * ${amount})`;
}

/**
 * Converts flex and grid child placement configuration into CSS properties.
 *
 * @param style - Optional persisted reader style.
 * @param allowGridPlacement - Whether the parent accepts grid placement fields.
 * @returns Layout-item properties for a node or fragment.
 *
 * @example
 * const itemStyle = getReaderLayoutItemStyle(fragment.style, parent.mode === "grid");
 */
export function getReaderLayoutItemStyle(
	style: ReaderStyle | undefined,
	allowGridPlacement = true,
): CSSProperties {
	return {
		alignSelf: style?.alignSelf,
		flexBasis: style?.flexBasis,
		flexGrow: style?.flexGrow,
		flexShrink: style?.flexShrink,
		gridArea: allowGridPlacement ? style?.gridArea : undefined,
		gridColumn: allowGridPlacement ? style?.gridColumn : undefined,
		gridRow: allowGridPlacement ? style?.gridRow : undefined,
		justifySelf: allowGridPlacement ? style?.justifySelf : undefined,
		order: style?.order,
	};
}

/**
 * Converts nested fragment display configuration into CSS properties.
 *
 * @param style - Optional persisted fragment style.
 * @returns Display properties used by a element frame.
 *
 * @example
 * const displayStyle = getReaderDisplayStyle(fragment.style);
 */
export function getReaderDisplayStyle(
	style: ReaderStyle | undefined,
): CSSProperties {
	return {
		columnGap: style?.columnGap,
		display: style?.display,
		flexDirection: style?.flexDirection,
		flexWrap: style?.flexWrap,
		rowGap: style?.rowGap,
	};
}
