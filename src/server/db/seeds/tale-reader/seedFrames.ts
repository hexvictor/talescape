import { eq } from "drizzle-orm";
import type {
	SceneContainer,
	TaleFrame,
	TaleSceneResponsiveOverride,
} from "~/app/(tale-app)/_shared/types";
import { db } from "~/server/db";
import { formatFrames } from "~/server/db/data/tale-reader/formatters/frames/formatFrames";
import { frames, scenes, tales } from "~/server/db/schema";
import type {
	FrameAnimationConfig,
	ReaderStyleConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { userId1 } from "../ids";
import {
	type ReaderSceneBlueprint,
	readerSceneBlueprints,
} from "./readerStoryBlueprint";
import { logSeedComplete, logSeedStart } from "./seedLogs";

type SeededScene = {
	id: number;
	order: number;
	responsiveConfig: Record<string, TaleSceneResponsiveOverride>;
};

export async function seedFrames(): Promise<void> {
	logSeedStart("Frames");
	const [tale] = await db
		.select({ id: tales.id })
		.from(tales)
		.where(eq(tales.slug, "branched"));
	if (!tale) throw new Error("Seeded reader tale was not found.");

	const seededScenes = await db
		.select({
			id: scenes.id,
			order: scenes.order,
			responsiveConfig: scenes.responsiveConfig,
		})
		.from(scenes)
		.where(eq(scenes.taleId, tale.id));
	const blueprintByOrder = new Map(
		readerSceneBlueprints.map((blueprint) => [blueprint.order, blueprint]),
	);

	for (const scene of seededScenes.sort((a, b) => a.order - b.order)) {
		const blueprint = blueprintByOrder.get(scene.order);
		if (!blueprint) throw new Error(`Missing Scene blueprint ${scene.order}.`);
		await seedSceneFrames(tale.id, scene, blueprint);
	}
	logSeedComplete("Frames");
}

async function seedSceneFrames(
	taleId: number,
	scene: SeededScene,
	blueprint: ReaderSceneBlueprint,
): Promise<void> {
	const rootStyle = rootFrameStyle(blueprint);
	const roles = getChildFrameRoles(blueprint);
	const children = await db
		.insert(frames)
		.values(
			roles.map((role, index) => {
				const stableId = stableFrameId(scene.id, role);
				const style = childFrameStyle(blueprint, role, index);
				return frameInsert({
					config: {
						children: [],
						id: stableId,
						mode: "stack",
						overflow: "clip",
						parentFrameId: null,
						style,
					},
					isRoot: false,
					name: role,
					order: index,
					parentFrameId: null,
					sceneId: scene.id,
					stableId,
					styleConfig: style,
					taleId,
				});
			}),
		)
		.returning({ id: frames.id });

	const persistedFrames = formatFrames(
		await db.query.frames.findMany({
			where: (model, { eq }) => eq(model.sceneId, scene.id),
			orderBy: (model, { asc }) => [asc(model.order), asc(model.id)],
		}),
	);
	const mobileFrames = createMobileFrames(persistedFrames);
	const mobileOverride = {
		frames: mobileFrames,
		container: {
			...rootFrameConfig(blueprint, rootStyle),
			direction: "column" as const,
			gap: 0,
			mode: "flex" as const,
			style: {
				...rootStyle,
				display: "flex",
				flexDirection: "column",
				gap: 0,
			},
		},
		size: {
			height: Math.max(children.length, 1),
			heightUnit: "viewport" as const,
			horizontalAlignment: "auto" as const,
			mode: "manual" as const,
			verticalAlignment: "auto" as const,
			width: 1,
			widthUnit: "viewport" as const,
		},
	};
	await db
		.update(scenes)
		.set({
			containerConfig: rootFrameConfig(blueprint, rootStyle),
			responsiveConfig: {
				...scene.responsiveConfig,
				"mobile-landscape": {
					...scene.responsiveConfig["mobile-landscape"],
					...mobileOverride,
				},
				"mobile-portrait": {
					...scene.responsiveConfig["mobile-portrait"],
					...mobileOverride,
				},
			} as Record<string, TaleSceneResponsiveOverride>,
		})
		.where(eq(scenes.id, scene.id));
}

function createMobileFrames(seededFrames: TaleFrame[]): TaleFrame[] {
	return seededFrames.map(
		(frame) =>
			({
				...frame,
				style: {
					...frame.style,
					flexBasis: "100dvh",
					flexGrow: 0,
					flexShrink: 0,
					height: "100dvh",
					minHeight: "100dvh",
					width: "100%",
				},
			}) as TaleFrame,
	);
}

function getChildFrameRoles(blueprint: ReaderSceneBlueprint): string[] {
	if (
		blueprint.layout === "single-horizontal" ||
		blueprint.layout === "single-vertical"
	) {
		return ["story"];
	}
	if (blueprint.layout === "branch-comic") {
		return ["story", "choice", "route-a", "route-b"];
	}
	if (blueprint.layout === "choice-grid") {
		return ["panel-1", "panel-2", "quote", "choice"];
	}
	return blueprint.pageOrders.map((_, index) => `panel-${index + 1}`);
}

function rootFrameConfig(
	blueprint: ReaderSceneBlueprint,
	style: ReaderStyleConfig,
): SceneContainer {
	const grid = !blueprint.layout.startsWith("single");
	return {
		direction: blueprint.layout === "single-horizontal" ? "row" : "column",
		gap: grid ? 14 : 36,
		mode: grid ? "grid" : "flex",
		overflow: "clip",
		columns: grid ? 2 : undefined,
		rows: grid ? 2 : undefined,
		style,
	};
}

function rootFrameStyle(blueprint: ReaderSceneBlueprint): ReaderStyleConfig {
	const grid = !blueprint.layout.startsWith("single");
	return {
		alignItems: "stretch",
		display: grid ? "grid" : "flex",
		flexDirection: blueprint.layout === "single-horizontal" ? "row" : "column",
		gap: grid ? 14 : 40,
		gridTemplateColumns: grid ? "repeat(2, minmax(0, 1fr))" : undefined,
		gridTemplateRows: grid ? "repeat(2, minmax(0, 1fr))" : undefined,
		height: "100%",
		justifyContent: "center",
		padding: "clamp(1rem, 2.5vw, 2.5rem)",
		width: "100%",
	};
}

function childFrameStyle(
	blueprint: ReaderSceneBlueprint,
	role: string,
	index: number,
): ReaderStyleConfig {
	return {
		backgroundCss:
			index % 3 === 0
				? "rgba(3, 8, 14, 0.86)"
				: index % 3 === 1
					? "rgba(8, 25, 33, 0.9)"
					: "rgba(31, 12, 25, 0.9)",
		border: "2px solid rgba(255,255,255,0.78)",
		boxShadow: "6px 7px 0 rgba(0,0,0,0.72)",
		display: "flex",
		flexDirection: "column",
		gap: 14,
		height: "100%",
		justifyContent: "center",
		overflow: "hidden",
		padding: "clamp(1rem, 2vw, 2rem)",
		width: "100%",
		zIndex: role.startsWith("route-") ? 2 : 1,
		...(blueprint.layout === "choice-grid" && role === "choice"
			? { gridColumn: "1 / -1" }
			: {}),
	};
}

function frameInsert(input: {
	config: typeof frames.$inferInsert.config;
	isRoot: boolean;
	name: string;
	order: number;
	parentFrameId: number | null;
	sceneId: number;
	stableId: string;
	styleConfig: ReaderStyleConfig;
	taleId: number;
}): typeof frames.$inferInsert {
	return {
		...input,
		animationConfig: emptyFrameAnimations(),
		cloneable: "private",
		creatorId: userId1,
		editable: true,
		isOfficial: true,
		isVerified: true,
		visibility: "public",
	};
}

function emptyFrameAnimations(): FrameAnimationConfig {
	return {
		ambient: { tracks: [] },
		intro: {
			tracks: [],
		},
		outro: {
			tracks: [],
		},
		active: { tracks: [] },
	};
}

function stableFrameId(sceneId: number, role: string): string {
	return `scene-${sceneId}-${role}`;
}
