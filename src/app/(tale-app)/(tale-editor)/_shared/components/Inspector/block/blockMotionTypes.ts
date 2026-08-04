import type {
	ResolvedTaleBlock,
	TaleBlock,
} from "~/app/(tale-app)/_shared/types";

/**
 * Applies an immutable update to the inspected block.
 */
export type BlockChangeHandler = (
	update: (block: ResolvedTaleBlock) => TaleBlock,
) => void;
