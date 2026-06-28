"use client";

import clsx from "clsx";
import { InspectorButton } from "~/app/(tale-app)/_shared/components/ReaderShell/InspectorButton/InspectorButton";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import type { Anchor } from "~/app/(tale-app)/_shared/types";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";

/**

* Renders editor branch context and block selection inside a reader block.
*
* @param props - Overlay props.
* @param props.anchor - Compiled block anchor rendered by the shared reader.
* @returns Non-interactive hierarchy markers and the optional inspector control.
*
* @example
* <EditorBlockOverlay anchor={anchor} />

*/
export function EditorBlockOverlay({
	anchor,
}: {
	anchor: Anchor;
}): React.JSX.Element {
	const {
		highlightedBranchId,
		hoveredBlockId,
		inspectorControlsOpen,
		openInspector,
		selectedBlockId,
		selectedBranchId,
	} = useTaleEditorStoreShallow((state) => ({
		highlightedBranchId: state.editor.highlightedBranchId,
		hoveredBlockId: state.editor.hoveredBlockId,
		inspectorControlsOpen: state.editor.inspectorControlsOpen,
		openInspector: state.editor.openInspector,
		selectedBlockId: state.editor.selectedBlockId,
		selectedBranchId: state.editor.selectedBranchId,
	}));
	const currentBlockId = useTaleReaderStore(
		(state) => state.navigation.current?.blockId,
	);
	const blockIsCurrent = currentBlockId === anchor.block.id;
	const blockHovered = hoveredBlockId === anchor.block.id;
	const blockSelected = selectedBlockId === anchor.block.id;

	const selectedBorderColor = "border-cyan-300";
	const selectedBgColor = "bg-cyan-300";
	const hoveredBorderColor = "border-emerald-300";
	const hoveredBgColor = "bg-emerald-300";
	const currentBorderColor = "border-fuchsia-300";
	const currentBgColor = "bg-fuchsia-300";

	const branchHoveredBorderColor = "border-fuchsia-300";
	const branchHoveredBgColor = "bg-fuchsia-300";
	const branchSelectedBorderColor = "border-amber-300";
	const branchSelectedBgColor = "bg-amber-300";

	const branchHovered =
		highlightedBranchId === anchor.branch.id || blockHovered;
	const branchSelected =
		selectedBranchId === anchor.branch.id ||
		(blockSelected && anchor.block.branchId === anchor.branch.id);
	const branchColor = branchHovered
		? branchHoveredBorderColor
		: branchSelectedBorderColor;
	const branchMarkerColor = branchHovered
		? branchHoveredBgColor
		: branchSelectedBgColor;
	const defaultBlockColor = blockHovered
		? hoveredBorderColor
		: blockIsCurrent
			? currentBorderColor
			: selectedBorderColor;
	const showsBlockCorners = blockSelected || blockHovered || blockIsCurrent;

	return (
		<>
			{branchSelected || branchHovered ? (
				<div
					data-reader-component="EditorBlockOverlay"
					data-reader-role={
						branchHovered ? "hovered-branch" : "selected-branch"
					}
					className={clsx(
						"pointer-events-none absolute inset-0 z-[24] rounded-[inherit] border-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.7)]",
						branchColor,
					)}
				>
					<span
						className={clsx(
							"absolute top-2 left-2 h-2.5 w-2.5 rounded-full border border-background/70 shadow-lg",
							branchMarkerColor,
						)}
					/>
				</div>
			) : null}

			{showsBlockCorners ? (
				<div
					data-reader-component="EditorBlockOverlay"
					data-reader-role={blockHovered ? "hovered-block" : "selected-block"}
					className="pointer-events-none absolute inset-2 z-[25]"
				>
					{defaultBlockCornerPositions.map((position) => (
						<span
							key={position}
							className={clsx(
								"absolute h-7 w-7 border-0",
								defaultBlockColor,
								position,
							)}
						/>
					))}
				</div>
			) : null}

			{blockIsCurrent ? (
				<div
					data-reader-component="EditorBlockOverlay"
					data-reader-role="current-block"
					className="pointer-events-none absolute inset-4 z-[26]"
				>
					{currentBlockCornerPositions.map((position) => (
						<span
							key={position}
							className={clsx(
								"absolute h-4 w-4 border-0 border-dashed drop-shadow-[0_0_10px_rgba(190,242,100,0.65)]",
								currentBorderColor,
								position,
							)}
						/>
					))}
				</div>
			) : null}

			{inspectorControlsOpen ? (
				<InspectorButton
					label={`Edit ${anchor.block.title}`}
					position="block"
					onClick={() => openInspector({ id: anchor.block.id, type: "block" })}
				/>
			) : null}
		</>
	);
}

const defaultBlockCornerPositions = [
	"top-0 left-0 border-t-[3px] border-l-[3px]",
	"top-0 right-0 border-t-[3px] border-r-[3px]",
	"bottom-0 left-0 border-b-[3px] border-l-[3px]",
	"right-0 bottom-0 border-r-[3px] border-b-[3px]",
] as const;

const currentBlockCornerPositions = [
	"top-0 left-0 border-t-[2px] border-l-[2px]",
	"top-0 right-0 border-t-[2px] border-r-[2px]",
	"bottom-0 left-0 border-b-[2px] border-l-[2px]",
	"right-0 bottom-0 border-r-[2px] border-b-[2px]",
] as const;
