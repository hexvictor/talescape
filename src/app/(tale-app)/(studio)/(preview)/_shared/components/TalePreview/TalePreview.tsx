"use client";

import type { CSSProperties } from "react";
import { TaleStudioToolbar } from "~/app/(tale-app)/(studio)/_shared/components/TaleStudioToolbar/TaleStudioToolbar";
import { TaleReaderProgressPersistence } from "~/app/(tale-app)/_shared/components/ReaderShell/TaleReaderProgressPersistence";
import { TaleReaderViewport } from "~/app/(tale-app)/_shared/components/TaleViewport/TaleVIewport";
import { TalePreviewInspectorOverlay } from "./TalePreviewInspectorOverlay";

/**
 * Renders the full Tale Studio preview workspace.
 *
 * @returns Reader viewport with Tale Studio inspection controls.
 *
 * @example
 * <TalePreview />
 */
export function TalePreview(): React.JSX.Element {
	return (
		<div
			data-reader-component="TalePreview"
			data-reader-role="preview-workspace"
			className="relative"
			style={{ "--reader-mobile-toolbar-offset": "4rem" } as CSSProperties}
		>
			<TaleStudioToolbar />
			<TaleReaderProgressPersistence />
			<TaleReaderViewport additionalOverlay={<TalePreviewInspectorOverlay />} />
		</div>
	);
}
