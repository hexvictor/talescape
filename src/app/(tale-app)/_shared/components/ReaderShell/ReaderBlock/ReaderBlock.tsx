"use client";

import type { CSSProperties, ReactNode } from "react";
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
}): React.JSX.Element {
	return (
		<article
			data-reader-block-id={anchor.block.id}
			data-reader-component="ReaderBlock"
			data-reader-role="block-container"
			className="absolute flex items-center justify-center overflow-visible"
			style={
				{
					background: anchor.block.resolved.background,
					border: anchor.block.style?.border,
					borderRadius: anchor.block.style?.borderRadius,
					boxShadow: anchor.block.style?.boxShadow,
					clipPath: anchor.block.style?.clipPath,
					color: anchor.block.style?.color,
					height: anchor.height,
					left: anchor.point.x - anchor.width / 2,
					top: anchor.point.y - anchor.height / 2,
					visibility: "hidden",
					width: anchor.width,
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
