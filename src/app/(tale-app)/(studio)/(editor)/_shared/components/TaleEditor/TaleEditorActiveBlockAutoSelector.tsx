"use client";

import { useCallback } from "react";
import { useTaleStudioStoreShallow } from "~/app/(tale-app)/(studio)/_shared/hooks/useTaleStudioStore";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { useAutoSelectActiveBlock } from "../../hooks/useAutoSelectActiveBlock";

/**
 * Keeps the editor selection synced to the active preview block when enabled.
 *
 * @returns Null runtime synchronizer.
 *
 * @example
 * <TaleEditorActiveBlockAutoSelector />
 */

export function TaleEditorActiveBlockAutoSelector(): null {
	const {
		autoSelectActiveBlock,
		livePreviewOpen,
		selectBlockForEditing,
		setRightPanelOpen,
	} = useTaleStudioStoreShallow((state) => ({
		autoSelectActiveBlock: state.editorLayout.autoSelectActiveBlock,
		livePreviewOpen: state.editorLayout.livePreviewOpen,
		selectBlockForEditing: state.studioSelection.selectBlockForEditing,
		setRightPanelOpen: state.editorLayout.setRightPanelOpen,
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
		enabled: autoSelectActiveBlock && livePreviewOpen,
		onSelectBlock: selectActivePreviewBlock,
	});

	return null;
}
