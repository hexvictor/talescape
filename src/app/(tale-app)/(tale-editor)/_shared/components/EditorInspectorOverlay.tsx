"use client";

import { X } from "lucide-react";
import { useTaleEditorOverlayState } from "~/app/(tale-app)/(tale-editor)/_shared/hooks/useTaleEditorStore";
import { TaleInspectorPanel } from "./Inspector/TaleInspectorPanel";

/**
 * Renders authoring controls separately from the read-only reader UI.
 *
 * @returns Editor inspector controls when the reader is in edit mode.
 *
 * @example
 * <EditorInspectorOverlay />
 */
export function EditorInspectorOverlay(): React.JSX.Element | null {
	const {
		closeInspector,
		closeSecondaryInspector,
		inspector,
		secondaryInspector,
	} = useTaleEditorOverlayState();

	return (
		<>
			{inspector ? (
				<aside
					data-reader-ui="true"
					data-reader-component="EditorInspectorOverlay"
					data-reader-role="editor-inspector"
					className="pointer-events-auto absolute top-4 bottom-4 left-4 z-70 flex w-[min(38rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-foreground/12 bg-background/88 shadow-2xl backdrop-blur-md"
				>
					<header className="flex items-center justify-between border-foreground/10 border-b px-4 py-3">
						<p className="font-black text-primary text-xs uppercase tracking-[0.2em]">
							Tale Editor
						</p>
						<button
							type="button"
							aria-label="Close inspector"
							className="grid h-9 w-9 place-items-center rounded border border-foreground/10 text-foreground/55 hover:text-foreground"
							onClick={closeInspector}
						>
							<X size={16} />
						</button>
					</header>
					<div className="min-h-0 flex-1 overflow-y-auto p-3">
						<TaleInspectorPanel target={inspector} />
					</div>
				</aside>
			) : null}
			{inspector && secondaryInspector ? (
				<aside
					data-reader-ui="true"
					data-reader-component="EditorInspectorOverlay"
					data-reader-role="secondary-fragment-inspector"
					className="pointer-events-auto absolute top-8 bottom-8 left-[min(40rem,calc(100vw-1rem))] z-70 flex w-[min(30rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-foreground/12 bg-background/92 shadow-2xl backdrop-blur-md"
				>
					<header className="flex items-center justify-between border-foreground/10 border-b px-4 py-3">
						<p className="font-black text-primary text-xs uppercase">
							Fragment
						</p>
						<button
							type="button"
							aria-label="Close fragment inspector"
							className="grid h-9 w-9 place-items-center rounded border border-foreground/10 text-foreground/55 hover:text-foreground"
							onClick={closeSecondaryInspector}
						>
							<X size={16} />
						</button>
					</header>
					<div className="min-h-0 flex-1 overflow-y-auto p-3">
						<TaleInspectorPanel target={secondaryInspector} />
					</div>
				</aside>
			) : null}
		</>
	);
}
