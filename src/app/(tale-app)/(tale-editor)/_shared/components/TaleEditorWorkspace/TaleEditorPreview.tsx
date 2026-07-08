"use client";

import clsx from "clsx";
import { ReaderViewport } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderViewport/ReaderViewport";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { useAppStore } from "~/contexts/AppStoreContext";
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
	const isMobile = useAppStore((state) => state.derived.isMobile);
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
					"relative h-[45dvh] w-full border-foreground/10 border-b md:h-auto md:border-r md:border-b-0",
					graphOpen
						? "md:min-w-[22rem] md:max-w-[70vw]"
						: "min-w-0 max-w-none flex-1",
				)}
				style={
					graphOpen && !isMobile ? { width: `${previewWidth}vw` } : undefined
				}
			>
				<ReaderViewport />
			</div>
			{graphOpen && !isMobile ? (
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
