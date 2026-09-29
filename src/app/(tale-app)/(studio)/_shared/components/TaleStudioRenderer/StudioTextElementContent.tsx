"use client";

import { useState } from "react";
import { DefaultElement } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderElement/elements/DefaultElement";
import {
	useTaleAppStore,
	useTaleAppStoreShallow,
} from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { resolveTaleBreakpoint } from "~/app/(tale-app)/_shared/services/resolveTaleBreakpoint";
import type { ResolvedTaleElement } from "~/app/(tale-app)/_shared/types";
import { useTaleStudioStore } from "../../hooks/useTaleStudioStore";
import { editElement } from "../../services/taleDraftEdits";

/**
 * Adds editor-workspace inline editing to a Studio-rendered text element.
 *
 * @param props - Text element renderer properties.
 * @param props.element - Text element being rendered and edited.
 * @param props.index - Element position within its parent node.
 * @returns Text content that enters edit mode on request while editing is active.
 *
 * @example
 * <StudioTextElementContent element={element} index={0} />
 */
export function StudioTextElementContent({
	element,
	index,
}: {
	element: ResolvedTaleElement;
	index: number;
}): React.JSX.Element {
	const isEditorWorkspace = useTaleAppStore(
		(state) => state.derived.isEditorWorkspace,
	);
	const activeBreakpointId = useTaleAppStore(
		(state) => state.runtime.breakpointId,
	);
	const openInspector = useTaleStudioStore(
		(state) => state.studioSelection.openInspector,
	);
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const [editing, setEditing] = useState(false);
	const resolvedFragment =
		resolveTaleBreakpoint(tale, activeBreakpointId).indexMap.elementsById[
			element.id
		] ?? element;

	return (
		<DefaultElement
			editing={editing}
			element={resolvedFragment}
			index={index}
			onRequestEdit={() => {
				if (!isEditorWorkspace) return;
				openInspector({
					sceneId: element.sceneId,
					id: element.id,
					initialTab: "content",
					type: "element",
				});
				setEditing(true);
			}}
			onCommit={(text) => {
				setEditing(false);
				if (text === resolvedFragment.text) return;
				setTale(
					editElement(
						tale,
						element.id,
						(item) => ({ ...item, text }),
						activeBreakpointId,
					),
					{
						invalidation: "measurement",
						reason: "inline-element-text",
					},
				);
			}}
		/>
	);
}
