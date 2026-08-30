"use client";

import { ScanSearch, Settings2 } from "lucide-react";
import { useTaleStudioStoreShallow } from "../../hooks/useTaleStudioStore";

/**
 * Renders Studio inspection actions in the shared reader debug header.
 *
 * @param props - Debug action properties.
 * @param props.blockId - Active reader block identifier, when available.
 * @returns Controls for inspecting the active block and toggling inspectors.
 *
 * @example
 * <StudioDebugHeaderActions blockId={blockId} />
 */
export function StudioDebugHeaderActions({
	blockId,
}: {
	blockId: string | null;
}): React.JSX.Element {
	const { inspectorControlsOpen, openInspector, toggleInspectorControls } =
		useTaleStudioStoreShallow((state) => ({
			inspectorControlsOpen: state.studioSelection.inspectorControlsOpen,
			openInspector: state.studioSelection.openInspector,
			toggleInspectorControls: state.studioSelection.toggleInspectorControls,
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
