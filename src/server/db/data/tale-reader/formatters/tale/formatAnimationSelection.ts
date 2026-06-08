import type { AnimationSelection } from "~/app/(tale-reader)/_shared/types";
import type { AnimationSelection as DbAnimationSelection } from "~/server/db/types/tale-reader/readerConfig";

/**
 * Converts persisted animation tracks into a frontend animation selection.
 *
 * @param selection - The database selection with official/creator preset refs.
 * @returns The frontend selection object.
 *
 * @example
 * const selection = formatAnimationSelection(row.animationConfig.entering);
 */
export function formatAnimationSelection(
	selection?: DbAnimationSelection,
): AnimationSelection {
	return {
		animations: selection?.tracks ?? [],
	};
}
