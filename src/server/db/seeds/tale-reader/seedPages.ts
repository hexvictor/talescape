import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { entries, pages, tales } from "~/server/db/schema";
import { readerPageBlueprints } from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

/**
 * Queries real entry rows and inserts globally ordered pages.
 *
 * @returns Nothing.
 */
export async function seedPages(): Promise<void> {
	logSeedStart("Pages");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");
	const allEntries = await db
		.select({
			id: entries.id,
			order: entries.order,
			partId: entries.partId,
		})
		.from(entries)
		.where(eq(entries.taleId, tale.id));
	const entryByOrder = new Map(allEntries.map((entry) => [entry.order, entry]));

	await db.insert(pages).values(
		readerPageBlueprints.map((page) => {
			const entry = entryByOrder.get(page.entryOrder);
			if (!entry) throw new Error(`Missing entry ${page.entryOrder}.`);
			return {
				description: `${page.title}, page ${page.localOrder + 1} of its entry.`,
				entryId: entry.id,
				isPaginated: page.isPaginated,
				order: page.order,
				partId: entry.partId,
				taleId: tale.id,
				title: page.title,
				type: page.type,
			};
		}),
	);
	logSeedComplete("Pages");
}
