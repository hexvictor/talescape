import type { TalePage } from "../types";

/**
 * Converts a page type into a readable label.
 *
 * @param type - Persisted page type.
 * @returns A title-cased page type label.
 *
 * @example
 * getPageTypeLabel("table_of_contents");
 */
function getPageTypeLabel(type: TalePage["type"]): string {
	return type
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Builds the reader-facing label for a compiled page.
 *
 * @param page - Formatted page.
 * @param pageNumber - Route-derived number for paginated pages.
 * @returns A numbered or semantic page label.
 *
 * @example
 * getReaderPageLabel(page, 3);
 */
export function getReaderPageLabel(
	page: TalePage,
	pageNumber: number | null,
): string {
	return page.isPaginated && pageNumber !== null
		? `Page ${pageNumber}`
		: getPageTypeLabel(page.type);
}
