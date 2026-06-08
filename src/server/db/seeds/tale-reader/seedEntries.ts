import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { entries, parts, tales } from "~/server/db/schema";
import { readerEntryBlueprints } from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

/**
 * Queries real part rows and inserts ordered entry records.
 *
 * @returns Nothing.
 */
export async function seedEntries(): Promise<void> {
	logSeedStart("Entries");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "official-tale-branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");
	const allParts = await db
		.select({ id: parts.id, order: parts.order })
		.from(parts)
		.where(eq(parts.taleId, tale.id));
	const partIdByOrder = new Map(allParts.map((part) => [part.order, part.id]));

	await db.insert(entries).values(
		readerEntryBlueprints.map((entry) => {
			const partId = partIdByOrder.get(entry.partOrder);
			if (!partId) throw new Error(`Missing part ${entry.partOrder}.`);
			return {
				description: entry.description,
				isNumbered: entry.type === "chapter",
				order: entry.order,
				partId,
				taleId: tale.id,
				title: entry.title,
				type: entry.type,
			};
		}),
	);
	logSeedComplete("Entries");
}
