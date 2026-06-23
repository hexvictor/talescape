"use client";

import { EditorFragment } from "~/app/(tale-app)/(tale-editor)/_shared/components/TaleEditor/EditorFragment";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import type { ResolvedTaleFragment, TalePath } from "../../../types";
import { ReaderFragment } from "../ReaderFragment/ReaderFragment";

/**
 * Chooses the reader or editor fragment shape for the mounted tale application.
 *
 * @param props - Tale fragment properties.
 * @param props.contentSized - Whether the owning block uses content-derived sizing.
 * @param props.fragment - Fragment to render.
 * @param props.index - Fragment index inside its owning node or layer.
 * @param props.onChoosePath - Optional choice-path callback.
 * @returns Reader fragment, or editor fragment wrapper when the editor application is active.
 *
 * @example
 * <TaleFragment fragment={fragment} index={0} />
 */
export function TaleFragment({
	contentSized = false,
	fragment,
	index,
	onChoosePath,
}: {
	contentSized?: boolean;
	fragment: ResolvedTaleFragment;
	index: number;
	onChoosePath?: (path: TalePath) => void;
}): React.JSX.Element {
	const isEditor = useTaleAppStore((state) => state.derived.isEditor);

	if (isEditor) {
		return (
			<EditorFragment
				contentSized={contentSized}
				fragment={fragment}
				index={index}
				onChoosePath={onChoosePath}
			/>
		);
	}

	return (
		<ReaderFragment
			contentSized={contentSized}
			fragment={fragment}
			index={index}
			onChoosePath={onChoosePath}
		/>
	);
}
