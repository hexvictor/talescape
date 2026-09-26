"use client";

import { FileQuestion, Image, Music2, Type, Video } from "lucide-react";
import { InspectorButton } from "~/app/(tale-app)/_shared/components/ReaderShell/InspectorButton/InspectorButton";
import type { ResolvedTaleElement } from "~/app/(tale-app)/_shared/types";
import { useTaleStudioStoreShallow } from "../../hooks/useTaleStudioStore";

/**
 * Renders the Studio inspection control associated with a rendered element.
 *
 * @param props - Element overlay properties.
 * @param props.element - Element represented by the surrounding reader frame.
 * @returns A Studio inspection control, or null when controls are hidden.
 *
 * @example
 * <StudioElementOverlay element={element} />
 */
export function StudioElementOverlay({
	element,
}: {
	element: ResolvedTaleElement;
}): React.JSX.Element | null {
	const { inspectorControlsOpen, openInspector } = useTaleStudioStoreShallow(
		(state) => ({
			inspectorControlsOpen: state.studioSelection.inspectorControlsOpen,
			openInspector: state.studioSelection.openInspector,
		}),
	);
	if (!inspectorControlsOpen) return null;
	const Icon =
		element.type === "image"
			? Image
			: element.type === "audio" || element.type === "soundCue"
				? Music2
				: element.type === "video"
					? Video
					: element.type === "text" || element.type === "quote"
						? Type
						: FileQuestion;

	return (
		<>
			<div className="pointer-events-none absolute inset-0 z-[28] rounded-[inherit] border border-emerald-300/0 bg-emerald-300/0 transition group-hover/element:border-emerald-300 group-hover/element:bg-emerald-300/8" />
			<InspectorButton
				icon={<Icon size={15} />}
				label={`Edit element ${element.id}`}
				position="element"
				onClick={() => {
					openInspector({
						sceneId: element.sceneId,
						id: element.id,
						type: "element",
					});
				}}
			/>
		</>
	);
}
