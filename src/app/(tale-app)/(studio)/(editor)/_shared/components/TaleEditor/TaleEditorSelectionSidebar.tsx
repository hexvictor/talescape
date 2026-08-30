"use client";

import type { RefObject } from "react";
import { useTaleStudioStoreShallow } from "~/app/(tale-app)/(studio)/_shared/hooks/useTaleStudioStore";
import { useTaleRootStore } from "~/app/_shared/contexts/TaleRootStoreContext";
import { TaleEditorPaneResizeHandle } from "./TaleEditorPaneResizeHandle";
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
	const isMobile = useTaleRootStore((state) => state.derived.isMobile);
	const { rightPanelOpen, setRightPanelWidth } = useTaleStudioStoreShallow(
		(state) => ({
			rightPanelOpen: state.editorLayout.rightPanelOpen,
			setRightPanelWidth: state.editorLayout.setRightPanelWidth,
		}),
	);

	return (
		<>
			{rightPanelOpen ? (
				<>
					{!isMobile ? (
						<TaleEditorPaneResizeHandle
							label="Resize editor selection sidebar"
							onDrag={(clientX) => {
								const bounds = editorBodyRef.current?.getBoundingClientRect();

								if (!bounds) return;

								setRightPanelWidth(
									Math.max(280, Math.min(640, bounds.right - clientX)),
								);
							}}
						/>
					) : null}
					<TaleEditorSelectionPanel />
				</>
			) : null}
		</>
	);
}
