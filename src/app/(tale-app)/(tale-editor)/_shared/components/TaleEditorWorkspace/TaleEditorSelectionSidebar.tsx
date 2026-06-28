"use client";

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
	const { rightPanelOpen, setRightPanelWidth } = useTaleEditorStoreShallow(
		(state) => ({
			rightPanelOpen: state.editorWorkspace.rightPanelOpen,
			setRightPanelWidth: state.editorWorkspace.setRightPanelWidth,
		}),
	);

	return (
		<>
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
