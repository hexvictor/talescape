"use client";

import { X } from "lucide-react";
import { TaleInspectorPanel } from "~/app/(tale-app)/(studio)/_shared/components/Inspector/TaleInspectorPanel";
import { useTaleStudioOverlayState } from "~/app/(tale-app)/(studio)/_shared/hooks/useTaleStudioStore";

/**
 * Renders Tale Studio inspection controls over the preview workspace.
 *
 * @returns Preview inspector controls when a target is selected.
 *
 * @example
 * <TalePreviewInspectorOverlay />
 */
export function TalePreviewInspectorOverlay(): React.JSX.Element | null {
	const {
		closeInspector,
		closeSecondaryInspector,
		inspector,
		secondaryInspector,
	} = useTaleStudioOverlayState();

	return (
		<>
			{inspector ? (
				<aside
					data-reader-ui="true"
					data-reader-component="TalePreviewInspectorOverlay"
					data-reader-role="preview-inspector"
					className="pointer-events-auto absolute top-4 bottom-4 left-4 z-70 flex w-[min(38rem,calc(100vw-2rem))] flex-col overflow-hidden border-[3px] border-foreground bg-card shadow-[7px_7px_0_var(--comic-teal)]"
				>
					<header className="flex items-center justify-between border-foreground/10 border-b px-4 py-3">
						<p className="font-black text-primary text-xs uppercase tracking-[0.2em]">
							Tale Studio
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
					data-reader-component="TalePreviewInspectorOverlay"
					data-reader-role="secondary-fragment-inspector"
					className="pointer-events-auto absolute top-8 bottom-8 left-[min(40rem,calc(100vw-1rem))] z-70 flex w-[min(30rem,calc(100vw-2rem))] flex-col overflow-hidden border-[3px] border-foreground bg-card shadow-[7px_7px_0_var(--comic-blue)]"
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
