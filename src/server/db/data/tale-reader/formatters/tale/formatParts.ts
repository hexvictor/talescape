/**
 * Formats database part rows into the reader part model.
 *
 * @param rows - Part rows returned from the tale query.
 * @returns Reader parts sorted by their stored order.
 *
 * @example
 * const parts = formatParts(record.parts);
 */
export function formatParts(rows: unknown[]) {
	return rows.map((row) => {
		const item = row as {
			description?: string | null;
			id: number;
			order?: number;
			title: string;
		};
		return {
			description: item.description ?? undefined,
			id: String(item.id),
			order: item.order ?? 0,
			title: item.title,
		};
	});
}
