"use client";

import { Network } from "lucide-react";
import { useTaleStudioStoreShallow } from "../../hooks/useTaleStudioStore";

/**
 * Renders a Tale Studio node inspector control inside a layout node.
 *
 * @param props - Node overlay props.
 * @param props.blockId - Block that owns the node.
 * @param props.nodeId - Node represented by the overlay.
 * @returns Node inspection button when preview inspector mode is enabled.
 *
 * @example
 * <StudioNodeOverlay blockId="block-1" nodeId="node-1" />
 */
export function StudioNodeOverlay({
	blockId,
	nodeId,
}: {
	blockId: string;
	nodeId: string;
}): React.JSX.Element | null {
	const { inspectorControlsOpen, openInspector } = useTaleStudioStoreShallow(
		(state) => ({
			inspectorControlsOpen: state.studioSelection.inspectorControlsOpen,
			openInspector: state.studioSelection.openInspector,
		}),
	);

	if (!inspectorControlsOpen) return null;

	return (
		<button
			type="button"
			aria-label={`Inspect node ${nodeId}`}
			className="absolute top-2 left-2 z-[27] grid h-7 w-7 place-items-center rounded border border-sky-300/45 bg-background/74 text-sky-200 opacity-0 shadow-lg backdrop-blur transition hover:bg-sky-300/14 group-hover/node:opacity-100"
			onClick={(event) => {
				event.stopPropagation();
				openInspector({ blockId, id: nodeId, type: "node" });
			}}
		>
			<Network size={13} />
		</button>
	);
}
