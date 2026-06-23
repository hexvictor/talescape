"use client";

import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { TaleEditorEditingSurface } from "./TaleEditorEditingSurface";
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

	if (activity === "reading") {
		return <TaleEditorReadingSurface />;
	}

	return <TaleEditorEditingSurface />;
}
