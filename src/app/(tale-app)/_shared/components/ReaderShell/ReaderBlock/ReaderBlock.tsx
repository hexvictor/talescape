"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import { resolveReaderBlockPaintBounds } from "../../../services/readerBlockPaintBounds";
import type { Anchor } from "../../../types";
import { FixedFragments } from "./FixedFragments";
import { ReaderBlockContent } from "./ReaderBlockContent";

/**
 * Renders one measured reader block at its compiled world position.
 *
 * @param props - Compiled anchor and path selection callback.
 * @returns The positioned reader block.
 *
 * @example
 * <ReaderBlock anchor={anchor} />
 */
export function ReaderBlock({
	anchor,
	children,
}: {
	anchor: Anchor;
	children?: ReactNode;
}): React.JSX.Element | null {
	const block = useTaleAppStore(
		(state) => state.document.tale.indexMap.blocksById[anchor.blockId],
	);
	if (!block) return null;
	const paintBounds = resolveReaderBlockPaintBounds(anchor);

	return (
		<article
			data-reader-block-id={anchor.blockId}
			data-reader-component="ReaderBlock"
			data-reader-role="block-container"
			className="absolute flex items-center justify-center overflow-visible"
			style={
				{
					background: block.resolved.background,
					border: block.style?.border,
					borderRadius: block.style?.borderRadius,
					boxShadow: block.style?.boxShadow,
					clipPath: block.style?.clipPath,
					color: block.style?.color,
					height: paintBounds.height,
					left: paintBounds.left,
					top: paintBounds.top,
					visibility: "hidden",
					width: paintBounds.width,
					willChange: "transform, opacity, filter",
				} satisfies CSSProperties
			}
		>
			{children}
			<ReaderBlockContent anchor={anchor} />
			<FixedFragments anchor={anchor} />
		</article>
	);
}
