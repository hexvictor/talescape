import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
	branches,
	frames,
	keyframes,
	pages,
	scenes,
	tales,
} from "~/server/db/schema";
import type {
	KeyframeActionConfig,
	ReadingConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { userId1 } from "../ids";
import {
	type ReaderSceneBlueprint,
	readerSceneBlueprints,
} from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

type SceneRow = {
	branchId: number;
	id: number;
	order: number;
};

type FrameRow = {
	id: number;
	name: string | null;
	sceneId: number;
};

export async function seedKeyframes(): Promise<void> {
	logSeedStart("Keyframes");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");

	const [allBranches, allFrames, allPages, allScenes] = await Promise.all([
		db
			.select({
				id: branches.id,
				name: branches.name,
				parentBranchId: branches.parentBranchId,
			})
			.from(branches)
			.where(eq(branches.taleId, tale.id)),
		db
			.select({ id: frames.id, name: frames.name, sceneId: frames.sceneId })
			.from(frames)
			.where(eq(frames.taleId, tale.id)),
		db
			.select({ id: pages.id, order: pages.order })
			.from(pages)
			.where(eq(pages.taleId, tale.id)),
		db
			.select({
				branchId: scenes.branchId,
				id: scenes.id,
				order: scenes.order,
			})
			.from(scenes)
			.where(eq(scenes.taleId, tale.id)),
	]);

	const branchesByParentId = groupBy(
		allBranches.filter((branch) => branch.parentBranchId !== null),
		(branch) => branch.parentBranchId as number,
	);
	const framesBySceneId = groupBy(allFrames, (frame) => frame.sceneId);
	const pageIdByOrder = new Map(allPages.map((page) => [page.order, page.id]));
	const blueprintByOrder = new Map(
		readerSceneBlueprints.map((blueprint) => [blueprint.order, blueprint]),
	);

	const values = allScenes.flatMap((scene) => {
		const blueprint = blueprintByOrder.get(scene.order);
		if (!blueprint) throw new Error(`Missing Scene blueprint ${scene.order}.`);
		return createSceneKeyframes({
			blueprint,
			childBranches: branchesByParentId.get(scene.branchId) ?? [],
			frames: framesBySceneId.get(scene.id) ?? [],
			pageIdByOrder,
			scene,
			taleId: tale.id,
		});
	});
	await db.insert(keyframes).values(values);
	logSeedComplete("Keyframes");
}

function createSceneKeyframes(input: {
	blueprint: ReaderSceneBlueprint;
	childBranches: Array<{ id: number; name: string }>;
	frames: FrameRow[];
	pageIdByOrder: Map<number, number>;
	scene: SceneRow;
	taleId: number;
}): Array<typeof keyframes.$inferInsert> {
	const { blueprint, childBranches, frames, pageIdByOrder, scene, taleId } =
		input;
	const childFrames = frames.sort((a, b) => a.id - b.id);
	if (childFrames.length === 0)
		throw new Error(`Scene ${scene.id} has no Frame.`);

	if (blueprint.layout === "branch-comic") {
		const storyFrame = childFrames.find((frame) => frame.name === "story");
		const choiceFrame = childFrames.find((frame) => frame.name === "choice");
		const routeFrames = childFrames.filter((frame) =>
			frame.name?.startsWith("route-"),
		);
		if (!storyFrame || !choiceFrame || routeFrames.length !== 2) {
			throw new Error(`Branch Scene ${scene.id} has incomplete Frames.`);
		}
		const common = [
			stepInsert({
				actions: [hide(choiceFrame), ...routeFrames.map(hide)],
				branchId: scene.branchId,
				description: "The shared opening state before the choice.",
				frameId: storyFrame.id,
				order: 0,
				pageId: requirePageId(pageIdByOrder, blueprint.pageOrders[0]),
				readingConfig: readingConfig(420, 46),
				sceneId: scene.id,
				taleId,
				title: `${blueprint.title}: arrival`,
			}),
			stepInsert({
				actions: [show(choiceFrame)],
				branchId: scene.branchId,
				description: "A choice appears inside the current Scene.",
				frameId: choiceFrame.id,
				order: 1,
				pageId: requirePageId(pageIdByOrder, blueprint.pageOrders.at(-1)),
				readingConfig: readingConfig(360, 42, 0.35),
				sceneId: scene.id,
				taleId,
				title: `${blueprint.title}: choose`,
			}),
		];
		const routeKeyframes = childBranches
			.sort((a, b) => a.id - b.id)
			.slice(0, 2)
			.map((branch, index) =>
				stepInsert({
					actions: routeFrames.flatMap((frame, frameIndex) => [
						frameIndex === index ? show(frame) : hide(frame),
						hide(choiceFrame),
					]),
					branchId: branch.id,
					description: `The ${branch.name} route changes later Frames in this Scene.`,
					frameId: routeFrames[index]?.id ?? null,
					order: index + 2,
					pageId: requirePageId(pageIdByOrder, blueprint.pageOrders[1]),
					readingConfig: readingConfig(520, index === 0 ? 34 : 66, 0.55),
					sceneId: scene.id,
					taleId,
					title: `${blueprint.title}: ${branch.name}`,
				}),
			);
		return [...common, ...routeKeyframes];
	}

	const targetFrames =
		blueprint.layout === "choice-grid"
			? childFrames.filter((frame) => frame.name !== "quote")
			: childFrames.length > 0
				? childFrames
				: childFrames;
	const authoredKeyframes = blueprint.pageOrders.map((pageOrder, index) =>
		stepInsert({
			actions:
				childFrames.length === 0
					? []
					: [
							...(index === 0 ? childFrames.slice(1).map(hide) : []),
							...(targetFrames[index] ? [show(targetFrames[index])] : []),
						],
			branchId: scene.branchId,
			description: `Keyframe ${index + 1} inside ${blueprint.title}.`,
			frameId: targetFrames[index]?.id ?? childFrames[0]?.id ?? null,
			order: index,
			pageId: requirePageId(pageIdByOrder, pageOrder),
			readingConfig: readingConfig(
				blueprint.layout.startsWith("single") ? 680 : 320,
				blueprint.layout === "single-horizontal"
					? 38
					: blueprint.layout === "single-vertical"
						? 30
						: 52,
				index === 0 ? 0.25 : 0,
			),
			sceneId: scene.id,
			taleId,
			title: `${blueprint.title}: ${index + 1}`,
		}),
	);
	if (blueprint.layout !== "choice-grid") return authoredKeyframes;

	const quoteFrame = childFrames.find((frame) => frame.name === "quote");
	if (!quoteFrame)
		throw new Error(`Choice Scene ${scene.id} has no quote Frame.`);
	const choiceIndex = authoredKeyframes.length - 1;
	return [
		...authoredKeyframes.slice(0, choiceIndex),
		stepInsert({
			actions: [show(quoteFrame)],
			branchId: scene.branchId,
			description:
				"A non-page quote Frame between the map and the route choice.",
			frameId: quoteFrame.id,
			order: choiceIndex,
			pageId: null,
			readingConfig: readingConfig(260, 44, 0.4),
			sceneId: scene.id,
			taleId,
			title: `${blueprint.title}: whispered warning`,
		}),
		...authoredKeyframes.slice(choiceIndex).map((step) => ({
			...step,
			order: step.order + 1,
		})),
	];
}

function stepInsert(input: {
	actions: KeyframeActionConfig[];
	branchId: number;
	description: string;
	frameId: number | null;
	order: number;
	pageId: number | null;
	readingConfig: ReadingConfig;
	sceneId: number;
	taleId: number;
	title: string;
}): typeof keyframes.$inferInsert {
	return {
		...input,
		creatorId: userId1,
		snapConfig: { mode: "scroll-snap", strategy: "shared" },
	};
}

function readingConfig(
	activeLength: number,
	autoplaySpeed: number,
	pauseAfterIntroSeconds = 0,
): ReadingConfig {
	return {
		animationConfig: {
			ambient: { tracks: [] },
			active: { tracks: [] },
		},
		autoplay: {
			enabled: true,
			introSpeed: null,
			outroSpeed: null,
			pauseAfterIntroSeconds,
			pauseBeforeOutroSeconds: 0,
			activeSpeed: autoplaySpeed,
		},
		pauses: { atEnd: 0, atStart: 0 },
		activeLength,
		activeLengthMode: "manual",
		transition: { introLength: 180, outroLength: 140 },
	};
}

function hide(frame: FrameRow): KeyframeActionConfig {
	return {
		id: `hide-frame-${frame.id}`,
		targetId: String(frame.id),
		targetType: "frame",
		type: "hide",
	};
}

function show(frame: FrameRow): KeyframeActionConfig {
	return {
		animation: {
			tracks: [
				{ end: 1, from: 0, property: "opacity", start: 0, to: 1 },
				{ end: 1, from: 0.96, property: "scale", start: 0, to: 1 },
			],
		},
		id: `show-frame-${frame.id}`,
		targetId: String(frame.id),
		targetType: "frame",
		type: "show",
	};
}

function requirePageId(
	pageIdByOrder: Map<number, number>,
	order: number | undefined,
): number {
	const pageId = order === undefined ? undefined : pageIdByOrder.get(order);
	if (!pageId) throw new Error(`Missing Page for order ${order ?? "unknown"}.`);
	return pageId;
}

function groupBy<Row, Key>(
	rows: Row[],
	getKey: (row: Row) => Key,
): Map<Key, Row[]> {
	const groups = new Map<Key, Row[]>();
	for (const row of rows) {
		const key = getKey(row);
		groups.set(key, [...(groups.get(key) ?? []), row]);
	}
	return groups;
}
