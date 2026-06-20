/**
 * Creates an id-keyed lookup from formatted entities.
 *
 * @param items - Entities containing string ids.
 * @returns Lookup keyed by entity id.
 *
 * @example
 * const blocksById = recordById(blocks);
 */
export function recordById<T extends { id: string }>(
	items: readonly T[],
): Record<string, T> {
	return Object.fromEntries(items.map((item) => [item.id, item])) as Record<
		string,
		T
	>;
}

/**
 * Groups entity ids under a derived relationship key.
 *
 * @param items - Source entities.
 * @param key - Relationship key selector.
 * @param value - Entity id selector.
 * @returns Relationship id lookup.
 *
 * @example
 * const blockIdsByPage = groupIdsBy(blocks, block => block.pageId, block => block.id);
 */
export function groupIdsBy<T>(
	items: readonly T[],
	key: (item: T) => string,
	value: (item: T) => string,
): Record<string, string[]> {
	const groups: Record<string, string[]> = {};
	for (const item of items) {
		const groupKey = key(item);
		groups[groupKey] ??= [];
		groups[groupKey]?.push(value(item));
	}
	return groups;
}

/**
 * Returns a copy ordered by each entity's authored order.
 *
 * @param items - Ordered entities.
 * @returns Sorted entity copy.
 */
export function sortedByOrder<T extends { order: number }>(
	items: readonly T[],
): T[] {
	return [...items].sort((a, b) => a.order - b.order);
}

/**
 * Derives index and edge flags for an ordered collection.
 *
 * @param index - Entity index.
 * @param total - Collection size.
 * @returns Position metadata.
 */
export function indexPosition(index: number, total: number) {
	return { index, isFirst: index === 0, isLast: index === total - 1 };
}

/**
 * Resolves adjacent ids around one id.
 *
 * @param ids - Ordered ids.
 * @param id - Current entity id.
 * @returns Current index and adjacent ids.
 */
export function adjacentIds(ids: readonly string[], id: string) {
	const index = ids.indexOf(id);
	return {
		index,
		next: index >= 0 ? (ids[index + 1] ?? null) : null,
		previous: index >= 0 ? (ids[index - 1] ?? null) : null,
	};
}

/**
 * Returns the first item or null.
 *
 * @param items - Source collection.
 * @returns First item or null.
 */
export function first<T>(items: readonly T[]): T | null {
	return items[0] ?? null;
}

/**
 * Returns the last item or null.
 *
 * @param items - Source collection.
 * @returns Last item or null.
 */
export function last<T>(items: readonly T[]): T | null {
	return items[items.length - 1] ?? null;
}
