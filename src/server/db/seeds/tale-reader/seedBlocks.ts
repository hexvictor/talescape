import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { blocks, branches, pages, tales } from "~/server/db/schema";
import { userId1 } from "../ids";
import { createReaderBlockSeedConfig } from "./readerBlockSeedConfig";
import { readerPageBlueprints } from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

/**
 * Inserts route-aware blocks using actual page and branch database ids.
 *
 * @returns Nothing.
 */
export async function seedBlocks(): Promise<void> {
	logSeedStart("Blocks");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");

	const [allPages, allBranches] = await Promise.all([
		db
			.select({
				entryId: pages.entryId,
				id: pages.id,
				order: pages.order,
				partId: pages.partId,
				title: pages.title,
			})
			.from(pages)
			.where(eq(pages.taleId, tale.id)),
		db
			.select({ id: branches.id, name: branches.name })
			.from(branches)
			.where(eq(branches.taleId, tale.id)),
	]);
	const pageBlueprintByOrder = new Map(
		readerPageBlueprints.map((page) => [page.order, page]),
	);
	const branchByName = new Map(
		allBranches.map((branch) => [branch.name, branch]),
	);
	const values = allPages.flatMap((page) => {
		const blueprint = pageBlueprintByOrder.get(page.order);
		if (!blueprint) throw new Error(`Missing page blueprint ${page.order}.`);
		return blueprint.branchNames.map((branchName) => {
			const branch = branchByName.get(branchName);
			if (!branch) throw new Error(`Missing branch ${branchName}.`);
			const config = createReaderBlockSeedConfig(blueprint, branchName);
			return {
				branchId: branch.id,
				cloneable: "private" as const,
				creatorId: userId1,
				description: `${page.title ?? "Story page"} on ${branchName}.`,
				editable: true,
				entryId: page.entryId,
				isChoiceBlock: blueprint.isChoice,
				isOfficial: true,
				isVerified: true,
				order: page.order,
				pageId: page.id,
				pageOrder: blueprint.localOrder,
				partId: page.partId,
				taleId: tale.id,
				title: page.title ?? `Page ${page.order + 1}`,
				visibility: "public" as const,
				...config,
			};
		});
	});

	await db.insert(blocks).values(values);
	logSeedComplete("Blocks");
}
