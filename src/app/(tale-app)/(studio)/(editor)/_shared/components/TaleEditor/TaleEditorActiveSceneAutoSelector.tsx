"use client";

import { useCallback, useEffect } from "react";
import { useTaleStudioStoreShallow } from "~/app/(tale-app)/(studio)/_shared/hooks/useTaleStudioStore";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { useAutoSelectActiveScene } from "../../hooks/useAutoSelectActiveScene";

/**
 * Keeps the editor selection synced to the active preview block when enabled.
 *
 * @returns Null runtime synchronizer.
 *
 * @example
 * <TaleEditorActiveSceneAutoSelector />
 */

export function TaleEditorActiveSceneAutoSelector(): null {
	const {
		autoSelectTarget,
		livePreviewOpen,
		openInspector,
		selectSceneForEditing,
		setRightPanelOpen,
	} = useTaleStudioStoreShallow((state) => ({
		autoSelectTarget: state.editorLayout.autoSelectTarget,
		livePreviewOpen: state.editorLayout.livePreviewOpen,
		openInspector: state.studioSelection.openInspector,
		selectSceneForEditing: state.studioSelection.selectSceneForEditing,
		setRightPanelOpen: state.editorLayout.setRightPanelOpen,
	}));
	const activeSceneId = useTaleReaderStore(
		(state) => state.navigation.current?.sceneId ?? null,
	);
	const activeKeyframeId = useTaleReaderStore(
		(state) => state.navigation.current?.keyframeId ?? null,
	);
	const activeFrameId = useTaleAppStore((state) =>
		activeKeyframeId
			? (state.document.tale.indexMap.keyframesById[activeKeyframeId]?.frameId ?? null)
			: null,
	);

	const selectActivePreviewBlock = useCallback(
		(sceneId: string): void => {
			selectSceneForEditing(sceneId);
			setRightPanelOpen(true);
		},
		[selectSceneForEditing, setRightPanelOpen],
	);

	useAutoSelectActiveScene({
		activeSceneId,
		enabled: autoSelectTarget === "scene" && livePreviewOpen,
		onSelectBlock: selectActivePreviewBlock,
	});

	useEffect(() => {
		if (
			autoSelectTarget !== "frame" ||
			!livePreviewOpen ||
			!activeSceneId ||
			!activeFrameId
		)
			return;
		const timeout = window.setTimeout(() => {
			openInspector({ id: activeFrameId, sceneId: activeSceneId, type: "frame" });
			setRightPanelOpen(true);
		}, 260);
		return () => window.clearTimeout(timeout);
	}, [
		activeFrameId,
		activeSceneId,
		autoSelectTarget,
		livePreviewOpen,
		openInspector,
		setRightPanelOpen,
	]);

	return null;
}
