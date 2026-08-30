"use client";

import { useTaleRenderSlots } from "../../../contexts/TaleRenderContext";
import type { Anchor } from "../../../types";
import { ReaderBlock } from "../ReaderBlock/ReaderBlock";

/**
 * Chooses the base or application-extended block renderer.
 *
 * @param props - Tale block properties.
 * @param props.anchor - Compiled block anchor rendered by the reader stage.
 * @returns Base reader block or the active application extension.
 *
 * @example
 * <TaleBlock anchor={anchor} />
 */
export function TaleBlock({ anchor }: { anchor: Anchor }): React.JSX.Element {
	const { Block } = useTaleRenderSlots();

	if (Block) return <Block anchor={anchor} />;

	return <ReaderBlock anchor={anchor} />;
}
