import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { branches, tales } from "~/server/db/schema";
import { userId1 } from "../ids";
import { readerBranchBlueprints } from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

/**
 * Inserts the authored branch tree and resolves parent ids from database rows.
 *
 * @returns Nothing.
 */
export async function seedBranches(): Promise<void> {
	logSeedStart("Branches");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");

	await db.insert(branches).values(
		readerBranchBlueprints.map((branch) => ({
			cloneable: "private" as const,
			creatorId: userId1,
			description: branch.description,
			editable: true,
			isOfficial: true,
			isVerified: true,
			name: branch.name,
			order: branch.order,
			parentBranchId: null,
			taleId: tale.id,
			title: branch.title,
			visibility: "public" as const,
		})),
	);

	const createdBranches = await db
		.select({ id: branches.id, name: branches.name })
		.from(branches)
		.where(eq(branches.taleId, tale.id));
	const branchIdByName = new Map(
		createdBranches.map((branch) => [branch.name, branch.id]),
	);

	for (const blueprint of readerBranchBlueprints) {
		if (!blueprint.parentName) continue;
		const branchId = branchIdByName.get(blueprint.name);
		const parentBranchId = branchIdByName.get(blueprint.parentName);
		if (!branchId || !parentBranchId) {
			throw new Error(`Missing branch relationship for ${blueprint.name}.`);
		}
		await db
			.update(branches)
			.set({ parentBranchId })
			.where(eq(branches.id, branchId));
	}
	logSeedComplete("Branches");
}
