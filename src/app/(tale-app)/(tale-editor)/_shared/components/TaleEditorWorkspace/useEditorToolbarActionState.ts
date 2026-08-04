"use client";

import { useCallback, useMemo, useState } from "react";
import { createTaleEditorDraftPayload } from "~/app/(tale-app)/(tale-editor)/_shared/services/createTaleEditorDraftPayload";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { api } from "~/trpc/react";

/**
 * Owns save mutation state and exposes actions consumed by editor toolbars.
 *
 * @returns Toolbar action context value and settings modal state.
 *
 * @example
 * const toolbar = useEditorToolbarActionState();
 */
export function useEditorToolbarActionState(): {
	closeSettings: () => void;
	settingsOpen: boolean;
	savePending: boolean;
	toolbarActions: {
		dirtyStatus: string;
		openSettings: () => void;
		save: () => void;
		savePending: boolean;
	};
} {
	const { dirty, markSaved, tale } = useTaleAppStoreShallow((state) => ({
		dirty: state.document.dirty,
		markSaved: state.document.markSaved,
		tale: state.document.tale,
	}));
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [savedNoticeVisible, setSavedNoticeVisible] = useState(false);
	const saveDraft = api.taleReader.editor.saveDraft.useMutation();
	const dirtyStatus = getEditorDirtyStatus({
		dirty,
		saveFailed: saveDraft.isError,
		savePending: saveDraft.isPending,
		savedNoticeVisible,
	});

	const save = useCallback((): void => {
		saveDraft.mutate(createTaleEditorDraftPayload(tale), {
			onSuccess: () => {
				markSaved();
				setSavedNoticeVisible(true);
				window.setTimeout(() => setSavedNoticeVisible(false), 2400);
			},
		});
	}, [markSaved, saveDraft, tale]);

	const toolbarActions = useMemo(
		() => ({
			dirtyStatus,
			openSettings: () => setSettingsOpen(true),
			save,
			savePending: saveDraft.isPending,
		}),
		[dirtyStatus, save, saveDraft.isPending],
	);

	return {
		closeSettings: () => setSettingsOpen(false),
		settingsOpen,
		savePending: saveDraft.isPending,
		toolbarActions,
	};
}

/**
 * Resolves the compact save button label for the editor toolbar.
 *
 * @param state - Current save and dirty state.
 * @param state.dirty - Whether the tale document has unsaved changes.
 * @param state.saveFailed - Whether the latest save failed.
 * @param state.savePending - Whether a save mutation is in progress.
 * @param state.savedNoticeVisible - Whether the transient saved notice is visible.
 * @returns Save status label.
 *
 * @example
 * const label = getEditorDirtyStatus({ dirty, saveFailed, savePending, savedNoticeVisible });
 */
function getEditorDirtyStatus({
	dirty,
	saveFailed,
	savePending,
	savedNoticeVisible,
}: {
	dirty: boolean;
	saveFailed: boolean;
	savePending: boolean;
	savedNoticeVisible: boolean;
}): string {
	if (savePending) return "Saving";
	if (saveFailed) return "Save failed";
	if (dirty) return "Save";
	return savedNoticeVisible ? "Saved" : "Save";
}
