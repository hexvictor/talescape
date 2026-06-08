import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { blocks, branches, pages, tales } from "~/server/db/schema";
import { userId1 } from "../ids";
import { createReaderBlockSeedConfig } from "./readerBlockSeedConfig";
import { choicePageOrder, readerPageBlueprints } from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

/**
 * Queries real pages and branches and inserts route-aware reader blocks.
 *
 * @returns Nothing.
 */
export async function seedBlocks(): Promise<void> {
	logSeedStart("Blocks");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "official-tale-branched"));
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
			.select({
				id: branches.id,
				name: branches.name,
				order: branches.order,
			})
			.from(branches)
			.where(eq(branches.taleId, tale.id)),
	]);
	const pageBlueprintByOrder = new Map(
		readerPageBlueprints.map((page) => [page.order, page]),
	);
	const rootBranch = allBranches.find((branch) => branch.name === "main");
	const routeBranches = allBranches.filter((branch) => branch.name !== "main");
	if (!rootBranch || routeBranches.length !== 2) {
		throw new Error("Expected one root branch and two choice branches.");
	}

	const values = allPages.flatMap((page) => {
		const pageBlueprint = pageBlueprintByOrder.get(page.order);
		if (!pageBlueprint)
			throw new Error(`Missing page blueprint ${page.order}.`);
		const targetBranches =
			page.order <= choicePageOrder ? [rootBranch] : routeBranches;
		return targetBranches.map((branch) => {
			const config = createReaderBlockSeedConfig(pageBlueprint, branch.name);
			return {
				branchId: branch.id,
				cloneable: "private" as const,
				creatorId: userId1,
				description: `${page.title ?? "Story page"} on ${branch.name}.`,
				editable: true,
				entryId: page.entryId,
				isChoiceBlock: page.order === choicePageOrder,
				isOfficial: true,
				isSnap: page.order % 4 === 0,
				isVerified: true,
				order: page.order,
				pageId: page.id,
				pageOrder: 0,
				partId: page.partId,
				taleId: tale.id,
				title:
					branch.name === "main"
						? (page.title ?? `Page ${page.order + 1}`)
						: `${page.title ?? `Page ${page.order + 1}`} · ${branch.name}`,
				visibility: "public" as const,
				...config,
			};
		});
	});

	await db.insert(blocks).values(values);
	logSeedComplete("Blocks");
}
