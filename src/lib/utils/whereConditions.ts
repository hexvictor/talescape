import { and, eq, inArray, type Column, type SQL } from "drizzle-orm";
import type { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";

/**
 * Generates a Drizzle 'where' clause based on provided filters and initial conditions.
 *
 * @param tableSchema - The Drizzle table schema object (e.g., `books`, `users`).
 * @param filters - An object containing key-value pairs for dynamic filtering.
 *                  Values can be single primitive types or arrays of primitives for 'IN' clauses.
 * @param initialConditions - Optional array of Drizzle SQL expressions to be
 *                            ALWAYS included in the `and` clause (e.g., userId filter).
 * @returns A Drizzle `SQL` expression (for `where`) or `undefined` if no conditions.
 */
export function createWhereConditions<TTable extends AnyPgTable>(
	// Removed 'Drizzle' from name
	tableSchema: TTable,
	filters: Record<
		string,
		string | number | (string | number)[] | undefined | null
	>,
	initialConditions: SQL[] = [], // <--- NEW: Optional initial conditions array
): SQL | undefined {
	const conditions: SQL[] = [...initialConditions]; // <--- Start with initial conditions

	for (const key in filters) {
		if (Object.prototype.hasOwnProperty.call(filters, key)) {
			const value = filters[key as keyof typeof filters];

			if (value !== undefined && value !== null) {
				const column = tableSchema[key as keyof TTable] as
					| AnyPgColumn
					| undefined;

				if (column) {
					if (Array.isArray(value)) {
						if (value.length > 0) {
							conditions.push(inArray(column, value));
						}
					} else {
						conditions.push(eq(column, value));
					}
				}
			}
		}
	}

	return conditions.length > 0 ? and(...conditions) : undefined;
}
