import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { branches, paths, scenes, keyframes, tales } from "~/server/db/schema";
import { userId1 } from "../ids";
import { logSeedComplete, logSeedStart } from "./seedLogs";

type PathBlueprint = {
	description: string;
	fromBranch: string;
	fromSceneOrder: number;
	label: string;
	toBranch: string;
	toSceneOrder: number;
	type: "choice" | "return" | "teleport";
};

const authoredPaths: PathBlueprint[] = [
	choice("main", 4, "lantern", 5, "Follow the keeper's lantern"),
	choice("main", 4, "river", 6, "Follow the underground river"),
	choice("main", 4, "belfry", 7, "Climb into the empty belfry"),
	choice("lantern", 5, "lantern-vault", 5, "Open the sealed vault"),
	choice("lantern", 5, "lantern-choir", 5, "Follow the dust choir"),
	choice("river", 6, "river-gate", 6, "Raise the drowned gate"),
	choice("river", 6, "river-depths", 6, "Descend toward the names"),
	choice("belfry", 7, "belfry-bells", 7, "Enter the bell chamber"),
	choice("belfry", 7, "belfry-roof", 7, "Climb above the storm"),
	...returnPaths("lantern-vault", 8, "lantern", 5),
	...returnPaths("lantern-choir", 9, "lantern", 5),
	...returnPaths("river-gate", 10, "river", 6),
	...returnPaths("river-depths", 11, "river", 6),
	...returnPaths("belfry-bells", 12, "belfry", 7),
	...returnPaths("belfry-roof", 13, "belfry", 7),
];

export async function seedPaths(): Promise<void> {
	logSeedStart("Paths");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");

	const [allBranches, allScenes, allKeyframes] = await Promise.all([
		db
			.select({ id: branches.id, name: branches.name })
			.from(branches)
			.where(eq(branches.taleId, tale.id)),
		db
			.select({
				branchId: scenes.branchId,
				id: scenes.id,
				order: scenes.order,
			})
			.from(scenes)
			.where(eq(scenes.taleId, tale.id)),
		db
			.select({
				branchId: keyframes.branchId,
				id: keyframes.id,
				order: keyframes.order,
				sceneId: keyframes.sceneId,
			})
			.from(keyframes)
			.where(eq(keyframes.taleId, tale.id)),
	]);
	const branchByName = new Map(
		allBranches.map((branch) => [branch.name, branch]),
	);

	const values = authoredPaths.map((path, order) => {
		const fromBranch = requireBranch(branchByName, path.fromBranch);
		const toBranch = requireBranch(branchByName, path.toBranch);
		const fromScene = requireScene(
			allScenes,
			fromBranch.id,
			path.fromSceneOrder,
		);
		const toScene =
			path.toSceneOrder === path.fromSceneOrder &&
			path.type === "choice" &&
			toBranch.id !== fromBranch.id
				? fromScene
				: requireScene(allScenes, toBranch.id, path.toSceneOrder);
		const fromKeyframe = requireKeyframe(allKeyframes, fromScene.id, fromBranch.id, "last");
		const toKeyframe = requireKeyframe(
			allKeyframes,
			toScene.id,
			toBranch.id,
			path.type === "return" || path.type === "teleport" ? "last" : "first",
		);
		return {
			creatorId: userId1,
			description: path.description,
			editable: true,
			fromBranchId: fromBranch.id,
			fromSceneId: fromScene.id,
			fromKeyframeId: fromKeyframe.id,
			isOfficial: true,
			isVerified: true,
			label: path.label,
			order,
			taleId: tale.id,
			toBranchId: toBranch.id,
			toSceneId: toScene.id,
			toKeyframeId: toKeyframe.id,
			type: path.type,
			visibility: "public" as const,
		};
	});
	await db.insert(paths).values(values);
	logSeedComplete("Paths");
}

function choice(
	fromBranch: string,
	fromSceneOrder: number,
	toBranch: string,
	toSceneOrder: number,
	label: string,
): PathBlueprint {
	return {
		description: `${label}. This choice can replace later Keyframes in the current Scene.`,
		fromBranch,
		fromSceneOrder,
		label,
		toBranch,
		toSceneOrder,
		type: "choice",
	};
}

function returnPaths(
	fromBranch: string,
	fromSceneOrder: number,
	parentBranch: string,
	parentSceneOrder: number,
): PathBlueprint[] {
	return [
		{
			description: "Return to the most recent choice Keyframe.",
			fromBranch,
			fromSceneOrder,
			label: "Return to the recent choice",
			toBranch: parentBranch,
			toSceneOrder: parentSceneOrder,
			type: "return",
		},
		{
			description: "Revisit the first three-way choice without changing route.",
			fromBranch,
			fromSceneOrder,
			label: "Teleport to the first choice",
			toBranch: "main",
			toSceneOrder: 4,
			type: "teleport",
		},
	];
}

function requireBranch(
	branchByName: Map<string, { id: number; name: string }>,
	name: string,
): { id: number; name: string } {
	const branch = branchByName.get(name);
	if (!branch) throw new Error(`Missing Branch ${name}.`);
	return branch;
}

function requireScene(
	allScenes: Array<{ branchId: number; id: number; order: number }>,
	branchId: number,
	order: number,
): { branchId: number; id: number; order: number } {
	const scene = allScenes.find(
		(item) => item.branchId === branchId && item.order === order,
	);
	if (!scene) throw new Error(`Missing Scene ${branchId}:${order}.`);
	return scene;
}

function requireKeyframe(
	allKeyframes: Array<{
		branchId: number;
		id: number;
		order: number;
		sceneId: number;
	}>,
	sceneId: number,
	branchId: number,
	edge: "first" | "last",
): { id: number } {
	const candidates = allKeyframes
		.filter((step) => step.sceneId === sceneId && step.branchId === branchId)
		.sort((a, b) => a.order - b.order);
	const step = edge === "first" ? candidates[0] : candidates.at(-1);
	if (!step) throw new Error(`Missing ${edge} Keyframe ${sceneId}:${branchId}.`);
	return step;
}
