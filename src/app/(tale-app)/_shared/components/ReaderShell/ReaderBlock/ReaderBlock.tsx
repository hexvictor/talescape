"use client";

import type { CSSProperties } from "react";
import { useTaleEditorBridge } from "../../../contexts/TaleEditorBridgeContext";
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
	const {
		highlightedBranchId,
		hoveredBlockId,
		selectedBlockId,
		selectedBranchId,
	} = useTaleEditorBridge();
	const branchHovered = highlightedBranchId === anchor.branch.id;
	const blockHovered = hoveredBlockId === anchor.block.id;
	const blockSelected = selectedBlockId === anchor.block.id;
	const branchSelected =
		selectedBranchId === anchor.branch.id ||
		(blockSelected && anchor.block.branchId === anchor.branch.id);
	const blockOutlineColor = blockHovered
		? "border-emerald-300"
		: "border-cyan-300";
	const branchOutlineColor = branchHovered
		? "border-fuchsia-300"
		: "border-[#d9b56f]";

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
			{branchSelected || branchHovered ? (
				<div
					data-reader-component="ReaderBlock"
					data-reader-role="branch-highlight-outline"
					className={`pointer-events-none absolute inset-0 z-[24] rounded-[inherit] border-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.65),0_0_24px_rgba(217,181,111,0.35)] ${branchOutlineColor}`}
				/>
			) : null}
			{blockSelected || blockHovered ? (
				<div
					data-reader-component="ReaderBlock"
					data-reader-role="block-highlight-outline"
					className={`pointer-events-none absolute inset-1 z-[25] rounded-[inherit] border-2 shadow-[0_0_24px_rgba(103,232,249,0.36)] ${blockOutlineColor}`}
				/>
			) : null}
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
