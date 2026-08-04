/**
 * Formats database page rows into the reader page model.
 *
 * @param rows - Page rows returned from the tale query.
 * @returns Reader pages with optional page titles and descriptions.
 *
 * @example
 * const pages = formatPages(record.pages);
 */
export function formatPages(rows: unknown[]) {
	return rows.map((row) => {
		const item = row as {
			description?: string | null;
			entryId: number;
			id: number;
			isPaginated: boolean;
			partId: number;
			title?: string | null;
			order?: number;
			type: string;
		};
		return {
			blockIds: [],
			description: item.description ?? undefined,
			entryId: String(item.entryId),
			id: String(item.id),
			isPaginated: item.isPaginated,
			order: item.order ?? 0,
			partId: String(item.partId),
			title: item.title ?? undefined,
			type: item.type,
		};
	});
}
