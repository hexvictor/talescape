"use client";

import clsx from "clsx";
import { InspectorButton } from "~/app/(tale-app)/_shared/components/ReaderShell/InspectorButton/InspectorButton";
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
	const blockHovered = hoveredBlockId === anchor.block.id;
	const blockSelected = selectedBlockId === anchor.block.id;
	const branchHovered =
		highlightedBranchId === anchor.branch.id || blockHovered;
	const branchSelected =
		selectedBranchId === anchor.branch.id ||
		(blockSelected && anchor.block.branchId === anchor.branch.id);
	const branchColor = branchHovered ? "border-fuchsia-300" : "border-amber-300";
	const branchMarkerColor = branchHovered ? "bg-fuchsia-300" : "bg-amber-300";
	const blockColor = blockHovered ? "border-emerald-300" : "border-cyan-300";

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
			{blockSelected || blockHovered ? (
				<div
					data-reader-component="EditorBlockOverlay"
					data-reader-role={blockHovered ? "hovered-block" : "selected-block"}
					className="pointer-events-none absolute inset-2 z-[25]"
				>
					{blockCornerPositions.map((position) => (
						<span
							key={position}
							className={clsx(
								"absolute h-7 w-7 border-0",
								blockColor,
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

const blockCornerPositions = [
	"top-0 left-0 border-t-[3px] border-l-[3px]",
	"top-0 right-0 border-t-[3px] border-r-[3px]",
	"bottom-0 left-0 border-b-[3px] border-l-[3px]",
	"right-0 bottom-0 border-r-[3px] border-b-[3px]",
] as const;
