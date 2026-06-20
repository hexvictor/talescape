import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { parts, tales } from "~/server/db/schema";
import { readerPartTitles } from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

/**
 * Queries the seeded tale and inserts its ordered parts using the real tale id.
 *
 * @returns Nothing.
 */
export async function seedParts(): Promise<void> {
	logSeedStart("Parts");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");

	await db.insert(parts).values(
		readerPartTitles.map((title, order) => ({
			description: `${title}, part ${order + 1} of Forked Fates.`,
			order,
			taleId: tale.id,
			title,
		})),
	);
	logSeedComplete("Parts");
}
