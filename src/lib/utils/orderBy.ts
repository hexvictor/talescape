import { asc, desc } from "drizzle-orm";
import type { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";

export type OrderByInput<TField extends string> = {
	field: TField;
	direction: "asc" | "desc";
};

/**
 * Generates a Drizzle orderBy clause dynamically based on input.
 *
 * @param tableSchema - The Drizzle table schema object (e.g., `books`, `users`).
 * @param orderByInput - An object containing the field to order by and the direction.
 * @param defaultOrder - An array of Drizzle order functions for default ordering if orderByInput is not provided.
 * @returns An array suitable for Drizzle's `orderBy` option in `findMany`.
 */
export function getOrderBy<
	TTable extends AnyPgTable,
	TValidColumnKeys extends Extract<keyof TTable, string>,
>(
	tableSchema: TTable,
	orderByInput: OrderByInput<TValidColumnKeys> | undefined,
	//biome-ignore lint/suspicious/noExplicitAny: ignore
	defaultOrder: any[],
	//biome-ignore lint/suspicious/noExplicitAny: ignore
): any[] {
	if (orderByInput) {
		const column = tableSchema[orderByInput.field];

		const drizzleColumn = column as AnyPgColumn;

		return [
			orderByInput.direction === "desc"
				? desc(drizzleColumn)
				: asc(drizzleColumn),
		];
	}
	return defaultOrder;
}
