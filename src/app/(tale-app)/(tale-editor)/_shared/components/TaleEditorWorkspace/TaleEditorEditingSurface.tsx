"use client";

import clsx from "clsx";
import { useRef } from "react";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { EditorModeToolbar } from "./EditorModeToolbar";
import { TaleBranchGraph } from "./TaleBranchGraph";
import { TaleEditorPreview } from "./TaleEditorPreview";
import { TaleEditorPreviewToggle } from "./TaleEditorPreviewToggle";
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
	const activity = useTaleAppStore((state) => state.runtime.activity);

	return (
		<div
			data-reader-component="TaleEditorEditingSurface"
			data-reader-role="edit-mode"
			className="fixed inset-0 z-50 flex flex-col bg-background text-foreground"
		>
			<EditorModeToolbar />
			<div
				ref={editorBodyRef}
				className={clsx(
					activity === "editing" && "mt-14",
					"flex min-h-0 flex-1",
				)}
			>
				<TaleEditorPreview />
				<main className="relative flex min-w-0 flex-1">
					<TaleEditorPreviewToggle />

					<TaleBranchGraph />

					<TaleEditorSelectionSidebar editorBodyRef={editorBodyRef} />
				</main>
			</div>
		</div>
	);
}
