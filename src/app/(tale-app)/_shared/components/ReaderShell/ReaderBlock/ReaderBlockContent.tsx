"use client";

import { useTaleAppStoreShallow } from "../../../contexts/TaleAppStoreContext";
import { resolveIds } from "../../../services/taleLookups";
import type { Anchor, ResolvedTaleFragment } from "../../../types";
import { TaleFragment } from "../TaleFragment/TaleFragment";
import { NodeRenderer } from "./NodeRenderer";
import { positionedStyle } from "./positionedStyle";

/**
 * Renders the shared block content structure for the live reader or the
 * offscreen intrinsic-size measurement pass.
 *
 * @param props - Block content properties.
 * @param props.anchor - Block anchor and resolved content.
 * @param props.mode - Live rendering or intrinsic measurement mode.
 * @param props.onChoosePath - Choice path callback.
 * @returns Block content layers.
 */
export function ReaderBlockContent({
	anchor,
	mode = "render",
}: {
	anchor: Anchor;
	mode?: "measure" | "render";
}): React.JSX.Element | null {
	const { block, fragmentsById, nodesById } = useTaleAppStoreShallow(
		(state) => ({
			block: state.document.tale.indexMap.blocksById[anchor.blockId],
			fragmentsById: state.document.tale.indexMap.fragmentsById,
			nodesById: state.document.tale.indexMap.nodesById,
		}),
	);
	if (!block) return null;
	const clippedFragments = resolveIds(block.clippedFragmentIds, fragmentsById);
	const overflowingFragments = resolveIds(
		block.overflowingFragmentIds,
		fragmentsById,
	);
	if (mode === "measure") {
		return (
			<div
				data-reader-component="ReaderBlockContent"
				data-reader-role="measurement-content-layer"
				className="relative w-full overflow-visible"
			>
				<NodeRenderer
					measurement
					anchor={anchor}
					contentSized
					fragmentsById={fragmentsById}
					nodeId={block.rootNodeId}
					nodesById={nodesById}
				/>
			</div>
		);
	}

	return (
		<>
			<div
				data-reader-component="ReaderBlockContent"
				data-reader-role="clipped-content-layer"
				className="absolute inset-0 overflow-hidden"
				style={{ clipPath: block.style?.clipPath }}
			>
				<div
					data-reader-component="ReaderBlockContent"
					data-reader-role="block-visual-overlay"
					className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_42%,rgba(0,0,0,0.42))]"
				/>
				<div
					data-reader-component="ReaderBlockContent"
					data-reader-role="node-content-layer"
					className="relative h-full w-full overflow-hidden"
				>
					<NodeRenderer
						anchor={anchor}
						contentSized={block.size.mode === "content"}
						fragmentsById={fragmentsById}
						nodeId={block.rootNodeId}
						nodesById={nodesById}
					/>
				</div>
				{clippedFragments.length > 0 ? (
					<PositionedFragments
						anchor={anchor}
						contentSized={block.size.mode === "content"}
						fragments={clippedFragments}
					/>
				) : null}
			</div>
			{overflowingFragments.length > 0 ? (
				<PositionedFragments
					anchor={anchor}
					contentSized={block.size.mode === "content"}
					fragments={overflowingFragments}
				/>
			) : null}
		</>
	);
}

/**
 * Renders absolute fragments in either the clipped or overflowing block layer.
 *
 * @param props - Positioned fragment properties.
 * @param props.anchor - Owning block anchor.
 * @param props.fragments - Positioned fragments to render.
 * @param props.onChoosePath - Choice path callback.
 * @returns Positioned fragment elements.
 */
function PositionedFragments({
	anchor,
	contentSized,
	fragments,
}: {
	anchor: Anchor;
	contentSized: boolean;
	fragments: ResolvedTaleFragment[];
}): React.JSX.Element[] {
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
				<TaleFragment
					contentSized={contentSized}
					fragment={fragment}
					index={index}
				/>
			</div>
		</div>
	));
}
