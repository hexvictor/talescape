"use client";

import { useTaleRenderSlots } from "../../../contexts/TaleRenderContext";
import type { Anchor } from "../../../types";
import { ReaderScene } from "../ReaderScene/ReaderScene";

/**
 * Chooses the base or application-extended block renderer.
 *
 * @param props - Tale block properties.
 * @param props.anchor - Compiled block anchor rendered by the reader stage.
 * @returns Base reader block or the active application extension.
 *
 * @example
 * <TaleScene anchor={anchor} />
 */
export function TaleScene({ anchor }: { anchor: Anchor }): React.JSX.Element {
	const { Scene } = useTaleRenderSlots();

	if (Scene) return <Scene anchor={anchor} />;

	return <ReaderScene anchor={anchor} />;
}
