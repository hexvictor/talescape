"use client";

import { Target } from "lucide-react";
import { useTaleStudioStoreShallow } from "~/app/(tale-app)/(studio)/_shared/hooks/useTaleStudioStore";
import { TaleEditorLivePreviewSelectionControls } from "./TaleEditorLivePreviewSelectionControls";
import { TaleEditorPaneVisibilityControls } from "./TaleEditorPaneVisibilityControls";

/**
 * Renders editor controls for live-preview selection and pane visibility.
 *
 * @returns Editing toolbar middle controls.
 *
 * @example
 * <TaleEditorToolbarControls />
 */
export function TaleEditorToolbarControls(): React.JSX.Element {
	const {
		autoSelectActiveBlock,
		graphOpen,
		livePreviewOpen,
		rightPanelOpen,
		setAutoSelectActiveBlock,
		setGraphOpen,
		setLivePreviewOpen,
		setRightPanelOpen,
	} = useTaleStudioStoreShallow((state) => ({
		autoSelectActiveBlock: state.editorLayout.autoSelectActiveBlock,
		graphOpen: state.editorLayout.graphOpen,
		livePreviewOpen: state.editorLayout.livePreviewOpen,
		rightPanelOpen: state.editorLayout.rightPanelOpen,
		setAutoSelectActiveBlock: state.editorLayout.setAutoSelectActiveBlock,
		setGraphOpen: state.editorLayout.setGraphOpen,
		setLivePreviewOpen: state.editorLayout.setLivePreviewOpen,
		setRightPanelOpen: state.editorLayout.setRightPanelOpen,
	}));

	return (
		<>
			{livePreviewOpen ? <TaleEditorLivePreviewSelectionControls /> : null}
			{livePreviewOpen ? (
				<AutoSelectActiveBlockButton
					active={autoSelectActiveBlock}
					onToggle={() => setAutoSelectActiveBlock(!autoSelectActiveBlock)}
				/>
			) : null}
			<TaleEditorPaneVisibilityControls
				graphOpen={graphOpen}
				livePreviewOpen={livePreviewOpen}
				rightPanelOpen={rightPanelOpen}
				onGraphOpenChange={setGraphOpen}
				onLivePreviewOpenChange={setLivePreviewOpen}
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
			<span className="hidden font-medium lg:inline">Auto-Select</span>
			<Target size={14} />
		</button>
	);
}
