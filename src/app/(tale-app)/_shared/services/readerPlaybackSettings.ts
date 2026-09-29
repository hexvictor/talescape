import type {
	Tale,
	TalePlaybackConfig,
	TaleSceneAutoplayConfig,
	TimelineSegment,
} from "../types";

export const DEFAULT_TALE_PLAYBACK_CONFIG: TalePlaybackConfig = {
	autoplay: {
		enabled: false,
		speed: 52,
		stopOn: {
			dragging: true,
			keyboard: true,
			scrolling: true,
		},
	},
	interactions: {
		dragging: true,
		keyboard: true,
		scrolling: true,
	},
};

export const DEFAULT_BLOCK_AUTOPLAY_CONFIG: TaleSceneAutoplayConfig = {
	enabled: false,
	introSpeed: null,
	outroSpeed: null,
	pauseAfterIntroSeconds: null,
	pauseBeforeOutroSeconds: null,
	activeSpeed: null,
};

/** Normalizes optional block-specific autoplay timing. */
export function normalizeSceneAutoplayConfig(
	value: unknown,
): TaleSceneAutoplayConfig {
	const config = isRecord(value) ? value : {};
	return {
		enabled: booleanOrDefault(config.enabled, false),
		introSpeed: positiveNumberOrNull(config.introSpeed),
		outroSpeed: positiveNumberOrNull(config.outroSpeed),
		pauseAfterIntroSeconds: nonNegativeNumberOrNull(
			config.pauseAfterIntroSeconds,
		),
		pauseBeforeOutroSeconds: nonNegativeNumberOrNull(
			config.pauseBeforeOutroSeconds,
		),
		activeSpeed: positiveNumberOrNull(config.activeSpeed),
	};
}

/** Resolves the authored autoplay speed for the active timeline segment. */
export function resolveAutoplaySegmentSpeed(
	tale: Tale,
	segment: TimelineSegment,
	fallback: number,
): number {
	if (segment.type === "transition") {
		const intro = getEnabledBlockConfig(tale, segment.toSceneId);
		if (intro?.introSpeed) return intro.introSpeed;
		const outro = segment.fromSceneId
			? getEnabledBlockConfig(tale, segment.fromSceneId)
			: null;
		return outro?.outroSpeed ?? fallback;
	}
	return getEnabledBlockConfig(tale, segment.sceneId)?.activeSpeed ?? fallback;
}

/** Resolves an autoplay-only pause at a boundary between timeline segments. */
export function resolveAutoplayBoundaryPauseSeconds(
	tale: Tale,
	segment: TimelineSegment,
	nextSegment: TimelineSegment,
): number {
	if (nextSegment.type === "transition" && nextSegment.fromSceneId) {
		return (
			getEnabledBlockConfig(tale, nextSegment.fromSceneId)
				?.pauseBeforeOutroSeconds ?? 0
		);
	}
	if (segment.type === "transition") {
		return (
			getEnabledBlockConfig(tale, segment.toSceneId)
				?.pauseAfterIntroSeconds ?? 0
		);
	}
	return 0;
}

function getEnabledBlockConfig(
	tale: Tale,
	sceneId: string,
): TaleSceneAutoplayConfig | null {
	const config = tale.indexMap.scenesById[sceneId]?.autoplay;
	return config?.enabled ? config : null;
}

/** Normalizes persisted and imported playback settings from older tales. */
export function normalizeTalePlaybackConfig(
	value: unknown,
): TalePlaybackConfig {
	const config = isRecord(value) ? value : {};
	const autoplay = isRecord(config.autoplay) ? config.autoplay : {};
	const stopOn = isRecord(autoplay.stopOn) ? autoplay.stopOn : {};
	const interactions = isRecord(config.interactions) ? config.interactions : {};
	const speed = Number(autoplay.speed);

	return {
		autoplay: {
			enabled:
				typeof autoplay.enabled === "boolean"
					? autoplay.enabled
					: DEFAULT_TALE_PLAYBACK_CONFIG.autoplay.enabled,
			speed: Number.isFinite(speed)
				? Math.max(1, speed)
				: DEFAULT_TALE_PLAYBACK_CONFIG.autoplay.speed,
			stopOn: {
				dragging: booleanOrDefault(
					stopOn.dragging,
					DEFAULT_TALE_PLAYBACK_CONFIG.autoplay.stopOn.dragging,
				),
				keyboard: booleanOrDefault(
					stopOn.keyboard,
					DEFAULT_TALE_PLAYBACK_CONFIG.autoplay.stopOn.keyboard,
				),
				scrolling: booleanOrDefault(
					stopOn.scrolling,
					DEFAULT_TALE_PLAYBACK_CONFIG.autoplay.stopOn.scrolling,
				),
			},
		},
		interactions: {
			dragging: booleanOrDefault(
				interactions.dragging,
				DEFAULT_TALE_PLAYBACK_CONFIG.interactions.dragging,
			),
			keyboard: booleanOrDefault(
				interactions.keyboard,
				DEFAULT_TALE_PLAYBACK_CONFIG.interactions.keyboard,
			),
			scrolling: booleanOrDefault(
				interactions.scrolling,
				DEFAULT_TALE_PLAYBACK_CONFIG.interactions.scrolling,
			),
		},
	};
}

function booleanOrDefault(value: unknown, fallback: boolean): boolean {
	return typeof value === "boolean" ? value : fallback;
}

function nonNegativeNumberOrNull(value: unknown): number | null {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : null;
}

function positiveNumberOrNull(value: unknown): number | null {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
