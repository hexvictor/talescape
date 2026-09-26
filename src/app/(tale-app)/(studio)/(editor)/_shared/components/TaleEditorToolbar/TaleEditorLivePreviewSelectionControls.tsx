"use client";

import { Frame, GitBranch, LayoutTemplate, ScanSearch } from "lucide-react";
import { useTaleStudioStoreShallow } from "~/app/(tale-app)/(studio)/_shared/hooks/useTaleStudioStore";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";

/**
 * Renders editor actions that target the active block or branch in preview.
 *
 * These controls sit in the editor toolbar so they do not overlap the preview
 * viewport's own reader UI.
 *
 * @returns Preview-driven editor actions.
 *
 * @example
 * <TaleEditorLivePreviewSelectionControls />
 */
export function TaleEditorLivePreviewSelectionControls(): React.JSX.Element {
	const toolbarButtonClass =
		"grid h-9 w-9 place-items-center border-2 border-foreground bg-background text-foreground/72 shadow-[2px_2px_0_hsl(var(--secondary))] transition hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-35";
	const { activeSceneId, activeBranchId, activeKeyframeId } =
		useTaleReaderStoreShallow((state) => ({
			activeSceneId: state.navigation.current?.sceneId ?? null,
			activeBranchId: state.navigation.current?.branchId ?? null,
			activeKeyframeId: state.navigation.current?.keyframeId ?? null,
		}));
	const activeFrameId = useTaleAppStore((state) =>
		activeKeyframeId
			? (state.document.tale.indexMap.keyframesById[activeKeyframeId]?.frameId ?? null)
			: null,
	);
	const {
		inspectorControlsOpen,
		openInspector,
		selectSceneForEditing,
		selectBranchForEditing,
		setRightPanelOpen,
		toggleInspectorControls,
	} = useTaleStudioStoreShallow((state) => ({
		inspectorControlsOpen: state.studioSelection.inspectorControlsOpen,
		openInspector: state.studioSelection.openInspector,
		selectSceneForEditing: state.studioSelection.selectSceneForEditing,
		selectBranchForEditing: state.studioSelection.selectBranchForEditing,
		setRightPanelOpen: state.editorLayout.setRightPanelOpen,
		toggleInspectorControls: state.studioSelection.toggleInspectorControls,
	}));

	/**
	 * Opens the editor sidebar.
	 *
	 * @returns Nothing.
	 */
	const openSidebar = (): void => setRightPanelOpen(true);

	return (
		<div
			data-reader-component="TaleEditorLivePreviewSelectionControls"
			data-reader-role="preview-selection-controls"
			className="flex items-center gap-2"
		>
			<button
				type="button"
				disabled={!activeSceneId}
				className={toolbarButtonClass}
				title="Select active Scene"
				onClick={() => {
					if (!activeSceneId) return;
					selectSceneForEditing(activeSceneId);
					openSidebar();
				}}
			>
				<LayoutTemplate size={15} />
			</button>
			<button
				type="button"
				disabled={!activeSceneId || !activeFrameId}
				className={toolbarButtonClass}
				title="Select active Frame"
				onClick={() => {
					if (!activeSceneId || !activeFrameId) return;
					openInspector({
						id: activeFrameId,
						sceneId: activeSceneId,
						type: "frame",
					});
					openSidebar();
				}}
			>
				<Frame size={15} />
			</button>
			<button
				type="button"
				disabled={!activeBranchId}
				className={toolbarButtonClass}
				title="Select active branch"
				onClick={() => {
					if (!activeBranchId) return;
					selectBranchForEditing(activeBranchId);
					openSidebar();
				}}
			>
				<GitBranch size={15} />
			</button>
			<button
				type="button"
				aria-pressed={inspectorControlsOpen}
				className={`${toolbarButtonClass} ${
					inspectorControlsOpen ? "bg-primary text-primary-foreground" : ""
				}`}
				title="Toggle preview inspector"
				onClick={() => {
					toggleInspectorControls();
					openSidebar();
				}}
			>
				<ScanSearch size={15} />
			</button>
		</div>
	);
}
