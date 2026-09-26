"use client";

import { LayoutTemplate } from "lucide-react";
import { InspectorButton } from "~/app/(tale-app)/_shared/components/ReaderShell/InspectorButton/InspectorButton";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import type { Anchor } from "~/app/(tale-app)/_shared/types";
import cn from "~/lib/utils/cn";
import { useTaleStudioStoreShallow } from "../../hooks/useTaleStudioStore";

/**
 * Renders Studio branch context and block selection inside a reader block.
 *
 * @param props - Overlay props.
 * @param props.anchor - Compiled block anchor rendered by the shared reader.
 * @returns Non-interactive hierarchy markers and the optional inspector control.
 *
 * @example
 * <StudioSceneOverlay anchor={anchor} />
 */
export function StudioSceneOverlay({
	anchor,
}: {
	anchor: Anchor;
}): React.JSX.Element {
	const {
		highlightedBranchId,
		hoveredSceneId,
		inspectorControlsOpen,
		openInspector,
		selectedSceneId,
		selectedBranchId,
	} = useTaleStudioStoreShallow((state) => ({
		highlightedBranchId: state.studioSelection.highlightedBranchId,
		hoveredSceneId: state.studioSelection.hoveredSceneId,
		inspectorControlsOpen: state.studioSelection.inspectorControlsOpen,
		openInspector: state.studioSelection.openInspector,
		selectedSceneId: state.studioSelection.selectedSceneId,
		selectedBranchId: state.studioSelection.selectedBranchId,
	}));
	const currentSceneId = useTaleReaderStore(
		(state) => state.navigation.current?.sceneId,
	);
	const blockTitle = useTaleAppStore(
		(state) =>
			state.document.tale.indexMap.scenesById[anchor.sceneId]?.title ?? "block",
	);
	const blockIsCurrent = currentSceneId === anchor.sceneId;
	const blockHovered = hoveredSceneId === anchor.sceneId;
	const blockSelected = selectedSceneId === anchor.sceneId;

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

	const branchHovered = highlightedBranchId === anchor.branchId || blockHovered;
	const branchSelected =
		selectedBranchId === anchor.branchId ||
		(blockSelected && selectedBranchId === anchor.branchId);
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
					data-reader-component="StudioSceneOverlay"
					data-reader-role={
						branchHovered ? "hovered-branch" : "selected-branch"
					}
					className={cn(
						"pointer-events-none absolute inset-0 z-[24] rounded-[inherit] border-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.7)]",
						branchColor,
					)}
				>
					<span
						className={cn(
							"absolute top-2 left-2 h-2.5 w-2.5 rounded-full border border-background/70 shadow-lg",
							branchMarkerColor,
						)}
					/>
				</div>
			) : null}

			{showsBlockCorners ? (
				<div
					data-reader-component="StudioSceneOverlay"
					data-reader-role={blockHovered ? "hovered-block" : "selected-block"}
					className="pointer-events-none absolute inset-2 z-[25]"
				>
					{defaultBlockCornerPositions.map((position) => (
						<span
							key={position}
							className={cn(
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
					data-reader-component="StudioSceneOverlay"
					data-reader-role="current-block"
					className="pointer-events-none absolute inset-4 z-[26]"
				>
					{currentBlockCornerPositions.map((position) => (
						<span
							key={position}
							className={cn(
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
					icon={<LayoutTemplate size={15} />}
					label={`Edit ${blockTitle}`}
					position="scene"
					onClick={() => openInspector({ id: anchor.sceneId, type: "scene" })}
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
