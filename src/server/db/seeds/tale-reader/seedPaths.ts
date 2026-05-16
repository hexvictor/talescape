import { db } from "~/server/db";
import { type PathSchema, branches, paths, tales } from "~/server/db/schema";
import { isBranchedTaleSlug } from "./branchedTales";

type PathSeed = Pick<
	PathSchema,
	| "taleId"
	| "fromBranchId"
	| "toBranchId"
	| "type"
	| "label"
	| "order"
	| "creatorId"
	| "isOfficial"
	| "isVerified"
	| "editable"
	| "visibility"
>;

export async function seedPaths() {
	const allTales = await db
		.select({
			id: tales.id,
			slug: tales.slug,
			creatorId: tales.creatorId,
			isOfficial: tales.isOfficial,
			isVerified: tales.isVerified,
			editable: tales.editable,
			visibility: tales.visibility,
		})
		.from(tales);
	const branchedTales = allTales.filter((tale) =>
		isBranchedTaleSlug(tale.slug),
	);

	if (!branchedTales.length) {
		console.log("⚠️ Branched tales not found, skipping paths.");
		return;
	}

	const allBranches = await db
		.select({
			id: branches.id,
			taleId: branches.taleId,
			name: branches.name,
			index: branches.index,
		})
		.from(branches);

	const branchesByTaleId = new Map<number, typeof allBranches>();
	for (const branch of allBranches) {
		const existing = branchesByTaleId.get(branch.taleId) ?? [];
		existing.push(branch);
		branchesByTaleId.set(branch.taleId, existing);
	}

	const seeds: PathSeed[] = [];

	for (const tale of branchedTales) {
		const taleBranches = branchesByTaleId.get(tale.id) ?? [];
		const branchByName = new Map(
			taleBranches.map((branch) => [branch.name, branch.id] as const),
		);

		const beginning = branchByName.get("Beginning");
		const first = branchByName.get("First Path");
		const second = branchByName.get("Second Path");
		const third = branchByName.get("Third Path");
		const fourth = branchByName.get("Fourth Path");
		const choice = branchByName.get("The Choice");
		const good = branchByName.get("The Good Choice");
		const bad = branchByName.get("The Bad Choice");
		const ending = branchByName.get("Ending");

		if (
			!beginning ||
			!first ||
			!second ||
			!third ||
			!fourth ||
			!choice ||
			!good ||
			!bad ||
			!ending
		) {
			console.log(`⚠️ Branches not found for ${tale.slug}, skipping paths.`);
			continue;
		}

		seeds.push(
			{
				taleId: tale.id,
				fromBranchId: beginning,
				toBranchId: first,
				type: "choice",
				label: "First Path",
				order: 0,
				creatorId: tale.creatorId,
				isOfficial: tale.isOfficial,
				isVerified: tale.isVerified,
				editable: tale.editable,
				visibility: tale.visibility,
			},
			{
				taleId: tale.id,
				fromBranchId: beginning,
				toBranchId: second,
				type: "choice",
				label: "Second Path",
				order: 1,
				creatorId: tale.creatorId,
				isOfficial: tale.isOfficial,
				isVerified: tale.isVerified,
				editable: tale.editable,
				visibility: tale.visibility,
			},
			{
				taleId: tale.id,
				fromBranchId: beginning,
				toBranchId: third,
				type: "choice",
				label: "Third Path",
				order: 2,
				creatorId: tale.creatorId,
				isOfficial: tale.isOfficial,
				isVerified: tale.isVerified,
				editable: tale.editable,
				visibility: tale.visibility,
			},
			{
				taleId: tale.id,
				fromBranchId: beginning,
				toBranchId: fourth,
				type: "choice",
				label: "Fourth Path",
				order: 3,
				creatorId: tale.creatorId,
				isOfficial: tale.isOfficial,
				isVerified: tale.isVerified,
				editable: tale.editable,
				visibility: tale.visibility,
			},
			{
				taleId: tale.id,
				fromBranchId: first,
				toBranchId: ending,
				type: "auto",
				label: null,
				order: 0,
				creatorId: tale.creatorId,
				isOfficial: tale.isOfficial,
				isVerified: tale.isVerified,
				editable: tale.editable,
				visibility: tale.visibility,
			},
			{
				taleId: tale.id,
				fromBranchId: third,
				toBranchId: ending,
				type: "auto",
				label: null,
				order: 0,
				creatorId: tale.creatorId,
				isOfficial: tale.isOfficial,
				isVerified: tale.isVerified,
				editable: tale.editable,
				visibility: tale.visibility,
			},
			{
				taleId: tale.id,
				fromBranchId: fourth,
				toBranchId: choice,
				type: "auto",
				label: null,
				order: 0,
				creatorId: tale.creatorId,
				isOfficial: tale.isOfficial,
				isVerified: tale.isVerified,
				editable: tale.editable,
				visibility: tale.visibility,
			},
			{
				taleId: tale.id,
				fromBranchId: choice,
				toBranchId: good,
				type: "choice",
				label: "The Good Choice",
				order: 0,
				creatorId: tale.creatorId,
				isOfficial: tale.isOfficial,
				isVerified: tale.isVerified,
				editable: tale.editable,
				visibility: tale.visibility,
			},
			{
				taleId: tale.id,
				fromBranchId: choice,
				toBranchId: bad,
				type: "choice",
				label: "The Bad Choice",
				order: 1,
				creatorId: tale.creatorId,
				isOfficial: tale.isOfficial,
				isVerified: tale.isVerified,
				editable: tale.editable,
				visibility: tale.visibility,
			},
			{
				taleId: tale.id,
				fromBranchId: bad,
				toBranchId: ending,
				type: "auto",
				label: null,
				order: 0,
				creatorId: tale.creatorId,
				isOfficial: tale.isOfficial,
				isVerified: tale.isVerified,
				editable: tale.editable,
				visibility: tale.visibility,
			},
		);
	}

	if (!seeds.length) {
		console.log("⚠️ No branched tale paths generated.");
		return;
	}

	await db.insert(paths).values(seeds);
	console.log(`✅ Seeded ${seeds.length} paths.`);
}
