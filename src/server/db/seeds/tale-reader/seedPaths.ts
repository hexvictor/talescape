import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { blocks, branches, paths, tales } from "~/server/db/schema";
import { userId1 } from "../ids";
import { getReaderPageBlueprint } from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

type PathBlueprint = {
	description: string;
	fromBranch: string;
	fromEntryOrder: number;
	fromLocalPage?: number;
	label: string;
	toBranch: string;
	toEntryOrder: number;
	toLocalPage?: number;
	type: "choice" | "return" | "teleport";
};

const choicePaths: PathBlueprint[] = [
	choice("main", 4, "lantern", 5, "Follow the keeper's lantern"),
	choice("main", 4, "river", 7, "Follow the underground river"),
	choice("main", 4, "belfry", 9, "Climb into the empty belfry"),
	choice("lantern", 6, "lantern-vault", 11, "Open the sealed vault"),
	choice("lantern", 6, "lantern-choir", 12, "Follow the dust choir"),
	choice("river", 8, "river-gate", 13, "Raise the drowned gate"),
	choice("river", 8, "river-depths", 14, "Descend toward the names"),
	choice("belfry", 10, "belfry-bells", 15, "Enter the bell chamber"),
	choice("belfry", 10, "belfry-roof", 16, "Climb above the storm"),
];

const returnPaths: PathBlueprint[] = [
	...returns("lantern-vault", 11, 1, "lantern", 6),
	...returns("lantern-choir", 12, 1, "lantern", 6),
	...returns("river-gate", 13, 1, "river", 8),
	...returns("river-depths", 14, 1, "river", 8),
	...returns("belfry-bells", 15, 1, "belfry", 10),
	...returns("belfry-roof", 16, 1, "belfry", 10),
];

/**
 * Inserts nested choice and return paths using actual branch and block ids.
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
	const findBlock = (
		branchName: string,
		entryOrder: number,
		localPage = 0,
	): { branchId: number; blockId: number } => {
		const branch = branchByName.get(branchName);
		const page = getReaderPageBlueprint(entryOrder, localPage);
		const block = branch
			? allBlocks.find(
					(item) => item.branchId === branch.id && item.order === page.order,
				)
			: undefined;
		if (!branch || !block) {
			throw new Error(
				`Missing path endpoint ${branchName}:${entryOrder}:${localPage}.`,
			);
		}
		return { blockId: block.id, branchId: branch.id };
	};

	const values = [...choicePaths, ...returnPaths].map((path, order) => {
		const from = findBlock(
			path.fromBranch,
			path.fromEntryOrder,
			path.fromLocalPage,
		);
		const to = findBlock(path.toBranch, path.toEntryOrder, path.toLocalPage);
		return {
			creatorId: userId1,
			description: path.description,
			editable: true,
			fromBlockId: from.blockId,
			fromBranchId: from.branchId,
			isOfficial: true,
			isVerified: true,
			label: path.label,
			order,
			taleId: tale.id,
			toBlockId: to.blockId,
			toBranchId: to.branchId,
			type: path.type,
			visibility: "public" as const,
		};
	});

	await db.insert(paths).values(values);
	logSeedComplete("Paths");
}

/**
 * Creates one branch-selection path.
 *
 * @param fromBranch - Source branch name.
 * @param fromEntryOrder - Source choice entry order.
 * @param toBranch - Destination branch name.
 * @param toEntryOrder - Destination entry order.
 * @param label - Choice label.
 * @returns Choice path blueprint.
 */
function choice(
	fromBranch: string,
	fromEntryOrder: number,
	toBranch: string,
	toEntryOrder: number,
	label: string,
): PathBlueprint {
	return {
		description: `${label} through Thornwick.`,
		fromBranch,
		fromEntryOrder,
		label,
		toBranch,
		toEntryOrder,
		type: "choice",
	};
}

/**
 * Creates a branch-reset return and a route-preserving teleport.
 *
 * @param fromBranch - Source leaf branch.
 * @param fromEntryOrder - Source entry order.
 * @param fromLocalPage - Source page order.
 * @param parentBranch - Parent branch.
 * @param parentChoiceEntry - Parent choice entry order.
 * @returns Return path blueprints.
 */
function returns(
	fromBranch: string,
	fromEntryOrder: number,
	fromLocalPage: number,
	parentBranch: string,
	parentChoiceEntry: number,
): PathBlueprint[] {
	return [
		{
			description: "Return to the most recent fork.",
			fromBranch,
			fromEntryOrder,
			fromLocalPage,
			label: "Return to the recent choice",
			toBranch: parentBranch,
			toEntryOrder: parentChoiceEntry,
			type: "return",
		},
		{
			description: "Revisit Thornwick's first three-way choice.",
			fromBranch,
			fromEntryOrder,
			fromLocalPage,
			label: "Teleport to the first choice",
			toBranch: "main",
			toEntryOrder: 4,
			type: "teleport",
		},
	];
}
