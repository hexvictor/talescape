"use client";

import { X } from "lucide-react";
import { useReaderEditorOverlayState } from "../../hooks/store/useReaderEditorSelectors";
import { ReaderInspectorPanelRouter } from "./Inspector/ReaderInspectorPanelRouter";

/**
 * Renders authoring controls separately from the read-only reader UI.
 *
 * @returns Editor inspector controls when the reader is in edit mode.
 *
 * @example
 * <ReaderEditorOverlay />
 */
export function ReaderEditorOverlay(): React.JSX.Element | null {
	const { closeInspector, inspector, mode } = useReaderEditorOverlayState();

	if (mode !== "edit") return null;

	return (
		<>
			{inspector ? (
				<aside
					data-reader-ui="true"
					data-reader-component="ReaderEditorOverlay"
					data-reader-role="editor-inspector"
					className="pointer-events-auto absolute top-4 bottom-4 left-4 z-70 flex w-[min(38rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-white/12 bg-black/88 shadow-2xl backdrop-blur-md"
				>
					<header className="flex items-center justify-between border-white/10 border-b px-4 py-3">
						<p className="font-black text-[#d9b56f] text-xs uppercase tracking-[0.2em]">
							Tale Editor
						</p>
						<button
							type="button"
							aria-label="Close inspector"
							className="grid h-9 w-9 place-items-center rounded border border-white/10 text-white/55 hover:text-white"
							onClick={closeInspector}
						>
							<X size={16} />
						</button>
					</header>
					<div className="min-h-0 flex-1 overflow-y-auto p-3">
						<ReaderInspectorPanelRouter target={inspector} />
					</div>
				</aside>
			) : null}
		</>
	);
}
