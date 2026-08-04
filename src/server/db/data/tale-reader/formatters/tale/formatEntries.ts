import type { Tale } from "~/app/(tale-app)/_shared/types";

/**
 * Formats database entry rows into the reader entry model.
 *
 * @param rows - Entry rows returned from the tale query.
 * @returns Reader entries with ids normalized to strings.
 *
 * @example
 * const entries = formatEntries(record.entries);
 */
export function formatEntries(rows: unknown[]) {
	return rows.map((row) => {
		const item = row as {
			description?: string | null;
			id: number;
			isNumbered?: boolean;
			partId: number;
			order?: number;
			title: string;
			type: string;
		};
		return {
			description: item.description ?? undefined,
			id: String(item.id),
			isNumbered: item.isNumbered ?? item.type === "chapter",
			order: item.order ?? 0,
			partId: String(item.partId),
			title: item.title,
			type: item.type as Tale["structure"]["entries"][number]["type"],
		};
	});
}
