import { normalizeSceneAutoplayConfig } from "~/app/(tale-app)/_shared/services/readerPlaybackSettings";
import { normalizeSceneSnapConfig } from "~/app/(tale-app)/_shared/services/readerSnapSettings";
import type {
	RawTaleRecord,
	ReaderStyle,
	TaleScene,
	TaleSceneResponsiveOverride,
} from "~/app/(tale-app)/_shared/types";
import type {
	AmbientAnimationSelection as DbAmbientAnimationSelection,
	AnimationSelection as DbAnimationSelection,
	ReaderSizeConfig,
	ReaderSizeMode,
	TransitionConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { formatAnimationSelection } from "./formatAnimationSelection";
import { formatSize } from "./formatSize";

type RawSceneRow = {
	containerConfig?: TaleScene["container"];
	branchId?: number | null;
	description?: string | null;
	elementIds?: number[];
	elements?: { id: number }[];
	id: number;
	isChoiceScene?: boolean;
	frames?: { id: number }[];
	order?: number;
	readingConfig?: {
		autoplay?: TaleScene["autoplay"];
		animationConfig?: {
			ambient?: DbAmbientAnimationSelection;
			hover?: DbAnimationSelection;
			sceneActive?: DbAnimationSelection;
			sceneActiveLoop?: DbAmbientAnimationSelection;
			active?: DbAnimationSelection;
			activeLoop?: DbAmbientAnimationSelection;
		};
		cameraPath?: TaleScene["reading"]["cameraPath"];
		pauses?: TaleScene["reading"]["pauses"];
		activeLength?: number | null;
		activeLengthMode?: TaleScene["reading"]["activeLengthMode"];
	};
	sizeConfig?: ReaderSizeConfig;
	sizeMode?: ReaderSizeMode;
	styleConfig?: ReaderStyle | null;
	responsiveConfig?: Record<string, TaleSceneResponsiveOverride>;
	title?: string | null;
	transitionConfig?: TransitionConfig;
};

/**
 * Formats database block rows into the reader block model.
 *
 * @param rows - Scene rows returned from the tale query.
 * @param pages - Already formatted pages used to derive narrative ownership.
 * @returns Reader scenes with page, entry, part, node, and animation metadata.
 *
 * @example
 * const scenes = formatScenes(record.scenes, pages);
 */
export function formatScenes(
	rows: unknown[],
	pages: RawTaleRecord["pages"],
): TaleScene[] {
	const pagesById = new Map(pages.map((page) => [page.id, page]));
	return rows.map((row) => formatSceneRow(row as RawSceneRow, pagesById));
}

/**
 * Formats one database block row into the reader block model.
 *
 * @param block - Scene row returned by the tale query.
 * @param pagesById - Formatted pages keyed by id for ownership fallback data.
 * @returns One formatted tale block.
 *
 * @example
 * const block = formatSceneRow(row, pagesById);
 */
function formatSceneRow(
	block: RawSceneRow,
	pagesById: Map<string, RawTaleRecord["pages"][number]>,
): TaleScene {
	return {
		articleStyle: block.containerConfig?.articleStyle,
		autoplay: normalizeSceneAutoplayConfig(block.readingConfig?.autoplay),
		container: block.containerConfig,
		branchId: String(block.branchId ?? ""),
		description: block.description ?? undefined,
		entryId: "",
		elementIds: getSceneElementIds(block),
		id: String(block.id),
		isChoiceScene: block.isChoiceScene ?? false,
		isPaginated: true,
		frameIds: block.frames?.map((node) => String(node.id)) ?? [],
		keyframeIds: [],
		order: block.order ?? 0,
		pageId: "",
		pageNumber: null,
		partId: "",
		reading: formatReadingConfig(block),
		responsiveOverrides: block.responsiveConfig ?? undefined,
		size: formatSize(block.sizeMode, block.sizeConfig),
		snap: normalizeSceneSnapConfig(block.transitionConfig?.snap ?? true),
		style: block.styleConfig ?? undefined,
		title: block.title ?? `Scene ${block.id}`,
		transition: formatTransitionConfig(block.transitionConfig),
	};
}

/**
 * Formats fragment relationship ids for one block.
 *
 * @param block - Scene row with either denormalized fragment ids or relation rows.
 * @returns Fragment ids as reader string ids.
 *
 * @example
 * const elementIds = getSceneElementIds(block);
 */
function getSceneElementIds(block: RawSceneRow): string[] {
	return (
		block.elementIds?.map(String) ??
		block.elements?.map((fragment) => String(fragment.id)) ??
		[]
	);
}

/**
 * Formats one block reading configuration.
 *
 * @param block - Scene row containing the persisted reading config.
 * @returns Reader reading settings for the block.
 *
 * @example
 * const reading = formatReadingConfig(block);
 */
function formatReadingConfig(block: RawSceneRow): TaleScene["reading"] {
	return {
		animations: {
			ambient: {
				...formatAnimationSelection(
					block.readingConfig?.animationConfig?.ambient,
				),
				cycleDurationMs:
					block.readingConfig?.animationConfig?.ambient?.cycleDurationMs ??
					2400,
				endFrameId:
					block.readingConfig?.animationConfig?.ambient?.endFrameId ?? null,
				playback:
					block.readingConfig?.animationConfig?.ambient?.playback ??
					"alternate",
				startFrameId:
					block.readingConfig?.animationConfig?.ambient?.startFrameId ?? null,
			},
			hover: formatAnimationSelection(
				block.readingConfig?.animationConfig?.hover,
			),
			sceneActive: formatAnimationSelection(
				block.readingConfig?.animationConfig?.sceneActive,
			),
			sceneActiveLoop: formatAmbientSelection(
				block.readingConfig?.animationConfig?.sceneActiveLoop,
			),
			active: formatAnimationSelection(
				block.readingConfig?.animationConfig?.active,
			),
			activeLoop: formatAmbientSelection(
				block.readingConfig?.animationConfig?.activeLoop,
			),
		},
		cameraPath: normalizeCameraPath(block.readingConfig?.cameraPath),
		pauses: block.readingConfig?.pauses,
		activeLength: block.readingConfig?.activeLength ?? null,
		activeLengthMode:
			block.readingConfig?.activeLengthMode ??
			(block.readingConfig?.activeLength == null ? "content" : "manual"),
	};
}

/**
 * Formats one block transition configuration.
 *
 * @param transition - Persisted transition config from the database row.
 * @returns Reader transition settings for the block.
 *
 * @example
 * const transition = formatTransitionConfig(block.transitionConfig);
 */
function formatTransitionConfig(
	transition?: TransitionConfig,
): TaleScene["transition"] {
	return {
		animations: {
			intro: formatAnimationSelection(transition?.animationConfig.intro),
			introLoop: formatAmbientSelection(transition?.animationConfig.introLoop),
			outro: formatAnimationSelection(transition?.animationConfig.outro),
			outroLoop: formatAmbientSelection(transition?.animationConfig.outroLoop),
			previousBridge: formatAnimationSelection(
				transition?.animationConfig.previousBridge,
			),
			previousBridgeLoop: formatAmbientSelection(
				transition?.animationConfig.previousBridgeLoop,
			),
			nextBridge: formatAnimationSelection(
				transition?.animationConfig.nextBridge,
			),
			nextBridgeLoop: formatAmbientSelection(
				transition?.animationConfig.nextBridgeLoop,
			),
			previousVisible: formatAnimationSelection(
				transition?.animationConfig.previousVisible,
			),
		},
		introLength: transition?.introLength ?? null,
		introEnabled:
			transition?.introEnabled ?? (transition?.introLength ?? 0) > 0,
		flow: normalizeFlow(transition?.flow),
		outroLength: transition?.outroLength ?? null,
		outroEnabled:
			transition?.outroEnabled ?? (transition?.outroLength ?? 0) > 0,
		previousBridgeEnabled: true,
		previousBridgeLength: transition?.previousBridgeLength ?? null,
		nextBridgeEnabled: true,
		nextBridgeLength: transition?.nextBridgeLength ?? null,
		pauseAfterIntroEnabled: transition?.pauseAfterIntroEnabled ?? false,
		pauseBeforeOutroEnabled: transition?.pauseBeforeOutroEnabled ?? false,
		previousScenesDuringEnter: transition?.previousScenesDuringEnter ?? "keep",
		scrollLength: null,
	};
}

function formatAmbientSelection(
	selection?: DbAmbientAnimationSelection,
): TaleScene["reading"]["animations"]["ambient"] {
	return {
		...formatAnimationSelection(selection),
		cycleDurationMs: selection?.cycleDurationMs ?? 2400,
		endFrameId: selection?.endFrameId ?? null,
		playback: selection?.playback ?? "alternate",
		startFrameId: selection?.startFrameId ?? null,
	};
}

/**
 * Normalizes a persisted transition flow.
 *
 * @param flow - Optional persisted block flow.
 * @returns Reader-compatible block flow.
 *
 * @example
 * const flow = normalizeFlow(row.transitionConfig?.flow);
 */
function normalizeFlow(
	flow: TransitionConfig["flow"] | undefined,
): TaleScene["transition"]["flow"] {
	return flow?.type === "stack"
		? flow
		: {
				groupHorizontalAlignment: flow?.groupHorizontalAlignment,
				alignment: flow?.alignment,
				direction: flow?.direction ?? "down",
				placement: flow?.placement,
				spacing: flow?.spacing,
				type: "linear",
			};
}

/**
 * Normalizes persisted camera path names into the frontend reader naming.
 *
 * @param cameraPath - Camera path config from the block reading config.
 * @returns The frontend camera path config.
 *
 * @example
 * const path = normalizeCameraPath(row.readingConfig.cameraPath);
 */
function normalizeCameraPath(
	cameraPath: unknown,
): TaleScene["reading"]["cameraPath"] {
	if (
		typeof cameraPath === "object" &&
		cameraPath !== null &&
		"mode" in cameraPath &&
		cameraPath.mode === "reverseFlow"
	) {
		return { mode: "reverse-flow" };
	}
	return cameraPath as TaleScene["reading"]["cameraPath"];
}
