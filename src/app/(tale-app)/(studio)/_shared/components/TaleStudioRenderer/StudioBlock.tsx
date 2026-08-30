"use client";

import { ReaderBlock } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderBlock/ReaderBlock";
import type { Anchor } from "~/app/(tale-app)/_shared/types";
import { StudioBlockOverlay } from "./StudioBlockOverlay";

/**
 * Adds Tale Studio inspection affordances around the base reader block.
 *
 * @param props - Studio block properties.
 * @param props.anchor - Compiled block anchor rendered by the reader stage.
 * @returns Reader block with Studio controls layered inside it.
 *
 * @example
 * <StudioBlock anchor={anchor} />
 */
export function StudioBlock({
	anchor,
}: {
	anchor: Anchor;
}): React.JSX.Element {
	return (
		<ReaderBlock anchor={anchor}>
			<StudioBlockOverlay anchor={anchor} />
		</ReaderBlock>
	);
}
