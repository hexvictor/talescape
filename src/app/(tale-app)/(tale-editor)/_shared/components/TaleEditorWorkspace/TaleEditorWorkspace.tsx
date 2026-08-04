"use client";

import { useCallback, useState } from "react";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleEditorStore } from "../../hooks/useTaleEditorStore";
import { TaleEditorEditingSurface } from "./TaleEditorEditingSurface";
import { TaleEditorLoadingOverlay } from "./TaleEditorLoadingOverlay";
import { TaleEditorReadingSurface } from "./TaleEditorReadingSurface";

/**
 * Selects the editor surface associated with the current tale activity.
 *
 * @returns The reading or editing surface.
 *
 * @example
 * <TaleEditorWorkspace />
 */
export function TaleEditorWorkspace(): React.JSX.Element {
	const activity = useTaleAppStore((state) => state.runtime.activity);
	const graphOpen = useTaleEditorStore(
		(state) => state.editorWorkspace.graphOpen,
	);
	const [initialLoadComplete, setInitialLoadComplete] = useState(false);
	const completeInitialLoad = useCallback(() => {
		setInitialLoadComplete(true);
	}, []);

	return (
		<>
			{activity === "reading" ? (
				<TaleEditorReadingSurface />
			) : (
				<TaleEditorEditingSurface />
			)}
			{initialLoadComplete ? null : (
				<TaleEditorLoadingOverlay
					graphOpen={graphOpen}
					onReady={completeInitialLoad}
				/>
			)}
		</>
	);
}
