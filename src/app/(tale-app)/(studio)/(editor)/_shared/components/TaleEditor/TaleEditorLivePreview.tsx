"use client";

import {
	useTaleStudioStore,
	useTaleStudioStoreShallow,
} from "~/app/(tale-app)/(studio)/_shared/hooks/useTaleStudioStore";
import { TaleReaderViewport } from "~/app/(tale-app)/_shared/components/TaleViewport/TaleVIewport";
import { useTaleRootStore } from "~/app/_shared/contexts/TaleRootStoreContext";
import cn from "~/lib/utils/cn";
import { TaleEditorPaneResizeHandle } from "./TaleEditorPaneResizeHandle";

const minimumLivePreviewWidthVw = 28;
const maximumLivePreviewWidthVw = 70;

/**
 * Renders and resizes the live reader preview inside the editing surface.
 *
 * The pane owns its DOM sizing interaction while visibility and width remain
 * canonical editor-layout state in the Tale Studio store.
 *
 * @returns Live reader preview and pane separator, or null when hidden.
 *
 * @example
 * <TaleEditorLivePreview />
 */
export function TaleEditorLivePreview(): React.JSX.Element | null {
	const isMobile = useTaleRootStore((state) => state.derived.isMobile);
	const graphOpen = useTaleStudioStore((state) => state.editorLayout.graphOpen);
	const { livePreviewOpen, livePreviewWidth, setLivePreviewWidth } =
		useTaleStudioStoreShallow((state) => ({
			livePreviewOpen: state.editorLayout.livePreviewOpen,
			livePreviewWidth: state.editorLayout.livePreviewWidth,
			setLivePreviewWidth: state.editorLayout.setLivePreviewWidth,
		}));

	if (!livePreviewOpen) return null;

	return (
		<>
			<div
				data-reader-component="TaleEditorLivePreview"
				data-reader-role="live-preview-pane"
				className={cn(
					"relative h-[45dvh] w-full border-foreground/10 border-b md:h-auto md:border-r md:border-b-0",
					graphOpen
						? "md:min-w-[22rem] md:max-w-[70vw]"
						: "min-w-0 max-w-none flex-1",
				)}
				style={
					graphOpen && !isMobile
						? { width: `${livePreviewWidth}vw` }
						: undefined
				}
			>
				<TaleReaderViewport />
			</div>
			{graphOpen && !isMobile ? (
				<TaleEditorPaneResizeHandle
					label="Resize live preview"
					onDrag={(clientX) => {
						const width = (clientX / window.innerWidth) * 100;
						setLivePreviewWidth(
							Math.max(
								minimumLivePreviewWidthVw,
								Math.min(maximumLivePreviewWidthVw, width),
							),
						);
					}}
				/>
			) : null}
		</>
	);
}
