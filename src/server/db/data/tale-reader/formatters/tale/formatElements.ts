import type {
	ElementPlacement,
	ReaderStyle,
	TaleElement,
	TaleElementResponsiveOverride,
} from "~/app/(tale-app)/_shared/types";
import type {
	AmbientAnimationSelection as DbAmbientAnimationSelection,
	AnimationSelection as DbAnimationSelection,
} from "~/server/db/types/tale-reader/readerConfig";
import { formatAnimationSelection } from "./formatAnimationSelection";

/**
 * Formats database fragment rows into the reader fragment model.
 *
 * @param rows - Fragment rows returned from the tale query.
 * @returns Reader elements with normalized placement and animation configs.
 *
 * @example
 * const elements = formatElements(record.elements);
 */
export function formatElements(rows: unknown[]): TaleElement[] {
	return rows.map((row) => {
		const item = row as {
			animationConfig?: {
				ambient?: DbAmbientAnimationSelection;
				previousFrameBridge?: DbAnimationSelection;
				previousFrameBridgeLoop?: DbAmbientAnimationSelection;
				frameIntro?: DbAnimationSelection;
				frameOutro?: DbAnimationSelection;
				nextFrameBridge?: DbAnimationSelection;
				nextFrameBridgeLoop?: DbAmbientAnimationSelection;
				previousBridge?: DbAnimationSelection;
				previousBridgeLoop?: DbAmbientAnimationSelection;
				sceneIntro?: DbAnimationSelection;
				sceneOutro?: DbAnimationSelection;
				nextBridge?: DbAnimationSelection;
				nextBridgeLoop?: DbAmbientAnimationSelection;
				intro?: DbAnimationSelection;
				introLoop?: DbAmbientAnimationSelection;
				hover?: DbAnimationSelection;
				outro?: DbAnimationSelection;
				outroLoop?: DbAmbientAnimationSelection;
				active?: DbAnimationSelection;
				activeLoop?: DbAmbientAnimationSelection;
			};
			sceneId: number;
			content?: Record<string, unknown>;
			data?: Record<string, unknown>;
			id: number;
			frameId?: number | null;
			placementConfig?: ElementPlacement;
			order?: number;
			styleConfig?: ReaderStyle | null;
			responsiveConfig?: Record<string, TaleElementResponsiveOverride>;
			type: string;
			visibleRange?: TaleElement["visibleRange"];
		};
		const content = item.content ?? item.data ?? {};
		const type = formatElementType(item.type, content);
		return {
			alt: getString(content.alt),
			animations: {
				ambient: {
					...formatAnimationSelection(item.animationConfig?.ambient),
					cycleDurationMs:
						item.animationConfig?.ambient?.cycleDurationMs ?? 2400,
					endFrameId: item.animationConfig?.ambient?.endFrameId ?? null,
					playback: item.animationConfig?.ambient?.playback ?? "alternate",
					startFrameId: item.animationConfig?.ambient?.startFrameId ?? null,
				},
				previousFrameBridge: formatAnimationSelection(
					item.animationConfig?.previousFrameBridge,
				),
				previousFrameBridgeLoop: formatAmbientSelection(
					item.animationConfig?.previousFrameBridgeLoop,
				),
				frameIntro: formatAnimationSelection(item.animationConfig?.frameIntro),
				frameOutro: formatAnimationSelection(item.animationConfig?.frameOutro),
				nextFrameBridge: formatAnimationSelection(
					item.animationConfig?.nextFrameBridge,
				),
				nextFrameBridgeLoop: formatAmbientSelection(
					item.animationConfig?.nextFrameBridgeLoop,
				),
				previousBridge: formatAnimationSelection(
					item.animationConfig?.previousBridge,
				),
				previousBridgeLoop: formatAmbientSelection(
					item.animationConfig?.previousBridgeLoop,
				),
				sceneIntro: formatAnimationSelection(item.animationConfig?.sceneIntro),
				sceneOutro: formatAnimationSelection(item.animationConfig?.sceneOutro),
				nextBridge: formatAnimationSelection(item.animationConfig?.nextBridge),
				nextBridgeLoop: formatAmbientSelection(
					item.animationConfig?.nextBridgeLoop,
				),
				intro: formatAnimationSelection(item.animationConfig?.intro),
				introLoop: formatAmbientSelection(item.animationConfig?.introLoop),
				hover: formatAnimationSelection(item.animationConfig?.hover),
				outro: formatAnimationSelection(item.animationConfig?.outro),
				outroLoop: formatAmbientSelection(item.animationConfig?.outroLoop),
				active: formatAnimationSelection(item.animationConfig?.active),
				activeLoop: formatAmbientSelection(item.animationConfig?.activeLoop),
			},
			attribution: getString(content.attribution),
			caption: getString(content.caption),
			fallbackSrc:
				getString(content.fallbackSrc) ??
				getString(content.fallbackUrl) ??
				null,
			id: String(item.id),
			imageStyle: getReaderStyle(content.imageStyle),
			label: getString(content.label),
			mood: getString(content.mood),
			mediaPlayback:
				type === "audio" || type === "video"
					? {
							loop: content.loop === true,
							maxVolume: getNumber(content.maxVolume, 1),
							mode: getPlaybackMode(content.playbackMode),
							scope: getPlaybackScope(content.playbackScope),
						}
					: undefined,
			frameId: item.frameId == null ? null : String(item.frameId),
			order: item.order ?? 0,
			pathId: getString(content.pathId),
			pathIds: getStringArray(content.pathIds),
			placement: normalizePlacement(
				item.placementConfig ?? defaultPlacement(),
				item.frameId,
			),
			prompt: getString(content.prompt),
			progression: getElementProgression(content.progression),
			src: getString(content.src) ?? getString(content.url) ?? null,
			style: item.styleConfig ?? undefined,
			text: getString(content.text) ?? getString(content.content),
			visibleDuringSceneIntro: content.visibleDuringSceneIntro === true,
			visibleDuringSceneOutro: content.visibleDuringSceneOutro === true,
			visibleDuringPreviousBridge: content.visibleDuringPreviousBridge === true,
			visibleDuringNextBridge: content.visibleDuringNextBridge === true,
			visibleDuringFrameIntro: content.visibleDuringFrameIntro === true,
			visibleDuringFrameOutro: content.visibleDuringFrameOutro === true,
			visibleDuringPreviousFrameBridge:
				content.visibleDuringPreviousFrameBridge === true,
			visibleDuringNextFrameBridge:
				content.visibleDuringNextFrameBridge === true,
			type,
			responsiveOverrides: item.responsiveConfig ?? undefined,
			visibleRange: item.visibleRange,
		};
	});
}

