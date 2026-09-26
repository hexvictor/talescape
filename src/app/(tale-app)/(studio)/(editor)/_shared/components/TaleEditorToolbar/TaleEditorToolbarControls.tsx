"use client";

import { PanelsTopLeft, ScanLine } from "lucide-react";
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
		autoSelectTarget,
		graphOpen,
		livePreviewOpen,
		rightPanelOpen,
		setAutoSelectTarget,
		setGraphOpen,
		setLivePreviewOpen,
		setRightPanelOpen,
	} = useTaleStudioStoreShallow((state) => ({
		autoSelectTarget: state.editorLayout.autoSelectTarget,
		graphOpen: state.editorLayout.graphOpen,
		livePreviewOpen: state.editorLayout.livePreviewOpen,
		rightPanelOpen: state.editorLayout.rightPanelOpen,
		setAutoSelectTarget: state.editorLayout.setAutoSelectTarget,
		setGraphOpen: state.editorLayout.setGraphOpen,
		setLivePreviewOpen: state.editorLayout.setLivePreviewOpen,
		setRightPanelOpen: state.editorLayout.setRightPanelOpen,
	}));

	return (
		<>
			{livePreviewOpen ? <TaleEditorLivePreviewSelectionControls /> : null}
			{livePreviewOpen ? (
				<div className="flex items-center border-2 border-foreground bg-background">
					<AutoSelectButton
						active={autoSelectTarget === "scene"}
						icon={<PanelsTopLeft size={14} />}
						label="Scene"
						onToggle={() =>
							setAutoSelectTarget(autoSelectTarget === "scene" ? "off" : "scene")
						}
					/>
					<AutoSelectButton
						active={autoSelectTarget === "frame"}
						icon={<ScanLine size={14} />}
						label="Frame"
						onToggle={() =>
							setAutoSelectTarget(autoSelectTarget === "frame" ? "off" : "frame")
						}
					/>
				</div>
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
function AutoSelectButton({
	active,
	icon,
	label,
	onToggle,
}: {
	active: boolean;
	icon: React.ReactNode;
	label: string;
	onToggle: () => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			aria-pressed={active}
			className={[
				"flex h-8 items-center justify-center gap-2 border-0 border-foreground px-2.5 font-bold text-[10px] uppercase transition first:border-r-2",
				active
					? "border-primary/45 bg-primary/14 text-primary"
					: "border-foreground/12 text-foreground/62 hover:bg-foreground/8 hover:text-foreground",
			].join(" ")}
			title={`Automatically inspect the active ${label}`}
			onClick={onToggle}
		>
			{icon}
			<span className="hidden lg:inline">Auto {label}</span>
		</button>
	);
}
