"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";
import type { RefObject } from "react";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";
import { EditorPaneResizeHandle } from "./EditorPaneResizeHandle";
import { TaleEditorSelectionPanel } from "./TaleEditorSelectionPanel";

type TaleEditorSelectionSidebarProps = {
	editorBodyRef: RefObject<HTMLDivElement | null>;
};

/**
 * Renders the resizable selection sidebar and its visibility control.
 *
 * @param props - Selection sidebar props.
 * @param props.editorBodyRef - Editor surface used to constrain sidebar width.
 * @returns Selection sidebar controls and panel content.
 *
 * @example
 * <TaleEditorSelectionSidebar editorBodyRef={editorBodyRef} />
 */
export function TaleEditorSelectionSidebar({
	editorBodyRef,
}: TaleEditorSelectionSidebarProps): React.JSX.Element {
	const { rightPanelOpen, setRightPanelOpen, setRightPanelWidth } =
		useTaleEditorStoreShallow((state) => ({
			rightPanelOpen: state.editorWorkspace.rightPanelOpen,
			setRightPanelOpen: state.editorWorkspace.setRightPanelOpen,
			setRightPanelWidth: state.editorWorkspace.setRightPanelWidth,
		}));

	return (
		<>
			<button
				data-reader-component="TaleEditorSelectionSidebar"
				data-reader-role="selection-sidebar-toggle"
				type="button"
				aria-expanded={rightPanelOpen}
				aria-label={
					rightPanelOpen
						? "Hide editor selection sidebar"
						: "Show editor selection sidebar"
				}
				className="absolute top-14 right-3 z-30 grid h-9 w-9 place-items-center rounded border border-foreground/12 bg-background/72 text-foreground/62 hover:bg-foreground/8 hover:text-foreground"
				title={
					rightPanelOpen
						? "Hide editor selection sidebar"
						: "Show editor selection sidebar"
				}
				onClick={() => setRightPanelOpen(!rightPanelOpen)}
			>
				{rightPanelOpen ? (
					<PanelRightClose size={15} />
				) : (
					<PanelRightOpen size={15} />
				)}
			</button>

			{rightPanelOpen ? (
				<>
					<EditorPaneResizeHandle
						label="Resize editor selection sidebar"
						onDrag={(clientX) => {
							const bounds = editorBodyRef.current?.getBoundingClientRect();

							if (!bounds) return;

							setRightPanelWidth(
								Math.max(280, Math.min(640, bounds.right - clientX)),
							);
						}}
					/>
					<TaleEditorSelectionPanel />
				</>
			) : null}
		</>
	);
}
