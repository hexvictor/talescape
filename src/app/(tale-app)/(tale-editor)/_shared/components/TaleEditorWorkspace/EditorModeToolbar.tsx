"use client";

import { Save } from "lucide-react";
import { createTaleEditorDraftPayload } from "~/app/(tale-app)/(tale-editor)/_shared/services/createTaleEditorDraftPayload";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import AutoHideTopBar from "~/components/layout/AutoHideTopBar/AutoHideTopBar";
import ThemeToggle from "~/components/ui/ThemeToggle";
import { api } from "~/trpc/react";
import { EditorActivitySwitcher } from "./EditorActivitySwitcher";

/**
 * Renders editor mode controls and persists the active tale document.
 *
 * @returns Editor mode toolbar.
 *
 * @example
 * <EditorModeToolbar />
 */
export function EditorModeToolbar(): React.JSX.Element {
	const { dirty, markSaved, tale } = useTaleAppStoreShallow((state) => ({
		dirty: state.document.dirty,
		markSaved: state.document.markSaved,
		tale: state.document.tale,
	}));
	const activity = useTaleAppStore((state) => state.runtime.activity);
	const saveDraft = api.taleReader.editor.saveDraft.useMutation();
	const status = saveDraft.isPending
		? "Saving"
		: saveDraft.isError
			? "Save failed"
			: dirty
				? "Unsaved"
				: "Saved";

	const save = (): void => {
		saveDraft.mutate(createTaleEditorDraftPayload(tale), {
			onSuccess: markSaved,
		});
	};

	return (
		<AutoHideTopBar
			revealZoneHeight={"2rem"}
			forceVisible={activity === "editing"}
		>
			<header
				data-reader-component="EditorModeToolbar"
				data-reader-role="editor-toolbar"
				className="relative z-60 flex h-14 items-center justify-between border-foreground/10 border-b bg-background/95 px-4 text-foreground backdrop-blur-md"
			>
				<EditorActivitySwitcher />
				<div className="flex items-center gap-3">
					<ThemeToggle />
					<span className="text-foreground/42 text-xs">{status}</span>
					<button
						type="button"
						disabled={saveDraft.isPending}
						className="flex h-9 items-center gap-2 rounded border border-primary/45 bg-primary/14 px-3 font-semibold text-primary text-xs disabled:opacity-45"
						onClick={save}
					>
						<Save size={14} />
						Save
					</button>
				</div>
			</header>
		</AutoHideTopBar>
	);
}
