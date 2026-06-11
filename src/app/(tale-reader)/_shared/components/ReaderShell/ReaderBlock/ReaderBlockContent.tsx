"use client";

import type { Anchor, ResolvedTaleFragment, TalePath } from "../../../types";
import { ReaderFragment } from "../ReaderFragment/ReaderFragment";
import { NodeRenderer } from "./NodeRenderer";
import { positionedStyle } from "./positionedStyle";

export function ReaderBlockContent({
	anchor,
	onChoosePath,
}: {
	anchor: Anchor;
	onChoosePath: (path: TalePath) => void;
}) {
	return (
		<>
			<div
				data-reader-component="ReaderBlockContent"
				data-reader-role="clipped-content-layer"
				className="absolute inset-0 overflow-hidden"
			>
				<div
					data-reader-component="ReaderBlockContent"
					data-reader-role="block-visual-overlay"
					className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_42%,rgba(0,0,0,0.42))]"
				/>
				<div
					data-reader-component="ReaderBlockContent"
					data-reader-role="node-content-layer"
					className="relative min-h-full w-full overflow-hidden"
				>
					<NodeRenderer
						anchor={anchor}
						nodeId={anchor.block.rootNodeId}
						onChoosePath={onChoosePath}
					/>
				</div>
				{anchor.block.clippedFragments.length > 0 ? (
					<PositionedFragments
						anchor={anchor}
						fragments={anchor.block.clippedFragments}
						onChoosePath={onChoosePath}
					/>
				) : null}
			</div>
			{anchor.block.overflowingFragments.length > 0 ? (
				<PositionedFragments
					anchor={anchor}
					fragments={anchor.block.overflowingFragments}
					onChoosePath={onChoosePath}
				/>
			) : null}
		</>
	);
}

function PositionedFragments({
	anchor,
	fragments,
	onChoosePath,
}: {
	anchor: Anchor;
	fragments: ResolvedTaleFragment[];
	onChoosePath: (path: TalePath) => void;
}) {
	return fragments.map((fragment, index) => (
		<div
			key={fragment.id}
			data-reader-component="PositionedFragments"
			data-reader-fragment-id={fragment.id}
			data-reader-role="positioned-fragment-frame"
			className="absolute flex items-center justify-center"
			style={{
				fontSize: fragment.style?.fontSize,
				fontWeight: fragment.style?.fontWeight,
				height: fragment.style?.height,
				lineHeight: fragment.style?.lineHeight,
				maxHeight: fragment.style?.maxHeight,
				maxWidth: fragment.style?.maxWidth,
				minHeight: fragment.style?.minHeight,
				minWidth: fragment.style?.minWidth,
				textAlign: fragment.style?.textAlign,
				...positionedStyle(fragment.placement),
			}}
		>
			<div
				data-reader-component="PositionedFragments"
				data-reader-role="positioned-fragment-content"
				className="w-full"
			>
				<ReaderFragment
					contentSized={anchor.block.size.mode === "content"}
					fragment={fragment}
					index={index}
					onChoosePath={onChoosePath}
				/>
			</div>
		</div>
	));
}
