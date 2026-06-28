"use client";

import clsx from "clsx";
import { ReaderViewport } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderViewport/ReaderViewport";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import {
	useTaleEditorStore,
	useTaleEditorStoreShallow,
} from "../../hooks/useTaleEditorStore";
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
	const graphOpen = useTaleEditorStore(
		(state) => state.editorWorkspace.graphOpen,
	);
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
				className={clsx(
					"relative border-foreground/10 border-r",
					graphOpen
						? "min-w-[22rem] max-w-[70vw]"
						: "min-w-0 max-w-none flex-1",
				)}
				style={graphOpen ? { width: `${previewWidth}vw` } : undefined}
			>
				<ReaderViewport />
			</div>
			{graphOpen ? (
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
			) : null}
		</>
	);
}
