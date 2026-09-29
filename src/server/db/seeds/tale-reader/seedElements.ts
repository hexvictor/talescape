import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
	elements,
	frames,
	keyframes,
	paths,
	scenes,
	tales,
} from "~/server/db/schema";
import type {
	ElementAnimationConfig,
	KeyframeActionConfig,
	ReaderStyleConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { userId1 } from "../ids";
import {
	type ReaderSceneBlueprint,
	readerSceneBlueprints,
} from "./readerStoryBlueprint";
import { createReaderStoryExcerpt } from "./readerStoryText";
import { logSeedComplete, logSeedStart } from "./seedLogs";

const sceneImages = [
	"/assets/site/ember-city-light.png",
	"/assets/site/moonless-harbor.png",
	"/assets/site/last-starbound.png",
	"/assets/site/crown-of-ash.png",
	"/reader-demo/thornwick-crypt.svg",
	"/reader-demo/thornwick-woods.svg",
] as const;

type FrameRow = {
	config: typeof frames.$inferSelect.config;
	id: number;
	name: string | null;
	sceneId: number;
};

type PathRow = {
	fromSceneId: number | null;
	id: number;
	label: string | null;
	type: string;
};

export async function seedElements(): Promise<void> {
	logSeedStart("Elements");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");

	const [allFrames, allPaths, allScenes] = await Promise.all([
		db
			.select({
				config: frames.config,
				id: frames.id,
				name: frames.name,
				sceneId: frames.sceneId,
			})
			.from(frames)
			.where(eq(frames.taleId, tale.id)),
		db
			.select({
				fromSceneId: paths.fromSceneId,
				id: paths.id,
				label: paths.label,
				type: paths.type,
			})
			.from(paths)
			.where(eq(paths.taleId, tale.id)),
		db
			.select({ id: scenes.id, order: scenes.order })
			.from(scenes)
			.where(eq(scenes.taleId, tale.id)),
	]);
	const blueprintByOrder = new Map(
		readerSceneBlueprints.map((blueprint) => [blueprint.order, blueprint]),
	);
	const framesByScene = groupBy(allFrames, (frame) => frame.sceneId);
	const pathsByScene = groupBy(
		allPaths.filter((path) => path.fromSceneId !== null),
		(path) => path.fromSceneId as number,
	);

	for (const scene of allScenes.sort((a, b) => a.order - b.order)) {
		const blueprint = blueprintByOrder.get(scene.order);
		if (!blueprint) throw new Error(`Missing Scene blueprint ${scene.order}.`);
		const sceneFrames = (framesByScene.get(scene.id) ?? []).sort(
			(a, b) => a.id - b.id,
		);
		const values = createSceneElements({
			blueprint,
			frames: sceneFrames,
			paths: pathsByScene.get(scene.id) ?? [],
			sceneId: scene.id,
			taleId: tale.id,
		});
		const created = await db.insert(elements).values(values).returning({
			frameId: elements.frameId,
			id: elements.id,
			order: elements.order,
			placementConfig: elements.placementConfig,
		});
		for (const frame of sceneFrames) {
			const frameElements = created.filter(
				(element) => element.frameId === frame.id,
			);
			const children = frameElements
				.filter((element) => element.placementConfig.mode === "normal")
				.map((element) => ({
					elementId: String(element.id),
					type: "element" as const,
				}));
			if (frameElements.length === 0) continue;
			const defaultElementStates: Record<string, "active" | "inactive"> =
				Object.fromEntries(
					frameElements.map((element) => [
						String(element.id),
						element.order === 0 ? "active" : "inactive",
					]),
				);
			await db
				.update(frames)
				.set({
					config: {
						...frame.config,
						defaultElementStates: {
							...(frame.config.defaultElementStates ?? {}),
							...defaultElementStates,
						},
						children: [...frame.config.children, ...children],
					},
				})
				.where(eq(frames.id, frame.id));
		}
	}
	await seedKeyframeElementActions(tale.id);
	logSeedComplete("Elements");
}

async function seedKeyframeElementActions(taleId: number): Promise<void> {
	const [allElements, allKeyframes] = await Promise.all([
		db
			.select({
				frameId: elements.frameId,
				id: elements.id,
				order: elements.order,
				type: elements.type,
			})
			.from(elements)
			.where(eq(elements.taleId, taleId)),
		db
			.select({
				actions: keyframes.actions,
				frameId: keyframes.frameId,
				id: keyframes.id,
				order: keyframes.order,
			})
			.from(keyframes)
			.where(eq(keyframes.taleId, taleId)),
	]);
	const elementsByFrameId = groupBy(
		allElements.filter((element) => element.frameId !== null),
		(element) => element.frameId as number,
	);
	const keyframesByFrameId = groupBy(
		allKeyframes.filter((keyframe) => keyframe.frameId !== null),
		(keyframe) => keyframe.frameId as number,
	);
	for (const [frameId, frameKeyframes] of keyframesByFrameId) {
		const frameElements = (elementsByFrameId.get(frameId) ?? []).sort(
			(left, right) => left.order - right.order,
		);
		const orderedKeyframes = frameKeyframes.sort(
			(left, right) => left.order - right.order,
		);
		for (const [index, keyframe] of orderedKeyframes.entries()) {
			const actions: KeyframeActionConfig[] = [
				...(keyframe.actions ?? []),
				...frameElements.map((element) =>
					getSeededElementAction(element, keyframe.id, index),
				),
			];
			await db
				.update(keyframes)
				.set({ actions })
				.where(eq(keyframes.id, keyframe.id));
		}
	}
}

function getSeededElementAction(
	element: { id: number; order: number; type: string },
	keyframeId: number,
	keyframeIndex: number,
): KeyframeActionConfig {
	const targetId = String(element.id);
	if (element.type === "audio" || element.type === "soundCue") {
		return {
			id: `keyframe-${keyframeId}-audio-${targetId}`,
			targetId,
			targetType: "element",
			type: keyframeIndex === 0 ? "play" : "continue",
		};
	}
	if (keyframeIndex === 0 && element.order > 1) {
		return {
			id: `keyframe-${keyframeId}-inactive-${targetId}`,
			targetId,
			targetType: "element",
			type: "inactive",
		};
	}
	if (element.order === 0 || element.order < keyframeIndex + 1) {
		return {
			id: `keyframe-${keyframeId}-active-${targetId}`,
			targetId,
			targetType: "element",
			type: "active",
		};
	}
	return {
		animation: {
			applyInitialStateBeforeStart: true,
			carryEndStateForward: true,
			tracks: [
				{ end: 1, from: 0, property: "opacity", start: 0, to: 1 },
				{
					axis: "y",
					end: 1,
					from: 24,
					property: "translate",
					start: 0,
					to: 0,
					unit: "px",
				},
			],
		},
		id: `keyframe-${keyframeId}-intro-${targetId}`,
		targetId,
		targetType: "element",
		type: "intro",
	};
}

function createSceneElements(input: {
	blueprint: ReaderSceneBlueprint;
	frames: FrameRow[];
	paths: PathRow[];
	sceneId: number;
	taleId: number;
}): Array<typeof elements.$inferInsert> {
	const { blueprint, frames, paths, sceneId, taleId } = input;
	const targets = frames.sort((left, right) => left.id - right.id);
	if (targets.length === 0) throw new Error(`Scene ${sceneId} has no Frame.`);
	const values = targets.flatMap((frame, index) =>
		createFrameElements({
			blueprint,
			frame,
			frameIndex: index,
			paths:
				frame.name === "choice" || index === targets.length - 1 ? paths : [],
			sceneId,
			taleId,
		}),
	);

	const audio = createAudioElement(
		blueprint,
		targets[0]?.id ?? 0,
		sceneId,
		taleId,
	);
	const cue = createOneShotAudioElement(
		blueprint,
		targets[0]?.id ?? 0,
		sceneId,
		taleId,
	);
	return [...values, ...(audio ? [audio] : []), ...(cue ? [cue] : [])];
}

function createFrameElements(input: {
	blueprint: ReaderSceneBlueprint;
	frame: FrameRow;
	frameIndex: number;
	paths: PathRow[];
	sceneId: number;
	taleId: number;
}): Array<typeof elements.$inferInsert> {
	const { blueprint, frame, frameIndex, paths, sceneId, taleId } = input;
	const base = elementBase(sceneId, taleId);
	const role = frame.name ?? "Frame";
	const title = role.startsWith("route-")
		? `${blueprint.title}: ${role === "route-a" ? "first path" : "second path"}`
		: frameIndex === 0
			? blueprint.title
			: `${blueprint.title} · Frame ${frameIndex + 1}`;
	const oversized = blueprint.order === 1 || blueprint.order === 3;
	const elementsForFrame: Array<typeof elements.$inferInsert> = [
		textElement(
			base,
			frame.id,
			title,
			0,
			oversized
				? {
						fontSize: "clamp(4rem, 13vh, 11rem)",
						fontWeight: 900,
						lineHeight: 0.94,
						maxWidth: blueprint.order === 1 ? "150vw" : "78vw",
						textAlign: "left",
					}
				: {
						fontSize: "clamp(1.4rem, 3vw, 3rem)",
						fontWeight: 900,
						lineHeight: 1,
						textAlign: "left",
					},
		),
	];
	if (role !== "choice") {
		elementsForFrame.push(
			imageElement(base, frame.id, title, blueprint.order + frameIndex, 1),
			textElement(
				base,
				frame.id,
				oversized
					? longSceneText(blueprint, frameIndex)
					: createReaderStoryExcerpt(
							title,
							blueprint.branchName,
							blueprint.order + frameIndex,
						),
				2,
				{
					fontSize: oversized
						? "clamp(1.4rem, 3vh, 2.4rem)"
						: "clamp(0.9rem, 1.4vw, 1.15rem)",
					fontWeight: 520,
					lineHeight: oversized ? 1.65 : 1.5,
					maxWidth: oversized ? "64rem" : "38rem",
					textAlign: "left",
				},
			),
		);
	}
	for (const [index, path] of paths.entries()) {
		elementsForFrame.push(choiceElement(base, frame.id, path, index + 4));
	}
	return elementsForFrame;
}

function createAudioElement(
	blueprint: ReaderSceneBlueprint,
	frameId: number,
	sceneId: number,
	taleId: number,
): typeof elements.$inferInsert | null {
	const mode =
		blueprint.order === 1
			? "onEnter"
			: blueprint.order === 2
				? "onEnter"
				: blueprint.order === 3
					? "scrollVolume"
					: null;
	if (!mode) return null;
	const label =
		mode === "onEnter" ? "Soft rain ambience" : "Rain across the scene";
	return {
		...elementBase(sceneId, taleId),
		content: {
			label,
			loop: true,
			maxVolume: mode === "scrollVolume" ? 0.78 : 0.55,
			playbackMode: mode,
			playbackScope: mode === "scrollVolume" ? "element" : "scene",
			url: "/reader-demo/soft-rain-ambient.mp3",
		},
		data: {
			duration: 8,
			url: "/reader-demo/soft-rain-ambient.mp3",
		},
		frameId,
		order: 90,
		placementConfig: {
			horizontal: "right",
			mode: "absolute",
			unit: "px",
			vertical: "bottom",
			width: 300,
			x: 24,
			y: 24,
			zIndex: 20,
		},
		styleConfig: { maxWidth: "19rem", width: "min(19rem, calc(100vw - 2rem))" },
		type: "audio",
	};
}

function createOneShotAudioElement(
	blueprint: ReaderSceneBlueprint,
	frameId: number,
	sceneId: number,
	taleId: number,
): typeof elements.$inferInsert | null {
	if (blueprint.order !== 4 && blueprint.order !== 8) return null;
	return {
		...elementBase(sceneId, taleId),
		content: {
			label: "Choice revealed",
			loop: false,
			maxVolume: 0.72,
			playbackMode: "onEnter",
			playbackScope: "frame",
			url: "/reader-demo/dragon-studio-pop.mp3",
		},
		data: { duration: 1, url: "/reader-demo/dragon-studio-pop.mp3" },
		frameId,
		order: 91,
		placementConfig: { frameId: String(frameId), mode: "normal" },
		styleConfig: {},
		type: "audio",
	};
}

function textElement(
	base: ReturnType<typeof elementBase>,
	frameId: number,
	text: string,
	order: number,
	styleConfig: ReaderStyleConfig,
): typeof elements.$inferInsert {
	return {
		...base,
		content: { content: text },
		data: { content: text },
		frameId,
		order,
		placementConfig: { frameId: String(frameId), mode: "normal" },
		styleConfig,
		type: "text",
	};
}

function imageElement(
	base: ReturnType<typeof elementBase>,
	frameId: number,
	title: string,
	imageIndex: number,
	order: number,
): typeof elements.$inferInsert {
	const url = sceneImages[imageIndex % sceneImages.length] ?? sceneImages[0];
	return {
		...base,
		animationConfig: {
			...emptyAnimationConfig(),
			intro: {
				tracks: [
					{ end: 1, from: 0.9, property: "scale", start: 0, to: 1 },
					{ end: 1, from: 0, property: "opacity", start: 0, to: 1 },
				],
			},
		},
		content: { alt: `Illustration for ${title}`, url },
		data: { alt: `Illustration for ${title}`, url },
		frameId,
		order,
		placementConfig: { frameId: String(frameId), mode: "normal" },
		styleConfig: {
			flexGrow: 1,
			minHeight: "8rem",
			objectFit: "cover",
			overflow: "hidden",
			width: "100%",
		},
		type: "image",
	};
}

function choiceElement(
	base: ReturnType<typeof elementBase>,
	frameId: number,
	path: PathRow,
	order: number,
): typeof elements.$inferInsert {
	return {
		...base,
		content: {
			description:
				path.type === "choice"
					? "Choose which branch and later Frames become part of this route."
					: path.type === "return"
						? "Return to the most recent choice Keyframe."
						: "Revisit the first choice without changing your route.",
			label: path.label ?? "Continue",
			pathId: String(path.id),
		},
		data: { label: path.label ?? "Continue", pathId: String(path.id) },
		frameId,
		order,
		placementConfig: { frameId: String(frameId), mode: "normal" },
		styleConfig: { maxWidth: "34rem", width: "100%" },
		type: "choiceButton",
	};
}

function elementBase(
	sceneId: number,
	taleId: number,
): Pick<
	typeof elements.$inferInsert,
	| "animationConfig"
	| "cloneable"
	| "creatorId"
	| "editable"
	| "isOfficial"
	| "isVerified"
	| "sceneId"
	| "taleId"
	| "visibility"
> {
	return {
		animationConfig: emptyAnimationConfig(),
		cloneable: "private",
		creatorId: userId1,
		editable: true,
		isOfficial: true,
		isVerified: true,
		sceneId,
		taleId,
		visibility: "public",
	};
}

function emptyAnimationConfig(): ElementAnimationConfig {
	return {
		ambient: { cycleDurationMs: 2400, tracks: [] },
		intro: { tracks: [] },
		outro: { tracks: [] },
		active: { tracks: [] },
	};
}

function longSceneText(blueprint: ReaderSceneBlueprint, index: number): string {
	const line =
		blueprint.order === 1
			? "The archive ran beyond the horizon, each shelf holding a road that had not happened yet."
			: "Down beneath Thornwick, the walls remembered every footstep and returned it as a warning.";
	return Array.from(
		{ length: index + 5 },
		(_, paragraph) =>
			`${line} The ${blueprint.branchName} ink marked passage ${paragraph + 1}.`,
	).join("\n\n");
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
