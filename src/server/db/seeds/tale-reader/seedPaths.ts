import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { type PathSchema, branches, paths, tales } from "~/server/db/schema";

type PathSeed = Pick<
	PathSchema,
	| "taleId"
	| "fromBranchId"
	| "toBranchId"
	| "type"
	| "label"
	| "order"
	| "isOfficial"
	| "editable"
	| "visibility"
>;

export async function seedPaths() {
	const branchedTale = await db
		.select({
			id: tales.id,
			isOfficial: tales.isOfficial,
			editable: tales.editable,
			visibility: tales.visibility,
		})
		.from(tales)
		.where(eq(tales.slug, "official-tale-branched"))
		.limit(1);

	const tale = branchedTale[0];
	if (!tale) {
		console.log("⚠️ official-tale-branched not found, skipping paths.");
		return;
	}

	const taleBranches = await db
		.select({
			id: branches.id,
			name: branches.name,
			index: branches.index,
		})
		.from(branches)
		.where(eq(branches.taleId, tale.id));

	const branchByName = new Map(
		taleBranches.map((b) => [b.name, b.id] as const),
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
		console.log("⚠️ Branched tale branches not found, skipping paths.");
		return;
	}

	const seeds: PathSeed[] = [
		{
			taleId: tale.id,
			fromBranchId: beginning,
			toBranchId: first,
			type: "choice",
			label: "First Path",
			order: 0,
			isOfficial: tale.isOfficial,
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
			isOfficial: tale.isOfficial,
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
			isOfficial: tale.isOfficial,
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
			isOfficial: tale.isOfficial,
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
			isOfficial: tale.isOfficial,
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
			isOfficial: tale.isOfficial,
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
			isOfficial: tale.isOfficial,
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
			isOfficial: tale.isOfficial,
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
			isOfficial: tale.isOfficial,
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
			isOfficial: tale.isOfficial,
			editable: tale.editable,
			visibility: tale.visibility,
		},
	];

	await db.insert(paths).values(seeds);
	console.log(`✅ Seeded ${seeds.length} paths.`);
}
