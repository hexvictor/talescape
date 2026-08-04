"use client";

import { Network } from "lucide-react";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";

/**
 * Renders an editor-only node inspector control inside a layout node.
 *
 * @param props - Node overlay props.
 * @param props.blockId - Block that owns the node.
 * @param props.nodeId - Node represented by the overlay.
 * @returns Node inspection button when preview inspector mode is enabled.
 *
 * @example
 * <EditorNodeOverlay blockId="block-1" nodeId="node-1" />
 */
export function EditorNodeOverlay({
	blockId,
	nodeId,
}: {
	blockId: string;
	nodeId: string;
}): React.JSX.Element | null {
	const { inspectorControlsOpen, openInspector } = useTaleEditorStoreShallow(
		(state) => ({
			inspectorControlsOpen: state.editor.inspectorControlsOpen,
			openInspector: state.editor.openInspector,
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
