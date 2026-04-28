import { db } from "~/server/db";
import {
	type SectionSchema,
	branches,
	sections,
	tales,
} from "~/server/db/schema";

type SectionSeed = Pick<
	SectionSchema,
	| "taleId"
	| "branchId"
	| "creatorId"
	| "orientation"
	| "direction"
	| "inputMode"
	| "isSnap"
	| "index"
	| "isOfficial"
	| "editable"
	| "visibility"
	| "cloneable"
>;

export async function seedSections() {
	const allTales = await db
		.select({
			id: tales.id,
			creatorId: tales.creatorId,
			isOfficial: tales.isOfficial,
			editable: tales.editable,
			visibility: tales.visibility,
			cloneable: tales.cloneable,
		})
		.from(tales);

	const allBranches = await db
		.select({
			id: branches.id,
			taleId: branches.taleId,
			name: branches.name,
			index: branches.index,
		})
		.from(branches);

	const branchesByTale = new Map<
		number,
		{ id: number; name: string; index: number }[]
	>();

	for (const branch of allBranches) {
		const existing = branchesByTale.get(branch.taleId) ?? [];
		existing.push({
			id: branch.id,
			name: branch.name,
			index: branch.index,
		});
		branchesByTale.set(branch.taleId, existing);
	}

	for (const entry of branchesByTale.values()) {
		entry.sort((a, b) => a.index - b.index);
	}

	const seeds: SectionSeed[] = [];

	for (const tale of allTales) {
		const taleBranches = branchesByTale.get(tale.id) ?? [];
		if (!taleBranches.length) continue;

		if (tale.id === 10) {
			const byName = new Map(taleBranches.map((b) => [b.name, b.id] as const));

			const sectionPlan = [
				{
					branchName: "Beginning",
					orientation: "vertical" as const,
					direction: "down" as const,
					index: 0,
				},
				{
					branchName: "First Path",
					orientation: "horizontal" as const,
					direction: "left" as const,
					index: 0,
				},
				{
					branchName: "Second Path",
					orientation: "vertical" as const,
					direction: "down" as const,
					index: 0,
				},
				{
					branchName: "Second Path",
					orientation: "horizontal" as const,
					direction: "right" as const,
					index: 1,
				},
				{
					branchName: "Third Path",
					orientation: "horizontal" as const,
					direction: "right" as const,
					index: 0,
				},
				{
					branchName: "Fourth Path",
					orientation: "horizontal" as const,
					direction: "right" as const,
					index: 0,
				},
				{
					branchName: "Fourth Path",
					orientation: "vertical" as const,
					direction: "down" as const,
					index: 1,
				},
				{
					branchName: "The Choice",
					orientation: "vertical" as const,
					direction: "down" as const,
					index: 0,
				},
				{
					branchName: "The Good Choice",
					orientation: "vertical" as const,
					direction: "down" as const,
					index: 0,
				},
				{
					branchName: "The Bad Choice",
					orientation: "horizontal" as const,
					direction: "right" as const,
					index: 0,
				},
				{
					branchName: "Ending",
					orientation: "vertical" as const,
					direction: "down" as const,
					index: 0,
				},
			];

			for (const plan of sectionPlan) {
				const branchId = byName.get(plan.branchName);
				if (!branchId) continue;

				seeds.push({
					taleId: tale.id,
					branchId,
					creatorId: tale.creatorId,
					orientation: plan.orientation,
					direction: plan.direction,
					inputMode: ["buttons", "keyboard", "touch"],
					isSnap: false,
					index: plan.index,
					isOfficial: tale.isOfficial,
					editable: tale.editable,
					visibility: tale.visibility,
					cloneable: tale.cloneable,
				});
			}

			continue;
		}

		const mainBranchId = taleBranches[0]?.id;
		if (!mainBranchId) continue;

		const sectionPlan = [
			{
				orientation: "vertical" as const,
				direction: "down" as const,
				index: 0,
			},
			{
				orientation: "horizontal" as const,
				direction: "right" as const,
				index: 1,
			},
			{
				orientation: "horizontal" as const,
				direction: "right" as const,
				index: 2,
			},
			{
				orientation: "vertical" as const,
				direction: "down" as const,
				index: 3,
			},
		];

		for (const plan of sectionPlan) {
			seeds.push({
				taleId: tale.id,
				branchId: mainBranchId,
				creatorId: tale.creatorId,
				orientation: plan.orientation,
				direction: plan.direction,
				inputMode: ["buttons", "keyboard", "touch"],
				isSnap: false,
				index: plan.index,
				isOfficial: tale.isOfficial,
				editable: tale.editable,
				visibility: tale.visibility,
				cloneable: tale.cloneable,
			});
		}
	}

	await db.insert(sections).values(seeds);
	console.log(`✅ Seeded ${seeds.length} sections.`);
}
