"use client";

import { TaleEditorToolbar } from "~/app/(tale-app)/(studio)/(editor)/_shared/components/TaleEditorToolbar/TaleEditorToolbar";
import { TalePreviewToolbar } from "~/app/(tale-app)/(studio)/(preview)/_shared/components/TalePreviewToolbar/TalePreviewToolbar";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleStudio } from "../../contexts/TaleStudioProvider";
import { TaleStudioSavingBackdrop } from "./TaleStudioSavingBackdrop";
import { TaleStudioSettingsModal } from "./TaleStudioSettingsModal";

/**
 * Renders the toolbar for the active Tale Studio workspace.
 *
 * @returns Editor or preview workspace toolbar with shared Studio overlays.
 *
 * @example
 * <TaleStudioToolbar />
 */
export function TaleStudioToolbar(): React.JSX.Element {
	const workspace = useTaleAppStore((state) => state.runtime.workspace);
	const {
		toolbar: { savePending },
	} = useTaleStudio();

	return (
		<>
			{workspace === "editor" ? (
				<div
					data-reader-component="TaleStudioToolbar"
					data-reader-role="editor-header-stack"
					className="relative z-60 border-foreground border-b-[3px] bg-card text-foreground shadow-[0_4px_0_var(--comic-teal)]"
				>
					<TaleEditorToolbar />
				</div>
			) : (
				<TalePreviewToolbar />
			)}
			<TaleStudioSettingsModal />
			{savePending ? <TaleStudioSavingBackdrop /> : null}
		</>
	);
}
