"use client";

import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { EditorActiveBlockAutoSelector } from "./EditorActiveBlockAutoSelector";
import { EditorEditingToolbar } from "./EditorEditingToolbar";
import { EditorReadingToolbar } from "./EditorReadingToolbar";
import { EditorSavingBackdrop } from "./EditorSavingBackdrop";
import { EditorSettingsModal } from "./EditorSettingsModal";
import { EditorToolbarActionsProvider } from "./EditorToolbarActionsContext";
import { useEditorToolbarActionState } from "./useEditorToolbarActionState";

/**
 * Renders editor mode controls and persists the active tale document.
 *
 * @returns Editor mode toolbar.
 *
 * @example
 * <EditorModeToolbar />
 */
export function EditorModeToolbar(): React.JSX.Element {
	const activity = useTaleAppStore((state) => state.runtime.activity);
	const { closeSettings, savePending, settingsOpen, toolbarActions } =
		useEditorToolbarActionState();

	return (
		<EditorToolbarActionsProvider value={toolbarActions}>
			<EditorActiveBlockAutoSelector />
			{activity === "editing" ? (
				<div
					data-reader-component="EditorModeToolbar"
					data-reader-role="editing-header-stack"
					className="relative z-60 border-foreground/10 border-b bg-background text-foreground shadow-sm"
				>
					<EditorEditingToolbar />
				</div>
			) : (
				<EditorReadingToolbar />
			)}
			<EditorSettingsModal open={settingsOpen} onClose={closeSettings} />
			{savePending ? <EditorSavingBackdrop /> : null}
		</EditorToolbarActionsProvider>
	);
}
