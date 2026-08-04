"use client";

import { ScanSearch, Settings2 } from "lucide-react";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";

/**
 * Renders editor inspection actions in the shared reader debug header.
 *
 * @param props - Debug action properties.
 * @param props.blockId - Active reader block identifier, when available.
 * @returns Controls for inspecting the active block and toggling inspectors.
 *
 * @example
 * <EditorDebugHeaderActions blockId={blockId} />
 */
export function EditorDebugHeaderActions({
	blockId,
}: {
	blockId: string | null;
}): React.JSX.Element {
	const { inspectorControlsOpen, openInspector, toggleInspectorControls } =
		useTaleEditorStoreShallow((state) => ({
			inspectorControlsOpen: state.editor.inspectorControlsOpen,
			openInspector: state.editor.openInspector,
			toggleInspectorControls: state.editor.toggleInspectorControls,
		}));

	return (
		<>
			<button
				type="button"
				aria-label="Inspect current block"
				disabled={!blockId}
				className="grid h-9 w-9 place-items-center rounded border border-foreground/10 text-foreground/55 hover:text-foreground disabled:opacity-25"
				onClick={() => {
					if (blockId) openInspector({ id: blockId, type: "block" });
				}}
			>
				<ScanSearch size={16} />
			</button>
			<button
				type="button"
				aria-label={
					inspectorControlsOpen
						? "Hide inspector buttons"
						: "Show inspector buttons"
				}
				className="grid h-9 w-9 place-items-center rounded border border-foreground/10 text-foreground/55 hover:text-foreground"
				onClick={toggleInspectorControls}
			>
				<Settings2
					className={inspectorControlsOpen ? "text-primary" : undefined}
					size={16}
				/>
			</button>
		</>
	);
}
