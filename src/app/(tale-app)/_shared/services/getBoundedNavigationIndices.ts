const DEFAULT_VISIBLE_ITEM_COUNT = 7;
const NEARBY_INDEX_OFFSETS = [0, -1, 1, -2, 2, -3, 3, -4, 4];

export type BoundedNavigationIndex =
	| {
			index: number;
			type: "item";
	  }
	| {
			id: string;
			targetIndex: number;
			type: "ellipsis";
	  };

type GetBoundedNavigationIndicesOptions = {
	activeIndex: number;
	browseIndex: number;
	itemCount: number;
	visibleItemCount?: number;
};

/**
 * Builds a stable navigation window containing route edges, the active item,
 * nearby browsed items, and ellipsis controls for omitted ranges.
 *
 * @param options - Active, browsed, total, and visible item counts.
 * @returns Ordered item indices and ellipsis controls.
 *
 * @example
 * const items = getBoundedNavigationIndices({
 * 	activeIndex: 4,
 * 	browseIndex: 6,
 * 	itemCount: 12,
 * });
 */
export function getBoundedNavigationIndices({
	activeIndex,
	browseIndex,
	itemCount,
	visibleItemCount = DEFAULT_VISIBLE_ITEM_COUNT,
}: GetBoundedNavigationIndicesOptions): BoundedNavigationIndex[] {
	if (itemCount <= visibleItemCount) {
		return Array.from({ length: itemCount }, (_, index) => ({
			index,
			type: "item" as const,
		}));
	}

	const selectedIndices = new Set<number>([0, itemCount - 1, activeIndex]);
	addNearbyIndices(selectedIndices, browseIndex, itemCount, visibleItemCount);
	addNearbyIndices(selectedIndices, activeIndex, itemCount, visibleItemCount);

	const orderedIndices = [...selectedIndices].sort(
		(left, right) => left - right,
	);
	const navigationIndices: BoundedNavigationIndex[] = [];

	for (let position = 0; position < orderedIndices.length; position++) {
		const index = orderedIndices[position];
		if (index === undefined) continue;
		const previousIndex = orderedIndices[position - 1];
		if (previousIndex !== undefined && index - previousIndex > 1) {
			navigationIndices.push({
				id: `ellipsis-${previousIndex}-${index}`,
				targetIndex: Math.floor((previousIndex + index) / 2),
				type: "ellipsis",
			});
		}
		navigationIndices.push({ index, type: "item" });
	}

	return navigationIndices;
}

/**
 * Adds valid nearby indices until a navigation window reaches its target size.
 *
 * @param selectedIndices - Mutable set of selected item indices.
 * @param centerIndex - Index around which nearby items are selected.
 * @param itemCount - Total number of navigable items.
 * @param visibleItemCount - Maximum number of selected item indices.
 * @returns Nothing.
 *
 * @example
 * addNearbyIndices(indices, 4, 10, 7);
 */
function addNearbyIndices(
	selectedIndices: Set<number>,
	centerIndex: number,
	itemCount: number,
	visibleItemCount: number,
): void {
	for (const offset of NEARBY_INDEX_OFFSETS) {
		if (selectedIndices.size >= visibleItemCount) return;
		const index = centerIndex + offset;
		if (index > 0 && index < itemCount - 1) selectedIndices.add(index);
	}
}
