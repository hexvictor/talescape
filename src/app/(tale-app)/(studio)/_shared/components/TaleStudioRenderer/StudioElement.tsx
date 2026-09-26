"use client";

import { ReaderElement } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderElement/ReaderElement";
import type { ResolvedTaleElement } from "~/app/(tale-app)/_shared/types";
import { useTaleStudioStoreShallow } from "../../hooks/useTaleStudioStore";
import { StudioElementOverlay } from "./StudioElementOverlay";

/**
 * Renders a element with Studio overlays and editor-workspace text editing.
 *
 * @param props - Studio element properties.
 * @param props.contentSized - Whether the owning block uses content-derived sizing.
 * @param props.element - Element to render.
 * @param props.index - Element index inside its owning node or layer.
 * @returns Element content with Studio controls layered inside it.
 *
 * @example
 * <StudioElement element={element} index={0} />
 */
export function StudioElement({
	contentSized = false,
	element,
	index,
}: {
	contentSized?: boolean;
	element: ResolvedTaleElement;
	index: number;
}): React.JSX.Element {
	const { inspectorControlsOpen, openInspector } = useTaleStudioStoreShallow(
		(state) => ({
			inspectorControlsOpen: state.studioSelection.inspectorControlsOpen,
			openInspector: state.studioSelection.openInspector,
		}),
	);

	return (
		<ReaderElement
			contentSized={contentSized}
			element={element}
			index={index}
			onClickCapture={(event) => {
				if (!inspectorControlsOpen) return;
				event.preventDefault();
				event.stopPropagation();
				openInspector({
					sceneId: element.sceneId,
					id: element.id,
					type: "element",
				});
			}}
			onDoubleClick={(event) => {
				if (!inspectorControlsOpen || element.type === "text") return;
				event.preventDefault();
				event.stopPropagation();
				openInspector({
					sceneId: element.sceneId,
					id: element.id,
					initialTab: "content",
					type: "element",
				});
			}}
		>
			<StudioElementOverlay element={element} />
		</ReaderElement>
	);
}
