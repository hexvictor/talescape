"use client";

import { ReaderProgressPersistence } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderProgressPersistence";
import { ReaderViewport } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderViewport/ReaderViewport";
import { EditorInspectorOverlay } from "../EditorInspectorOverlay";
import { EditorModeToolbar } from "./EditorModeToolbar";

/**
 * Renders the full reader surface while the editor activity is reading.
 *
 * @returns Reader viewport with editor inspection controls.
 *
 * @example
 * <TaleEditorReadingSurface />
 */
export function TaleEditorReadingSurface(): React.JSX.Element {
	return (
		<div
			data-reader-component="TaleEditorReadingSurface"
			data-reader-role="reading-mode"
			className="relative"
		>
			<EditorModeToolbar />
			<ReaderProgressPersistence />
			<ReaderViewport additionalOverlay={<EditorInspectorOverlay />} />
		</div>
	);
}