function getElementProgression(value: unknown): TaleElement["progression"] {
	if (!value || typeof value !== "object") return undefined;
	const progression = value as NonNullable<TaleElement["progression"]>;
	return {
		enabled: progression.enabled === true,
		introLength: getNumber(progression.introLength, 0),
		outroLength: getNumber(progression.outroLength, 0),
		pauses: {
			atEnd: getNumber(progression.pauses?.atEnd, 0),
			atStart: getNumber(progression.pauses?.atStart, 0),
		},
		activeLength: getNumber(progression.activeLength, 100),
		snap: progression.snap ?? { mode: "snap-off", strategy: "shared" },
	};
}

function getReaderStyle(value: unknown): ReaderStyle | undefined {
	return value && typeof value === "object"
		? (value as ReaderStyle)
		: undefined;
}

function formatAmbientSelection(
	selection?: DbAmbientAnimationSelection,
): TaleElement["animations"]["ambient"] {
	return {
		...formatAnimationSelection(selection),
		cycleDurationMs: selection?.cycleDurationMs ?? 2400,
		endFrameId: selection?.endFrameId ?? null,
		playback: selection?.playback ?? "alternate",
		startFrameId: selection?.startFrameId ?? null,
	};
}

/**
 * Normalizes raw database fragment type data for the reader.
 *
 * @param type - Persisted fragment type.
 * @param content - Fragment content payload.
 * @returns The reader fragment type.
 *
 * @example
 * const type = formatElementType(row.type, row.content);
 */
function formatElementType(
	type: string,
	content: Record<string, unknown>,
): TaleElement["type"] {
	if (type === "audio") return "audio";
	if (type === "video") return "video";
	if (type === "choiceButton") return "choiceButton";
	if (type === "codexEntry") return "codexEntry";
	if (type === "quote") return "quote";
	if (type === "image") return "image";
	if (type === "soundCue") return "soundCue";
	if (content.pathId) return "choiceButton";
	return "text";
}

/**
 * Provides the default fragment placement used when none is stored.
 *
 * @returns A normal-flow fragment placement.
 *
 * @example
 * const placement = defaultPlacement();
 */
function defaultPlacement(): ElementPlacement {
	return { mode: "normal" };
}

/**
 * Normalizes placement configs into the current normal/absolute/fixed model.
 *
 * @param placement - Placement data from the database.
 * @param frameId - Optional node id relation from the fragment row.
 * @returns A placement supported by the current reader engine.
 *
 * @example
 * const placement = normalizePlacement(row.placementConfig, row.frameId);
 */
function normalizePlacement(
	placement: ElementPlacement,
	frameId?: number | null,
): ElementPlacement {
	const resolvedFrameId = frameId == null ? placement.frameId : String(frameId);

	if (placement.mode === "absolute" || placement.mode === "fixed") {
		return {
			...placement,
			frameId: resolvedFrameId,
		};
	}

	return {
		mode: "normal",
		frameId: resolvedFrameId,
		overflow: placement.overflow,
	};
}

/**
 * Reads a string value from an unknown content payload field.
 *
 * @param value - Unknown content field.
 * @returns The field when it is a string.
 *
 * @example
 * const text = getString(content.text);
 */
function getString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

/**
 * Reads a string array from an unknown content payload field.
 *
 * @param value - Unknown content field.
 * @returns The field when it is an array of strings.
 *
 * @example
 * const ids = getStringArray(content.pathIds);
 */
function getStringArray(value: unknown): string[] | undefined {
	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === "string")
		: undefined;
}

function getNumber(value: unknown, fallback: number): number {
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getPlaybackMode(
	value: unknown,
): NonNullable<TaleElement["mediaPlayback"]>["mode"] {
	return value === "click" || value === "onEnter" || value === "scrollVolume"
		? value
		: "controls";
}

function getPlaybackScope(
	value: unknown,
): NonNullable<TaleElement["mediaPlayback"]>["scope"] {
	return value === "element" || value === "frame" ? value : "scene";
}
