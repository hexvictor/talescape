"use client";

import { useRef } from "react";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleEditorStore } from "../../hooks/useTaleEditorStore";
import { EditorModeToolbar } from "./EditorModeToolbar";
import { TaleBranchGraph } from "./TaleBranchGraph";
import { TaleEditorPreview } from "./TaleEditorPreview";
import { TaleEditorSelectionSidebar } from "./TaleEditorSelectionSidebar";

/**
 * Renders the editor's graph, preview, and inspector surface.
 *
 * @returns Graph editing controls and an optional live reader preview.
 *
 * @example
 * <TaleEditorEditingSurface />
 */
export function TaleEditorEditingSurface(): React.JSX.Element {
	const editorBodyRef = useRef<HTMLDivElement>(null);
	const graphOpen = useTaleEditorStore(
		(state) => state.editorWorkspace.graphOpen,
	);
	const previewOpen = useTaleAppStore((state) => state.runtime.previewOpen);
	const rightPanelOpen = useTaleEditorStore(
		(state) => state.editorWorkspace.rightPanelOpen,
	);
	const effectiveGraphOpen = graphOpen || (!previewOpen && !rightPanelOpen);

	return (
		<div
			data-reader-component="TaleEditorEditingSurface"
			data-reader-role="edit-mode"
			className="fixed inset-0 z-50 flex flex-col bg-background text-foreground"
		>
			<EditorModeToolbar />
			<div ref={editorBodyRef} className="mt-16 flex min-h-0 flex-1">
				<TaleEditorPreview />
				{effectiveGraphOpen ? (
					<main className="relative flex min-w-0 flex-1">
						<TaleBranchGraph />
						<TaleEditorSelectionSidebar editorBodyRef={editorBodyRef} />
					</main>
				) : rightPanelOpen ? (
					<TaleEditorSelectionSidebar editorBodyRef={editorBodyRef} />
				) : null}
			</div>
		</div>
	);
}
