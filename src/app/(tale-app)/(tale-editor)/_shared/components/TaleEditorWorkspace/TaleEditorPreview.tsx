"use client";

import { ReaderViewport } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderViewport/ReaderViewport";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";
import { EditorPaneResizeHandle } from "./EditorPaneResizeHandle";

const minimumPreviewWidthVw = 28;
const maximumPreviewWidthVw = 70;

/**
 * Renders and resizes the live reader preview inside the editing surface.
 *
 * The preview owns its DOM sizing interaction while its persisted visibility and
 * width remain canonical editor pane-layout state.
 *
 * @returns Live reader preview and pane separator, or null when hidden.
 *
 * @example
 * <TaleEditorPreview />
 */
export function TaleEditorPreview(): React.JSX.Element | null {
	const isPreviewing = useTaleAppStore((state) => state.derived.isPreviewing);
	const { previewWidth, setPreviewWidth } = useTaleEditorStoreShallow(
		(state) => ({
			previewWidth: state.editorWorkspace.previewWidth,
			setPreviewWidth: state.editorWorkspace.setPreviewWidth,
		}),
	);

	if (!isPreviewing) return null;

	return (
		<>
			<div
				data-reader-component="TaleEditorPreview"
				data-reader-role="live-preview-pane"
				className="relative min-w-[22rem] max-w-[70vw] border-foreground/10 border-r"
				style={{ width: `${previewWidth}vw` }}
			>
				<ReaderViewport />
			</div>
			<EditorPaneResizeHandle
				label="Resize preview"
				onDrag={(clientX) => {
					const width = (clientX / window.innerWidth) * 100;
					setPreviewWidth(
						Math.max(
							minimumPreviewWidthVw,
							Math.min(maximumPreviewWidthVw, width),
						),
					);
				}}
			/>
		</>
	);
}
