"use client";

import type { CSSProperties } from "react";
import type { ReaderStyle, TaleNode } from "../../../types";
import {
	getReaderDisplayStyle,
	getReaderLayoutItemStyle,
	getSharedReaderStyle,
} from "./readerStyleProperties";

type FlexNode = Extract<TaleNode, { mode: "flex" }>;
type GridNode = Extract<TaleNode, { mode: "grid" }>;

/**
 * Converts node style config into DOM CSS for the node container.
 *
 * @param node - The node being rendered.
 * @param measurement - Whether intrinsic block size is being measured.
 * @returns CSS properties for the node wrapper.
 *
 * @example
 * const style = getNodeStyle(node);
 */
export function getNodeStyle(
	node: TaleNode,
	measurement = false,
): CSSProperties {
	const style = node.style;
	const base = getBaseNodeStyle(node, style);
	if (
		measurement &&
		typeof base.height === "string" &&
		base.height.trim().endsWith("%")
	) {
		base.height = "auto";
	}

	if (node.mode === "grid") {
		return getGridNodeStyle(node, style, base);
	}

	if (node.mode === "flex") {
		return getFlexNodeStyle(node, style, base);
	}

	if (node.mode === "free") {
		return {
			...base,
			height: measurement ? "auto" : "100%",
			position: "relative",
			width: "100%",
		};
	}

	return {
		...base,
		alignItems: node.align ?? style?.alignItems,
		display: "grid",
		gap: node.gap ?? style?.gap,
		justifyItems: node.justify,
	};
}

/**
 * Converts fragment style config into DOM CSS inside a parent node context.
 *
 * @param style - Fragment style config.
 * @param parentNode - Node that owns the fragment.
 * @returns CSS properties for the fragment wrapper.
 *
 * @example
 * const style = getNodeFragmentStyle(fragment.style, node);
 */
export function getNodeFragmentStyle(
	style: ReaderStyle | undefined,
	parentNode: TaleNode,
): CSSProperties {
	const parentIsGrid = parentNode.mode === "grid";
	return {
		...getSharedReaderStyle(style),
		...getReaderLayoutItemStyle(style, parentIsGrid),
		...getReaderDisplayStyle(style),
	} satisfies CSSProperties;
}

/**
 * Builds the node CSS shared by every node display mode.
 *
 * @param node - Node that owns layout behavior such as overflow.
 * @param style - Optional persisted reader style config.
 * @returns Base CSS properties shared by all node modes.
 *
 * @example
 * const base = getBaseNodeStyle(node, node.style);
 */
function getBaseNodeStyle(
	node: TaleNode,
	style: ReaderStyle | undefined,
): CSSProperties {
	return {
		...getSharedReaderStyle(style),
		...getReaderLayoutItemStyle(style),
		overflow:
			node.overflow === "clip" ? "hidden" : (style?.overflow ?? "visible"),
	};
}

/**
 * Builds CSS for grid-mode nodes.
 *
 * @param node - Grid node being rendered.
 * @param style - Optional persisted reader style config.
 * @param base - Base node CSS shared by every mode.
 * @returns Grid-mode CSS properties.
 *
 * @example
 * const style = getGridNodeStyle(node, node.style, base);
 */
function getGridNodeStyle(
	node: GridNode,
	style: ReaderStyle | undefined,
	base: CSSProperties,
): CSSProperties {
	return {
		...base,
		display: "grid",
		alignContent: style?.alignContent,
		alignItems: style?.alignItems,
		columnGap: style?.columnGap,
		gap: node.gap ?? style?.gap,
		gridAutoColumns: style?.gridAutoColumns,
		gridAutoFlow: style?.gridAutoFlow,
		gridAutoRows: style?.gridAutoRows,
		gridTemplateAreas: style?.gridTemplateAreas,
		gridTemplateColumns:
			style?.gridTemplateColumns ??
			(node.columns
				? `repeat(${node.columns}, minmax(0, 1fr))`
				: "minmax(0, 1fr)"),
		gridTemplateRows:
			style?.gridTemplateRows ??
			(node.rows ? `repeat(${node.rows}, minmax(0, 1fr))` : "auto"),
		justifyContent: style?.justifyContent,
		justifyItems: style?.justifyItems,
		rowGap: style?.rowGap,
	};
}

/**
 * Builds CSS for flex-mode nodes.
 *
 * @param node - Flex node being rendered.
 * @param style - Optional persisted reader style config.
 * @param base - Base node CSS shared by every mode.
 * @returns Flex-mode CSS properties.
 *
 * @example
 * const style = getFlexNodeStyle(node, node.style, base);
 */
function getFlexNodeStyle(
	node: FlexNode,
	style: ReaderStyle | undefined,
	base: CSSProperties,
): CSSProperties {
	return {
		...base,
		alignItems: node.align ?? style?.alignItems,
		alignContent: style?.alignContent,
		columnGap: style?.columnGap,
		display: "flex",
		flexDirection: style?.flexDirection ?? node.direction ?? "row",
		flexWrap: style?.flexWrap ?? (node.wrap ? "wrap" : "nowrap"),
		gap: node.gap ?? style?.gap,
		justifyContent: node.justify ?? style?.justifyContent,
		rowGap: style?.rowGap,
	};
}
