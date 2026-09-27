"use client";

import { TaleEditor } from "~/app/(tale-app)/(studio)/(editor)/_shared/components/TaleEditor/TaleEditor";
import { TalePreview } from "~/app/(tale-app)/(studio)/(preview)/_shared/components/TalePreview/TalePreview";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { TaleStudioLoadingOverlay } from "./TaleStudioLoadingOverlay";

/**
 * Selects the Tale Studio surface associated with the URL-backed workspace.
 *
 * @returns The editor or preview surface.
 *
 * @example
 * <TaleStudioWorkspace />
 */
export function TaleStudioWorkspace(): React.JSX.Element {
	const workspace = useTaleAppStore((state) => state.runtime.workspace);

	return (
		<div
			data-tale-studio-ui="true"
			data-reader-component="TaleStudioWorkspace"
			data-reader-role="studio-switch-workspace"
			data-studio-component="TaleStudioWorkspace"
			data-studio-role="studio-workspace"
		>
			{workspace === "editor" ? <TaleEditor /> : <TalePreview />}
			<TaleStudioLoadingOverlay />
		</div>
	);
}
