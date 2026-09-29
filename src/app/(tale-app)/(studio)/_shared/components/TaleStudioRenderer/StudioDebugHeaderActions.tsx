"use client";

import { ScanSearch, Settings2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useTaleStudioStoreShallow } from "../../hooks/useTaleStudioStore";

/**
 * Renders Studio inspection actions in the shared reader debug header.
 *
 * @param props - Debug action properties.
 * @param props.sceneId - Active reader block identifier, when available.
 * @returns Controls for inspecting the active block and toggling inspectors.
 *
 * @example
 * <StudioDebugHeaderActions sceneId={sceneId} />
 */
export function StudioDebugHeaderActions({
	sceneId,
}: {
	sceneId: string | null;
}): React.JSX.Element {
	const { inspectorControlsOpen, openInspector, toggleInspectorControls } =
		useTaleStudioStoreShallow((state) => ({
			inspectorControlsOpen: state.studioSelection.inspectorControlsOpen,
			openInspector: state.studioSelection.openInspector,
			toggleInspectorControls: state.studioSelection.toggleInspectorControls,
		}));

	return (
		<>
			<Button
				aria-label="Inspect current block"
				disabled={!sceneId}
				className="h-9 w-9 border-foreground/10 p-0 text-foreground/55"
				motion="flat"
				size="icon"
				variant="ghost"
				onPress={() => {
					if (sceneId) openInspector({ id: sceneId, type: "scene" });
				}}
			>
				<ScanSearch size={16} />
			</Button>
			<Button
				aria-label={
					inspectorControlsOpen
						? "Hide inspector buttons"
						: "Show inspector buttons"
				}
				className="h-9 w-9 border-foreground/10 p-0 text-foreground/55"
				motion="flat"
				size="icon"
				variant="ghost"
				onPress={toggleInspectorControls}
			>
				<Settings2
					className={inspectorControlsOpen ? "text-primary" : undefined}
					size={16}
				/>
			</Button>
		</>
	);
}
