import type {
	Tale,
	TaleBlockAutoplayConfig,
	TalePlaybackConfig,
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

export const DEFAULT_BLOCK_AUTOPLAY_CONFIG: TaleBlockAutoplayConfig = {
	enabled: false,
	enteringSpeed: null,
	leavingSpeed: null,
	pauseAfterEnteringSeconds: null,
	pauseBeforeLeavingSeconds: null,
	readingSpeed: null,
};

/** Normalizes optional block-specific autoplay timing. */
export function normalizeBlockAutoplayConfig(
	value: unknown,
): TaleBlockAutoplayConfig {
	const config = isRecord(value) ? value : {};
	return {
		enabled: booleanOrDefault(config.enabled, false),
		enteringSpeed: positiveNumberOrNull(config.enteringSpeed),
		leavingSpeed: positiveNumberOrNull(config.leavingSpeed),
		pauseAfterEnteringSeconds: nonNegativeNumberOrNull(
			config.pauseAfterEnteringSeconds,
		),
		pauseBeforeLeavingSeconds: nonNegativeNumberOrNull(
			config.pauseBeforeLeavingSeconds,
		),
		readingSpeed: positiveNumberOrNull(config.readingSpeed),
	};
}

/** Resolves the authored autoplay speed for the active timeline segment. */
export function resolveAutoplaySegmentSpeed(
	tale: Tale,
	segment: TimelineSegment,
	fallback: number,
): number {
	if (segment.type === "transition") {
		const entering = getEnabledBlockConfig(tale, segment.toBlockId);
		if (entering?.enteringSpeed) return entering.enteringSpeed;
		const leaving = segment.fromBlockId
			? getEnabledBlockConfig(tale, segment.fromBlockId)
			: null;
		return leaving?.leavingSpeed ?? fallback;
	}
	return getEnabledBlockConfig(tale, segment.blockId)?.readingSpeed ?? fallback;
}

/** Resolves an autoplay-only pause at a boundary between timeline segments. */
export function resolveAutoplayBoundaryPauseSeconds(
	tale: Tale,
	segment: TimelineSegment,
	nextSegment: TimelineSegment,
): number {
	if (nextSegment.type === "transition" && nextSegment.fromBlockId) {
		return (
			getEnabledBlockConfig(tale, nextSegment.fromBlockId)
				?.pauseBeforeLeavingSeconds ?? 0
		);
	}
	if (segment.type === "transition") {
		return (
			getEnabledBlockConfig(tale, segment.toBlockId)
				?.pauseAfterEnteringSeconds ?? 0
		);
	}
	return 0;
}

function getEnabledBlockConfig(
	tale: Tale,
	blockId: string,
): TaleBlockAutoplayConfig | null {
	const config = tale.indexMap.blocksById[blockId]?.autoplay;
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
