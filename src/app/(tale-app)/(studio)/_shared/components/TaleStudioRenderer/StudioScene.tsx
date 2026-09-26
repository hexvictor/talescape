"use client";

import { ReaderScene } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderScene/ReaderScene";
import type { Anchor } from "~/app/(tale-app)/_shared/types";
import { StudioSceneOverlay } from "./StudioSceneOverlay";

/**
 * Adds Tale Studio inspection affordances around the base reader block.
 *
 * @param props - Studio block properties.
 * @param props.anchor - Compiled block anchor rendered by the reader stage.
 * @returns Reader block with Studio controls layered inside it.
 *
 * @example
 * <StudioScene anchor={anchor} />
 */
export function StudioScene({
	anchor,
}: {
	anchor: Anchor;
}): React.JSX.Element {
	return (
		<ReaderScene anchor={anchor}>
			<StudioSceneOverlay anchor={anchor} />
		</ReaderScene>
	);
}
