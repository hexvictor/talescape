"use client";

import { useState } from "react";
import { DefaultFragment } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderFragment/fragments/DefaultFragment";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { resolveTaleBreakpoint } from "~/app/(tale-app)/_shared/services/resolveTaleBreakpoint";
import type { ResolvedTaleFragment } from "~/app/(tale-app)/_shared/types";
import { useTaleEditorStore } from "../../hooks/useTaleEditorStore";
import { editFragment } from "../../services/taleDraftEdits";

/**
 * Adds inline editing behavior to a text fragment rendered by the editor preview.
 *
 * @param props - Text fragment renderer properties.
 * @param props.fragment - Text fragment being rendered and edited.
 * @param props.index - Fragment position within its parent node.
 * @returns Text content that enters edit mode on request while editing is active.
 *
 * @example
 * <EditorTextFragmentContent fragment={fragment} index={0} />
 */
export function EditorTextFragmentContent({
	fragment,
	index,
}: {
	fragment: ResolvedTaleFragment;
	index: number;
}): React.JSX.Element {
	const isEditing = useTaleAppStore((state) => state.derived.isEditing);
	const activeBreakpointId = useTaleAppStore(
		(state) => state.runtime.breakpointId,
	);
	const openInspector = useTaleEditorStore((state) => state.editor.openInspector);
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const [editing, setEditing] = useState(false);
	const resolvedFragment =
		resolveTaleBreakpoint(tale, activeBreakpointId).indexMap.fragmentsById[
			fragment.id
		] ?? fragment;

	return (
		<DefaultFragment
			editing={editing}
			fragment={resolvedFragment}
			index={index}
			onRequestEdit={() => {
				if (!isEditing) return;
				openInspector({
					blockId: fragment.blockId,
					id: fragment.id,
					initialTab: "content",
					type: "fragment",
				});
				setEditing(true);
			}}
			onCommit={(text) => {
				setEditing(false);
				if (text === resolvedFragment.text) return;
				setTale(
					editFragment(
						tale,
						fragment.id,
						(item) => ({ ...item, text }),
						activeBreakpointId,
					),
					{
						invalidation: "measurement",
						reason: "inline-fragment-text",
					},
				);
			}}
		/>
	);
}
