"use client";

import type { CSSProperties } from "react";
import type { Anchor, TalePath } from "../../../types";
import { InspectorButton } from "../InspectorButton/InspectorButton";
import { FixedFragments } from "./FixedFragments";
import { ReaderBlockContent } from "./ReaderBlockContent";

/**
 * Renders one measured reader block at its compiled world position.
 *
 * @param props - Compiled anchor and path selection callback.
 * @returns The positioned reader block.
 */
export function ReaderBlock({
	anchor,
	onChoosePath,
}: {
	anchor: Anchor;
	onChoosePath: (path: TalePath) => void;
}): React.JSX.Element {
	return (
		<article
			data-reader-block-id={anchor.block.id}
			className="absolute flex items-center justify-center overflow-visible"
			style={
				{
					background: anchor.block.resolved.background,
					border: anchor.block.style?.border,
					borderRadius: anchor.block.style?.borderRadius,
					boxShadow: anchor.block.style?.boxShadow,
					color: anchor.block.style?.color,
					height: anchor.height,
					left: anchor.point.x + anchor.viewportOffset.x - anchor.width / 2,
					top: anchor.point.y + anchor.viewportOffset.y - anchor.height / 2,
					visibility: "hidden",
					width: anchor.width,
					willChange: "transform, opacity, filter",
				} satisfies CSSProperties
			}
		>
			<InspectorButton
				label={`Edit ${anchor.block.title}`}
				position="block"
				target={{ id: anchor.block.id, type: "block" }}
			/>
			<ReaderBlockContent anchor={anchor} onChoosePath={onChoosePath} />
			<FixedFragments anchor={anchor} onChoosePath={onChoosePath} />
		</article>
	);
}
