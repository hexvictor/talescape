import { and, eq, isNull, ne } from "drizzle-orm";
import { db } from "~/server/db";
import { branches, tales } from "~/server/db/schema";
import { userId1 } from "../ids";
import { logSeedComplete, logSeedStart } from "./seedLogs";

const branchDefinitions = [
	{
		description: "The shared road through Thornwick before the first choice.",
		name: "main",
		order: 0,
		title: "The Main Route",
	},
	{
		description: "Mara follows the lantern keeper through the buried nave.",
		name: "lantern",
		order: 1,
		title: "The Lantern Route",
	},
	{
		description: "Mara follows the underground river toward the old gate.",
		name: "river",
		order: 2,
		title: "The River Route",
	},
] as const;

/**
 * Queries the tale, inserts its branches, and resolves parent links from real rows.
 *
 * @returns Nothing.
 */
export async function seedBranches(): Promise<void> {
	logSeedStart("Branches");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "official-tale-branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");

	await db.insert(branches).values(
		branchDefinitions.map((branch) => ({
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
	const allBranches = await db
		.select({ id: branches.id, name: branches.name })
		.from(branches)
		.where(eq(branches.taleId, tale.id));
	const root = allBranches.find((branch) => branch.name === "main");
	if (!root) throw new Error("Root branch was not inserted.");

	await db
		.update(branches)
		.set({ parentBranchId: root.id })
		.where(
			and(
				eq(branches.taleId, tale.id),
				isNull(branches.parentBranchId),
				ne(branches.id, root.id),
			),
		);
	await db
		.update(branches)
		.set({ parentBranchId: null })
		.where(eq(branches.id, root.id));
	logSeedComplete("Branches");
}
