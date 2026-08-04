"use client";

import { useCallback } from "react";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";
import { useAutoSelectActiveBlock } from "./useAutoSelectActiveBlock";

/**
 * Keeps the editor selection synced to the active preview block when enabled.
 *
 * @returns Null runtime synchronizer.
 *
 * @example
 * <EditorActiveBlockAutoSelector />
 */
export function EditorActiveBlockAutoSelector(): null {
	const previewOpen = useTaleAppStore((state) => state.runtime.previewOpen);
	const { autoSelectActiveBlock, selectBlockForEditing, setRightPanelOpen } =
		useTaleEditorStoreShallow((state) => ({
			autoSelectActiveBlock: state.editorWorkspace.autoSelectActiveBlock,
			selectBlockForEditing: state.editor.selectBlockForEditing,
			setRightPanelOpen: state.editorWorkspace.setRightPanelOpen,
		}));
	const activeBlockId = useTaleReaderStore(
		(state) => state.navigation.current?.blockId ?? null,
	);

	const selectActivePreviewBlock = useCallback(
		(blockId: string): void => {
			selectBlockForEditing(blockId);
			setRightPanelOpen(true);
		},
		[selectBlockForEditing, setRightPanelOpen],
	);

	useAutoSelectActiveBlock({
		activeBlockId,
		enabled: autoSelectActiveBlock && previewOpen,
		onSelectBlock: selectActivePreviewBlock,
	});

	return null;
}
