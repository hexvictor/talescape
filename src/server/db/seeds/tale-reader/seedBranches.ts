import { db } from "~/server/db";
import { type BranchSchema, branches, tales } from "~/server/db/schema";

type BranchSeed = Pick<
	BranchSchema,
	| "taleId"
	| "creatorId"
	| "name"
	| "index"
	| "isOfficial"
	| "isVerified"
	| "editable"
	| "visibility"
	| "cloneable"
>;

export async function seedBranches() {
	const allTales = await db
		.select({
			id: tales.id,
			creatorId: tales.creatorId,
			isOfficial: tales.isOfficial,
			isVerified: tales.isVerified,
			editable: tales.editable,
			visibility: tales.visibility,
			cloneable: tales.cloneable,
		})
		.from(tales);

	const seeds: BranchSeed[] = allTales.flatMap((tale) => {
		if (tale.id === 10) {
			return [
				{
					taleId: tale.id,
					creatorId: tale.creatorId,
					name: "Beginning",
					index: 0,
					isOfficial: tale.isOfficial,
					isVerified: tale.isVerified,
					editable: tale.editable,
					visibility: tale.visibility,
					cloneable: tale.cloneable,
				},
				{
					taleId: tale.id,
					creatorId: tale.creatorId,
					name: "First Path",
					index: 1,
					isOfficial: tale.isOfficial,
					isVerified: tale.isVerified,
					editable: tale.editable,
					visibility: tale.visibility,
					cloneable: tale.cloneable,
				},
				{
					taleId: tale.id,
					creatorId: tale.creatorId,
					name: "Second Path",
					index: 2,
					isOfficial: tale.isOfficial,
					isVerified: tale.isVerified,
					editable: tale.editable,
					visibility: tale.visibility,
					cloneable: tale.cloneable,
				},
				{
					taleId: tale.id,
					creatorId: tale.creatorId,
					name: "Third Path",
					index: 3,
					isOfficial: tale.isOfficial,
					isVerified: tale.isVerified,
					editable: tale.editable,
					visibility: tale.visibility,
					cloneable: tale.cloneable,
				},
				{
					taleId: tale.id,
					creatorId: tale.creatorId,
					name: "Fourth Path",
					index: 4,
					isOfficial: tale.isOfficial,
					isVerified: tale.isVerified,
					editable: tale.editable,
					visibility: tale.visibility,
					cloneable: tale.cloneable,
				},
				{
					taleId: tale.id,
					creatorId: tale.creatorId,
					name: "The Choice",
					index: 5,
					isOfficial: tale.isOfficial,
					isVerified: tale.isVerified,
					editable: tale.editable,
					visibility: tale.visibility,
					cloneable: tale.cloneable,
				},
				{
					taleId: tale.id,
					creatorId: tale.creatorId,
					name: "The Good Choice",
					index: 6,
					isOfficial: tale.isOfficial,
					isVerified: tale.isVerified,
					editable: tale.editable,
					visibility: tale.visibility,
					cloneable: tale.cloneable,
				},
				{
					taleId: tale.id,
					creatorId: tale.creatorId,
					name: "The Bad Choice",
					index: 7,
					isOfficial: tale.isOfficial,
					isVerified: tale.isVerified,
					editable: tale.editable,
					visibility: tale.visibility,
					cloneable: tale.cloneable,
				},
				{
					taleId: tale.id,
					creatorId: tale.creatorId,
					name: "Ending",
					index: 8,
					isOfficial: tale.isOfficial,
					isVerified: tale.isVerified,
					editable: tale.editable,
					visibility: tale.visibility,
					cloneable: tale.cloneable,
				},
			];
		}

		return [
			{
				taleId: tale.id,
				creatorId: tale.creatorId,
				name: "Main",
				index: 0,
				isOfficial: tale.isOfficial,
				isVerified: tale.isVerified,
				editable: tale.editable,
				visibility: tale.visibility,
				cloneable: tale.cloneable,
			},
		];
	});

	await db.insert(branches).values(seeds);
	console.log(`✅ Seeded ${seeds.length} branches.`);
}
