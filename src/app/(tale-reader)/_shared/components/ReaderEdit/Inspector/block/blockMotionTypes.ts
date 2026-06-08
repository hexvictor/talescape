import type { ResolvedTaleBlock, TaleBlock } from "../../../../types";

/**
 * Applies an immutable update to the inspected block.
 */
export type BlockChangeHandler = (
	update: (block: ResolvedTaleBlock) => TaleBlock,
) => void;
