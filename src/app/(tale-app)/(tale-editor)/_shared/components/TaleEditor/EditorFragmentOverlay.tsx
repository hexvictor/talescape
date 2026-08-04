"use client";

import { InspectorButton } from "~/app/(tale-app)/_shared/components/ReaderShell/InspectorButton/InspectorButton";
import type { ResolvedTaleFragment } from "~/app/(tale-app)/_shared/types";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";

/**
 * Renders the editor inspection control associated with a rendered fragment.
 *
 * @param props - Fragment overlay properties.
 * @param props.fragment - Fragment represented by the surrounding reader frame.
 * @returns An editor-only inspection control, or null when controls are hidden.
 *
 * @example
 * <EditorFragmentOverlay fragment={fragment} />
 */
export function EditorFragmentOverlay({
	fragment,
}: {
	fragment: ResolvedTaleFragment;
}): React.JSX.Element | null {
	const { inspectorControlsOpen, openInspector } = useTaleEditorStoreShallow(
		(state) => ({
			inspectorControlsOpen: state.editor.inspectorControlsOpen,
			openInspector: state.editor.openInspector,
		}),
	);
	if (!inspectorControlsOpen) return null;

	return (
		<>
			<div
				className="pointer-events-none absolute inset-0 z-[28] rounded-[inherit] border border-emerald-300/0 bg-emerald-300/0 transition group-hover/fragment:border-emerald-300 group-hover/fragment:bg-emerald-300/8"
			/>
			<InspectorButton
				label={`Edit fragment ${fragment.id}`}
				position="fragment"
				onClick={() => {
					openInspector({
						blockId: fragment.blockId,
						id: fragment.id,
						type: "fragment",
					});
				}}
			/>
		</>
	);
}
