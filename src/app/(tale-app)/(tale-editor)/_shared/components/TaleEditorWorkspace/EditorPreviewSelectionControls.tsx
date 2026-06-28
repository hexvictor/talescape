"use client";

import { BoxSelect, GitBranch, ScanSearch } from "lucide-react";
import { useTaleReaderStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";

/**
 * Renders editor actions that target the active block or branch in preview.
 *
 * These controls sit in the editor toolbar so they do not overlap the preview
 * viewport's own reader UI.
 *
 * @returns Preview-driven editor actions.
 *
 * @example
 * <EditorPreviewSelectionControls />
 */
export function EditorPreviewSelectionControls(): React.JSX.Element {
	const { activeBlockId, activeBranchId } = useTaleReaderStoreShallow(
		(state) => ({
			activeBlockId: state.navigation.current?.blockId ?? null,
			activeBranchId: state.navigation.current?.branchId ?? null,
		}),
	);
	const {
		inspectorControlsOpen,
		selectBlockForEditing,
		selectBranchForEditing,
		setRightPanelOpen,
		toggleInspectorControls,
	} = useTaleEditorStoreShallow((state) => ({
		inspectorControlsOpen: state.editor.inspectorControlsOpen,
		selectBlockForEditing: state.editor.selectBlockForEditing,
		selectBranchForEditing: state.editor.selectBranchForEditing,
		setRightPanelOpen: state.editorWorkspace.setRightPanelOpen,
		toggleInspectorControls: state.editor.toggleInspectorControls,
	}));

	/**
	 * Opens the editor sidebar.
	 *
	 * @returns Nothing.
	 */
	const openSidebar = (): void => setRightPanelOpen(true);

	return (
		<div
			data-reader-component="EditorPreviewSelectionControls"
			data-reader-role="preview-selection-controls"
			className="flex items-center gap-2"
		>
			<button
				type="button"
				disabled={!activeBlockId}
				className="flex h-9 items-center gap-2 rounded border border-foreground/12 bg-background/72 px-3 text-foreground/68 text-xs hover:bg-foreground/8 hover:text-foreground disabled:opacity-35"
				title="Select active block"
				onClick={() => {
					if (!activeBlockId) return;
					selectBlockForEditing(activeBlockId);
					openSidebar();
				}}
			>
				<BoxSelect size={14} />
			</button>
			<button
				type="button"
				disabled={!activeBranchId}
				className="flex h-9 items-center gap-2 rounded border border-foreground/12 bg-background/72 px-3 text-foreground/68 text-xs hover:bg-foreground/8 hover:text-foreground disabled:opacity-35"
				title="Select active branch"
				onClick={() => {
					if (!activeBranchId) return;
					selectBranchForEditing(activeBranchId);
					openSidebar();
				}}
			>
				<GitBranch size={14} />
			</button>
			<button
				type="button"
				aria-pressed={inspectorControlsOpen}
				className={`grid h-9 w-9 place-items-center rounded border ${
					inspectorControlsOpen
						? "border-primary/45 bg-primary/16 text-primary"
						: "border-foreground/12 bg-background/72 text-foreground/58 hover:bg-foreground/8 hover:text-foreground"
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
