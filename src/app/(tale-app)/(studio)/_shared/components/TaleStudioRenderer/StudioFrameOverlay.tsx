"use client";

import { Frame } from "lucide-react";
import { useTaleStudioStoreShallow } from "../../hooks/useTaleStudioStore";

/**
 * Renders a Tale Studio node inspector control inside a layout node.
 *
 * @param props - Node overlay props.
 * @param props.sceneId - Scene that owns the node.
 * @param props.frameId - Node represented by the overlay.
 * @returns Node inspection button when preview inspector mode is enabled.
 *
 * @example
 * <StudioFrameOverlay sceneId="block-1" frameId="node-1" />
 */
export function StudioFrameOverlay({
	sceneId,
	frameId,
}: {
	sceneId: string;
	frameId: string;
}): React.JSX.Element | null {
	const { inspectorControlsOpen, openInspector } = useTaleStudioStoreShallow(
		(state) => ({
			inspectorControlsOpen: state.studioSelection.inspectorControlsOpen,
			openInspector: state.studioSelection.openInspector,
		}),
	);

	if (!inspectorControlsOpen) return null;

	return (
		<>
			<span
				aria-hidden="true"
				data-studio-frame-highlight=""
				className="pointer-events-none absolute inset-0 z-[26] border-2 border-cyan-300 opacity-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.55)] transition-opacity"
			/>
			<button
				type="button"
				aria-label={`Inspect Frame ${frameId}`}
				className="absolute top-2 left-2 z-[27] grid h-8 w-8 place-items-center border-2 border-cyan-300 bg-background text-cyan-500 opacity-0 shadow-[3px_3px_0_hsl(var(--foreground))] transition hover:bg-cyan-300 hover:text-black"
				onClick={(event) => {
					event.stopPropagation();
					openInspector({ sceneId, id: frameId, type: "frame" });
				}}
			>
				<Frame size={14} />
			</button>
		</>
	);
}
