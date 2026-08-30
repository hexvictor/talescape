"use client";

import {
	GitBranch,
	PanelRightClose,
	PanelRightOpen,
	SquareMousePointer,
} from "lucide-react";
import type { ReactNode } from "react";

/**
 * Renders top-bar controls for editor surface pane visibility.
 *
 * @param props - Visibility control state and actions.
 * @param props.graphOpen - Whether the flow graph pane is visible.
 * @param props.onGraphOpenChange - Receives flow graph visibility changes.
 * @param props.onLivePreviewOpenChange - Receives live-preview visibility changes.
 * @param props.onRightPanelOpenChange - Receives editor sidebar visibility changes.
 * @param props.livePreviewOpen - Whether the live-preview pane is visible.
 * @param props.rightPanelOpen - Whether the editor sidebar is visible.
 * @returns Grouped editor surface visibility buttons.
 *
 * @example
 * <TaleEditorPaneVisibilityControls livePreviewOpen graphOpen rightPanelOpen />
 */
export function TaleEditorPaneVisibilityControls({
	graphOpen,
	onGraphOpenChange,
	onLivePreviewOpenChange,
	onRightPanelOpenChange,
	livePreviewOpen,
	rightPanelOpen,
}: {
	graphOpen: boolean;
	onGraphOpenChange: (open: boolean) => void;
	onLivePreviewOpenChange: (open: boolean) => void;
	onRightPanelOpenChange: (open: boolean) => void;
	livePreviewOpen: boolean;
	rightPanelOpen: boolean;
}): React.JSX.Element {
	const visiblePaneCount = [livePreviewOpen, graphOpen, rightPanelOpen].filter(
		Boolean,
	).length;
	const previewRequired = livePreviewOpen && visiblePaneCount === 1;
	const graphRequired = graphOpen && visiblePaneCount === 1;
	const rightPanelRequired = rightPanelOpen && visiblePaneCount === 1;

	return (
		<div
			data-reader-component="TaleEditorPaneVisibilityControls"
			data-reader-role="editor-pane-visibility"
			className="flex min-w-0 overflow-hidden rounded border border-foreground/12 bg-background/90"
		>
			<VisibilityButton
				active={livePreviewOpen}
				disabled={previewRequired}
				label="Live preview"
				onClick={() => onLivePreviewOpenChange(!livePreviewOpen)}
			>
				<SquareMousePointer size={14} />
			</VisibilityButton>
			<VisibilityButton
				active={graphOpen}
				disabled={graphRequired}
				label="Flow graph"
				onClick={() => onGraphOpenChange(!graphOpen)}
			>
				<GitBranch size={14} />
			</VisibilityButton>
			<VisibilityButton
				active={rightPanelOpen}
				disabled={rightPanelRequired}
				label="Editor sidebar"
				onClick={() => onRightPanelOpenChange(!rightPanelOpen)}
			>
				{rightPanelOpen ? (
					<PanelRightClose size={14} />
				) : (
					<PanelRightOpen size={14} />
				)}
			</VisibilityButton>
		</div>
	);
}

/**
 * Renders one compact toggle button for editor pane visibility.
 *
 * @param props - Toggle button properties.
 * @param props.active - Whether the controlled pane is currently visible.
 * @param props.children - Button icon.
 * @param props.disabled - Whether the toggle is temporarily disabled.
 * @param props.label - Accessible button label.
 * @param props.onClick - Toggle callback.
 * @returns A toolbar toggle button.
 *
 * @example
 * <VisibilityButton active label="Preview" onClick={toggle} />
 */
function VisibilityButton({
	active,
	children,
	disabled = false,
	label,
	onClick,
}: {
	active: boolean;
	children: ReactNode;
	disabled?: boolean;
	label: string;
	onClick: () => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			aria-pressed={active}
			disabled={disabled}
			aria-label={label}
			title={label}
			className={`grid h-9 w-10 place-items-center border-foreground/10 border-r text-xs transition last:border-r-0 disabled:cursor-not-allowed disabled:opacity-45 ${
				active
					? "bg-primary/16 text-primary"
					: "text-foreground/62 hover:bg-foreground/8 hover:text-foreground"
			}`}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
