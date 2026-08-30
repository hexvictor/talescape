"use client";

import { ReaderFragment } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderFragment/ReaderFragment";
import type { ResolvedTaleFragment } from "~/app/(tale-app)/_shared/types";
import { useTaleStudioStoreShallow } from "../../hooks/useTaleStudioStore";
import { StudioFragmentOverlay } from "./StudioFragmentOverlay";

/**
 * Renders a fragment with Studio overlays and editor-workspace text editing.
 *
 * @param props - Studio fragment properties.
 * @param props.contentSized - Whether the owning block uses content-derived sizing.
 * @param props.fragment - Fragment to render.
 * @param props.index - Fragment index inside its owning node or layer.
 * @returns Fragment content with Studio controls layered inside it.
 *
 * @example
 * <StudioFragment fragment={fragment} index={0} />
 */
export function StudioFragment({
	contentSized = false,
	fragment,
	index,
}: {
	contentSized?: boolean;
	fragment: ResolvedTaleFragment;
	index: number;
}): React.JSX.Element {
	const { inspectorControlsOpen, openInspector } = useTaleStudioStoreShallow(
		(state) => ({
			inspectorControlsOpen: state.studioSelection.inspectorControlsOpen,
			openInspector: state.studioSelection.openInspector,
		}),
	);

	return (
		<div
			onClickCapture={(event) => {
				if (!inspectorControlsOpen) return;
				event.preventDefault();
				event.stopPropagation();
				openInspector({
					blockId: fragment.blockId,
					id: fragment.id,
					type: "fragment",
				});
			}}
			onDoubleClick={(event) => {
				if (!inspectorControlsOpen || fragment.type === "text") return;
				event.preventDefault();
				event.stopPropagation();
				openInspector({
					blockId: fragment.blockId,
					id: fragment.id,
					initialTab: "content",
					type: "fragment",
				});
			}}
		>
			<ReaderFragment
				contentSized={contentSized}
				fragment={fragment}
				index={index}
			>
				<StudioFragmentOverlay fragment={fragment} />
			</ReaderFragment>
		</div>
	);
}
