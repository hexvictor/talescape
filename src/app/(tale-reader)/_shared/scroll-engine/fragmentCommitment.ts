import type { ResolvedTaleFragment } from "../types";

/**
 * Resolves the block progress where a one-way fragment becomes committed.
 *
 * @param fragment - Fragment with scrolling animation and visibility metadata.
 * @returns Normalized commit threshold.
 *
 * @example
 * const threshold = getFragmentCommitThreshold(fragment);
 */
export function getFragmentCommitThreshold(
	fragment: ResolvedTaleFragment,
): number {
	const lastAnimationEnd = Math.max(
		...fragment.resolvedAnimations.scrolling.map((track) => track.end),
		Number.NEGATIVE_INFINITY,
	);
	return Number.isFinite(lastAnimationEnd)
		? lastAnimationEnd
		: fragment.resolvedVisibleRange.end;
}
