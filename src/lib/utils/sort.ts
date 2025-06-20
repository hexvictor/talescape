export function sortByIndex<T extends { index: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.index - b.index);
}

/**
 * Sorts child items by:
 * 1. The order of their parent in the provided sorted `parents` list
 * 2. Their local `index` within that parent
 *
 * Useful when children (e.g., entries, pages) have a parentId (e.g., partId, entryId)
 * and an index local to that parent.
 *
 * @template T - The item type (e.g., Entry, Page)
 * @template P - The parent type (e.g., Part, Entry)
 *
 * @param items - List of items to sort (e.g., entries, pages)
 * @param parents - List of already sorted parents (e.g., partsSorted, entriesSorted)
 * @param getParentId - Function to extract the parent ID from an item
 * @param getItemIndex - Function to extract the local index of the item inside the parent
 * @param getParentIdFromParent - Function to extract the ID from a parent
 *
 * @returns A flat, globally sorted array of the items
 *
 * @example
 * const partsSorted = [{ id: "partA" }, { id: "partB" }];
 * const entries = [
 *   { id: "e1", partId: "partB", index: 1 },
 *   { id: "e2", partId: "partA", index: 0 },
 *   { id: "e3", partId: "partB", index: 0 },
 * ];
 *
 * const entriesSorted = sortByParentAndIndex(
 *   entries,
 *   partsSorted,
 *   (entry) => entry.partId,
 *   (entry) => entry.index,
 *   (part) => part.id
 * );
 *
 * // Result:
 * // [
 * //   { id: "e2", partId: "partA", index: 0 },
 * //   { id: "e3", partId: "partB", index: 0 },
 * //   { id: "e1", partId: "partB", index: 1 }
 * // ]
 */
export function sortByParentAndIndex<T, P>(
  items: T[],
  parents: P[],
  getParentId: (item: T) => number,
  getItemIndex: (item: T) => number,
  getParentIdFromParent: (parent: P) => number
): T[] {
  return parents.flatMap((parent) => {
    const parentId = getParentIdFromParent(parent);
    return items
      .filter((item) => getParentId(item) === parentId)
      .sort((a, b) => getItemIndex(a) - getItemIndex(b));
  });
}
