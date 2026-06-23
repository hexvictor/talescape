"use client";

import { useState } from "react";
import { DefaultFragment } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderFragment/fragments/DefaultFragment";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type { ResolvedTaleFragment } from "~/app/(tale-app)/_shared/types";
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
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const [editing, setEditing] = useState(false);

	return (
		<DefaultFragment
			editing={editing}
			fragment={fragment}
			index={index}
			onRequestEdit={() => {
				if (isEditing) setEditing(true);
			}}
			onCommit={(text) => {
				setEditing(false);
				if (text === fragment.text) return;
				setTale(
					editFragment(tale, fragment.id, (item) => ({ ...item, text })),
					{
						invalidation: "measurement",
						reason: "inline-fragment-text",
					},
				);
			}}
		/>
	);
}
