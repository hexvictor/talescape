"use client";

import { ReaderBlock } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderBlock/ReaderBlock";
import type { Anchor } from "~/app/(tale-app)/_shared/types";
import { EditorBlockOverlay } from "./EditorBlockOverlay";

/**
 * Adds editor-only block inspection affordances around the base reader block.
 *
 * @param props - Editor block properties.
 * @param props.anchor - Compiled block anchor rendered by the reader stage.
 * @returns Reader block with editor controls layered inside it.
 *
 * @example
 * <EditorBlock anchor={anchor} />
 */
export function EditorBlock({
	anchor,
}: {
	anchor: Anchor;
}): React.JSX.Element {
	return (
		<ReaderBlock anchor={anchor}>
			<EditorBlockOverlay anchor={anchor} />
		</ReaderBlock>
	);
}
