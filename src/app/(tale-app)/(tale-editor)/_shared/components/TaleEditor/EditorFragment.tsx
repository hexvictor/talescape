"use client";

import { ReaderFragment } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderFragment/ReaderFragment";
import type { ResolvedTaleFragment } from "~/app/(tale-app)/_shared/types";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";
import { EditorFragmentOverlay } from "./EditorFragmentOverlay";

/**
 * Renders a fragment with editor-only overlays and inline text editing.
 *
 * @param props - Editor fragment properties.
 * @param props.contentSized - Whether the owning block uses content-derived sizing.
 * @param props.fragment - Fragment to render.
 * @param props.index - Fragment index inside its owning node or layer.
 * @param props.onChoosePath - Optional choice-path callback.
 * @returns Fragment content with editor controls layered inside it.
 *
 * @example
 * <EditorFragment fragment={fragment} index={0} />
 */
export function EditorFragment({
	contentSized = false,
	fragment,
	index,
}: {
	contentSized?: boolean;
	fragment: ResolvedTaleFragment;
	index: number;
}): React.JSX.Element {
	const { inspectorControlsOpen, openInspector } = useTaleEditorStoreShallow(
		(state) => ({
			inspectorControlsOpen: state.editor.inspectorControlsOpen,
			openInspector: state.editor.openInspector,
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
				<EditorFragmentOverlay fragment={fragment} />
			</ReaderFragment>
		</div>
	);
}
