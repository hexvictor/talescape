import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { blocks, branches, paths, tales } from "~/server/db/schema";
import { userId1 } from "../ids";
import { choicePageOrder } from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

/**
 * Queries actual branch and block rows and inserts choice and return paths.
 *
 * @returns Nothing.
 */
export async function seedPaths(): Promise<void> {
	logSeedStart("Paths");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "official-tale-branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");
	const [allBranches, allBlocks] = await Promise.all([
		db
			.select({ id: branches.id, name: branches.name })
			.from(branches)
			.where(eq(branches.taleId, tale.id)),
		db
			.select({
				branchId: blocks.branchId,
				id: blocks.id,
				order: blocks.order,
			})
			.from(blocks)
			.where(eq(blocks.taleId, tale.id)),
	]);
	const branchByName = new Map(
		allBranches.map((branch) => [branch.name, branch]),
	);
	const root = branchByName.get("main");
	const lantern = branchByName.get("lantern");
	const river = branchByName.get("river");
	if (!root || !lantern || !river)
		throw new Error("Reader branches are missing.");
	const findBlock = (branchId: number, order: number): number => {
		const block = allBlocks.find(
			(item) => item.branchId === branchId && item.order === order,
		);
		if (!block) {
			throw new Error(`Missing block ${order} in branch ${branchId}.`);
		}
		return block.id;
	};
	const choiceBlockId = findBlock(root.id, choicePageOrder);
	const firstRouteOrder = choicePageOrder + 1;

	await db.insert(paths).values([
		{
			creatorId: userId1,
			description: "Follow the keeper's lantern into the buried nave.",
			editable: true,
			fromBlockId: choiceBlockId,
			fromBranchId: root.id,
			isOfficial: true,
			isVerified: true,
			label: "Follow the lantern",
			order: 0,
			taleId: tale.id,
			toBlockId: findBlock(lantern.id, firstRouteOrder),
			toBranchId: lantern.id,
			type: "choice",
			visibility: "public",
		},
		{
			creatorId: userId1,
			description: "Follow the underground river toward the old gate.",
			editable: true,
			fromBlockId: choiceBlockId,
			fromBranchId: root.id,
			isOfficial: true,
			isVerified: true,
			label: "Follow the river",
			order: 1,
			taleId: tale.id,
			toBlockId: findBlock(river.id, firstRouteOrder),
			toBranchId: river.id,
			type: "choice",
			visibility: "public",
		},
		{
			creatorId: userId1,
			description: "Return to an earlier lantern-route page.",
			editable: true,
			fromBlockId: findBlock(lantern.id, choicePageOrder + 9),
			fromBranchId: lantern.id,
			isOfficial: true,
			isVerified: true,
			label: "Return to the ledger",
			order: 2,
			taleId: tale.id,
			toBlockId: findBlock(lantern.id, choicePageOrder + 3),
			toBranchId: lantern.id,
			type: "return",
			visibility: "public",
		},
		{
			creatorId: userId1,
			description: "Return to an earlier river-route page.",
			editable: true,
			fromBlockId: findBlock(river.id, choicePageOrder + 9),
			fromBranchId: river.id,
			isOfficial: true,
			isVerified: true,
			label: "Return to the river gate",
			order: 3,
			taleId: tale.id,
			toBlockId: findBlock(river.id, choicePageOrder + 3),
			toBranchId: river.id,
			type: "return",
			visibility: "public",
		},
	]);
	logSeedComplete("Paths");
}
