import { normalizeSceneAutoplayConfig } from "~/app/(tale-app)/_shared/services/readerPlaybackSettings";
import { normalizeSceneSnapConfig } from "~/app/(tale-app)/_shared/services/readerSnapSettings";
import type {
	KeyframeAction,
	TaleKeyframe,
	TaleScene,
} from "~/app/(tale-app)/_shared/types";
import type {
	AnimationSelection as DbAnimationSelection,
	ReadingConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { formatAnimationSelection } from "./formatAnimationSelection";

type RawKeyframeRow = {
	responsiveConfig?: TaleKeyframe["responsiveOverrides"];
	actions?: KeyframeAction[];
	branchId?: number | null;
	description?: string | null;
	frameId?: number | null;
	id: number;
	order?: number;
	pageId?: number | null;
	readingConfig?: ReadingConfig;
	sceneId: number;
	snapConfig?: TaleKeyframe["snap"];
	title?: string | null;
};

export function formatKeyframes(
	rows: unknown[],
	scenes: TaleScene[],
): TaleKeyframe[] {
	const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
	const formatted = rows.map((row) => {
		const step = row as RawKeyframeRow;
		return formatKeyframeRow(step, sceneById.get(String(step.sceneId)));
	});
	const stepSceneIds = new Set(formatted.map((step) => step.sceneId));
	return [
		...formatted,
		...scenes
			.filter((scene) => !stepSceneIds.has(scene.id))
			.map(createLegacySceneKeyframe),
	].sort((left, right) => left.order - right.order);
}

function formatKeyframeRow(
	step: RawKeyframeRow,
	scene?: TaleScene,
): TaleKeyframe {
	return {
		responsiveOverrides: step.responsiveConfig ?? {},
		actions: step.actions ?? [],
		autoplay: normalizeSceneAutoplayConfig(step.readingConfig?.autoplay),
		branchId:
			step.branchId == null ? (scene?.branchId ?? "") : String(step.branchId),
		description: step.description ?? undefined,
		frameId: step.frameId == null ? null : String(step.frameId),
		id: String(step.id),
		order: step.order ?? 0,
		pageId: step.pageId == null ? null : String(step.pageId),
		reading: formatKeyframeReading(step.readingConfig),
		sceneId: String(step.sceneId),
		snap: normalizeSceneSnapConfig(step.snapConfig ?? true),
		title: step.title ?? `Keyframe ${step.id}`,
		transition: {
			introLength: step.readingConfig?.transition?.introLength ?? null,
			outroLength: step.readingConfig?.transition?.outroLength ?? null,
		},
	};
}

function createLegacySceneKeyframe(scene: TaleScene): TaleKeyframe {
	return {
		actions: [],
		autoplay: scene.autoplay,
		branchId: scene.branchId,
		description: "Generated from the legacy Scene reading configuration.",
		frameId: scene.rootFrameId ?? null,
		id: `${scene.id}:default-keyframe`,
		order: 0,
		pageId: null,
		reading: scene.reading,
		sceneId: scene.id,
		snap: scene.snap,
		title: "Scene",
		transition: { introLength: null, outroLength: null },
	};
}

function formatKeyframeReading(config?: ReadingConfig): TaleScene["reading"] {
	const ambient = config?.animationConfig?.ambient;
	return {
		animations: {
			ambient: {
				...formatAnimationSelection(ambient),
				cycleDurationMs: ambient?.cycleDurationMs ?? 2400,
				playback: ambient?.playback ?? "alternate",
			},
			active: formatAnimationSelection(
				config?.animationConfig?.active as DbAnimationSelection | undefined,
			),
		},
		cameraPath:
			config?.cameraPath?.mode === "reverseFlow"
				? { mode: "reverse-flow" }
				: config?.cameraPath,
		pauses: config?.pauses,
		activeLength: config?.activeLength ?? null,
		activeLengthMode: config?.activeLengthMode ?? "content",
	};
}
