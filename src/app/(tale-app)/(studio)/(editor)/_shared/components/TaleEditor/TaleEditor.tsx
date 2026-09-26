"use client";

import { useRef } from "react";
import { TaleStudioToolbar } from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleStudioToolbar";
import { useTaleStudioStoreShallow } from "~/app/(tale-app)/(studio)/_shared/hooks/useTaleStudioStore";
import { TaleEditorBranchGraph } from "../TaleEditorBranchGraph/TaleEditorBranchGraph";
import { TaleEditorActiveSceneAutoSelector } from "./TaleEditorActiveSceneAutoSelector";
import { TaleEditorLeftRail } from "./TaleEditorLeftRail";
import { TaleEditorLivePreview } from "./TaleEditorLivePreview";
import { TaleEditorSelectionSidebar } from "./TaleEditorSelectionSidebar";

/**
 * Renders the Tale Studio editor workspace.
 *
 * @returns Graph editing controls and an optional live reader preview.
 *
 * @example
 * <TaleEditor />
 */
export function TaleEditor(): React.JSX.Element {
	const editorBodyRef = useRef<HTMLDivElement>(null);
	const { graphOpen, livePreviewOpen, rightPanelOpen } =
		useTaleStudioStoreShallow((state) => ({
			graphOpen: state.editorLayout.graphOpen,
			livePreviewOpen: state.editorLayout.livePreviewOpen,
			rightPanelOpen: state.editorLayout.rightPanelOpen,
		}));
	const effectiveGraphOpen = graphOpen || (!livePreviewOpen && !rightPanelOpen);

	return (
		<div
			data-reader-component="TaleEditor"
			data-reader-role="editor-workspace"
			className="fixed inset-0 z-50 flex flex-col bg-background text-foreground"
		>
			<TaleEditorActiveSceneAutoSelector />
			<TaleStudioToolbar />
			<div
				ref={editorBodyRef}
				className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden"
			>
				<TaleEditorLeftRail />
				<TaleEditorLivePreview />
				{effectiveGraphOpen ? (
					<main className="relative flex min-h-[45dvh] min-w-0 flex-1 flex-col md:min-h-0 md:flex-row">
						<TaleEditorBranchGraph />
						<TaleEditorSelectionSidebar editorBodyRef={editorBodyRef} />
					</main>
				) : rightPanelOpen ? (
					<TaleEditorSelectionSidebar editorBodyRef={editorBodyRef} />
				) : null}
			</div>
		</div>
	);
}
