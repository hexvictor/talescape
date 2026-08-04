"use client";

import { Target } from "lucide-react";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";
import { EditorPreviewSelectionControls } from "./EditorPreviewSelectionControls";
import { EditorSurfaceVisibilityControls } from "./EditorSurfaceVisibilityControls";

/**
 * Renders the centered editor toolbar controls for preview selection and pane visibility.
 *
 * @returns Editing toolbar middle controls.
 *
 * @example
 * <EditorToolbarMiddleControls />
 */
export function EditorToolbarMiddleControls(): React.JSX.Element {
	const { previewOpen, setPreviewOpen } = useTaleAppStoreShallow((state) => ({
		previewOpen: state.runtime.previewOpen,
		setPreviewOpen: state.runtime.setPreviewOpen,
	}));
	const {
		autoSelectActiveBlock,
		graphOpen,
		rightPanelOpen,
		setAutoSelectActiveBlock,
		setGraphOpen,
		setRightPanelOpen,
	} = useTaleEditorStoreShallow((state) => ({
		autoSelectActiveBlock: state.editorWorkspace.autoSelectActiveBlock,
		graphOpen: state.editorWorkspace.graphOpen,
		rightPanelOpen: state.editorWorkspace.rightPanelOpen,
		setAutoSelectActiveBlock: state.editorWorkspace.setAutoSelectActiveBlock,
		setGraphOpen: state.editorWorkspace.setGraphOpen,
		setRightPanelOpen: state.editorWorkspace.setRightPanelOpen,
	}));

	return (
		<>
			{previewOpen ? <EditorPreviewSelectionControls /> : null}
			{previewOpen ? (
				<AutoSelectActiveBlockButton
					active={autoSelectActiveBlock}
					onToggle={() => setAutoSelectActiveBlock(!autoSelectActiveBlock)}
				/>
			) : null}
			<EditorSurfaceVisibilityControls
				graphOpen={graphOpen}
				previewOpen={previewOpen}
				rightPanelOpen={rightPanelOpen}
				onGraphOpenChange={setGraphOpen}
				onPreviewOpenChange={setPreviewOpen}
				onRightPanelOpenChange={setRightPanelOpen}
			/>
		</>
	);
}

/**
 * Renders the active-block auto-selection toolbar toggle.
 *
 * @param props - Toggle state and behavior.
 * @param props.active - Whether automatic active block selection is enabled.
 * @param props.onToggle - Toggles automatic active block selection.
 * @returns Auto-select active block button.
 *
 * @example
 * <AutoSelectActiveBlockButton active onToggle={toggle} />
 */
function AutoSelectActiveBlockButton({
	active,
	onToggle,
}: {
	active: boolean;
	onToggle: () => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			aria-pressed={active}
			className={[
				"flex h-9 items-center justify-center gap-2 rounded border px-2.5 font-semibold text-xs transition",
				active
					? "border-primary/45 bg-primary/14 text-primary"
					: "border-foreground/12 text-foreground/62 hover:bg-foreground/8 hover:text-foreground",
			].join(" ")}
			title="Automatically inspect the active block"
			onClick={onToggle}
		>
			<span className="font-medium md:hidden">Auto-Select</span>
			<Target size={14} />
		</button>
	);
}
