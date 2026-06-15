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
		border: style?.border,
		borderRadius: style?.borderRadius,
		boxShadow: style?.boxShadow,
		color: style?.color,
		fontSize: style?.fontSize,
		fontWeight: style?.fontWeight,
		height: style?.height,
		lineHeight: style?.lineHeight,
		margin: style?.margin,
		maxHeight: style?.maxHeight,
		maxWidth: style?.maxWidth,
		minHeight: style?.minHeight,
		minWidth: style?.minWidth,
		opacity: style?.opacity,
		overflow: style?.overflow,
		padding: style?.padding,
		paddingBlock: style?.paddingBlock,
		paddingInline: style?.paddingInline,
		textAlign: style?.textAlign,
		width: style?.width,
		zIndex: style?.zIndex,
	};
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
 * @returns Display properties used by a fragment frame.
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
