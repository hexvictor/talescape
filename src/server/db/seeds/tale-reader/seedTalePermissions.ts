import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { talePermissions, tales } from "~/server/db/schema";
import { userId1 } from "../ids";
import { logSeedComplete, logSeedStart } from "./seedLogs";

/**
 * Inserts owner permissions for the seeded official tale.
 *
 * @returns Nothing.
 */
export async function seedTalePermissions(): Promise<void> {
	logSeedStart("Tale permissions");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "official-tale-branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");

	await db.insert(talePermissions).values({
		permissionTypes: ["viewer", "collaborator", "cloner"],
		taleId: tale.id,
		userId: userId1,
	});
	logSeedComplete("Tale permissions");
}
