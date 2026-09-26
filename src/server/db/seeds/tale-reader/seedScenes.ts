import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { branches, pages, scenes, tales } from "~/server/db/schema";
import { userId1 } from "../ids";
import { createReaderSceneSeedConfig } from "./readerSceneSeedConfig";
import { readerSceneBlueprints } from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

/**
 * Inserts route-aware scenes using actual page and branch database ids.
 *
 * @returns Nothing.
 */
export async function seedScenes(): Promise<void> {
	logSeedStart("Scenes");
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
	const pageByOrder = new Map(allPages.map((page) => [page.order, page]));
	const branchByName = new Map(
		allBranches.map((branch) => [branch.name, branch]),
	);
	const values = readerSceneBlueprints.map((blueprint) => {
		const branch = branchByName.get(blueprint.branchName);
		const firstPage = pageByOrder.get(blueprint.pageOrders[0] ?? -1);
		if (!branch || !firstPage) {
			throw new Error(`Missing Scene parents for ${blueprint.title}.`);
		}
		return {
			branchId: branch.id,
			cloneable: "private" as const,
			creatorId: userId1,
			description: blueprint.description,
			editable: true,
			isChoiceScene: blueprint.isChoice,
			isOfficial: true,
			isVerified: true,
			order: blueprint.order,
			pageOrder: 0,
			taleId: tale.id,
			title: blueprint.title,
			visibility: "public" as const,
			...createReaderSceneSeedConfig(blueprint, blueprint.branchName),
		};
	});

	await db.insert(scenes).values(values);
	logSeedComplete("Scenes");
}
