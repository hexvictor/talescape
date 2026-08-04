export const taleDetailViews = [
	{ key: "overview", label: "Overview" },
	{ key: "branches", label: "Branches" },
	{ key: "blocks", label: "Blocks" },
	{ key: "fragments", label: "Fragments" },
	{ key: "paths", label: "Paths" },
	{ key: "parts", label: "Parts" },
	{ key: "entries", label: "Entries" },
	{ key: "pages", label: "Pages" },
] as const;

export type TaleDetailView = (typeof taleDetailViews)[number]["key"];

const taleDetailViewKeys = new Set(taleDetailViews.map((view) => view.key));

/**
 * Normalizes an optional URL view parameter to a supported tale detail view.
 *
 * @param view - Raw query-string view value.
 * @returns A supported view key, defaulting to the overview.
 *
 * @example
 * const view = normalizeTaleDetailView(searchParams.view);
 */
export function normalizeTaleDetailView(
	view: string | undefined,
): TaleDetailView {
	return taleDetailViewKeys.has(view as TaleDetailView)
		? (view as TaleDetailView)
		: "overview";
}
