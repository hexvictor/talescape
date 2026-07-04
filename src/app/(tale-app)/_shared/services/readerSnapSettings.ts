import type {
	TaleBlock,
	TaleBlockSnapConfig,
	TaleBlockSnapMode,
	TaleBlockSnapSettings,
	TaleSnapConfig,
	ViewportSize,
} from "../types";

export const defaultBlockSnapConfig: TaleBlockSnapConfig = {
	mode: "scroll-snap",
	settings: null,
};

export const defaultTaleSnapConfig: TaleSnapConfig = {
	scrollSnap: {
		captureDistancePx: 96,
		delayMs: 240,
		durationSeconds: 0.22,
		minViewportFraction: 0,
	},
	snap: {
		captureDistancePx: 96,
		delayMs: 0,
		durationSeconds: 0.22,
		minViewportFraction: 0,
	},
};

/**
 * Normalizes older boolean snap values and partial configs into the current shape.
 *
 * @param snap - Authored snap config or legacy boolean.
 * @returns Normalized block snap config.
 *
 * @example
 * const snap = normalizeBlockSnapConfig(row.transitionConfig?.snap);
 */
export function normalizeBlockSnapConfig(
	snap: boolean | Partial<TaleBlockSnapConfig> | null | undefined,
): TaleBlockSnapConfig {
	if (snap === false) return { mode: "snap-off", settings: null };
	if (snap === true || snap == null) return defaultBlockSnapConfig;
	if (
		snap.mode === "snap" ||
		snap.mode === "scroll-snap" ||
		snap.mode === "snap-off"
	) {
		return {
			mode: snap.mode,
			settings: snap.settings ?? null,
		};
	}
	return defaultBlockSnapConfig;
}

/**
 * Normalizes tale-level snap defaults loaded from persisted JSON.
 *
 * @param snapConfig - Partial persisted tale snap config.
 * @returns Complete tale snap defaults.
 *
 * @example
 * const snapConfig = normalizeTaleSnapConfig(row.snapConfig);
 */
export function normalizeTaleSnapConfig(
	snapConfig: Partial<TaleSnapConfig> | null | undefined,
): TaleSnapConfig {
	return {
		scrollSnap: {
			...defaultTaleSnapConfig.scrollSnap,
			...(snapConfig?.scrollSnap ?? {}),
		},
		snap: {
			...defaultTaleSnapConfig.snap,
			...(snapConfig?.snap ?? {}),
		},
	};
}

/**
 * Returns whether a block participates in any snap behavior.
 *
 * @param block - Tale block being evaluated.
 * @returns True when the block can snap.
 *
 * @example
 * if (isBlockSnapEnabled(block)) addSnapPoint(block);
 */
export function isBlockSnapEnabled(block: TaleBlock): boolean {
	return block.snap.mode !== "snap-off";
}

/**
 * Reads the authored snap mode for display and compilation.
 *
 * @param block - Tale block being evaluated.
 * @returns Authored snap behavior mode.
 *
 * @example
 * const mode = getBlockSnapMode(block);
 */
export function getBlockSnapMode(block: TaleBlock): TaleBlockSnapMode {
	return block.snap.mode;
}

/**
 * Resolves block-level snap settings over reader defaults.
 *
 * @param blockSettings - Optional block snap override.
 * @param defaults - Runtime reader snap defaults.
 * @param viewport - Current reader viewport.
 * @returns Effective snap timing and capture values.
 *
 * @example
 * const snap = resolveSnapSettings(block.snap.settings, defaults, viewport);
 */
export function resolveSnapSettings(
	blockSettings: TaleBlockSnapSettings | null | undefined,
	defaults: TaleBlockSnapSettings,
	viewport: ViewportSize,
): { capturePx: number; delayMs: number; durationSeconds: number } {
	const viewportMinimum =
		Math.min(viewport.width, viewport.height) *
		Math.max(blockSettings?.minViewportFraction ?? 0, 0);
	return {
		capturePx: Math.max(
			blockSettings?.captureDistancePx ?? defaults.captureDistancePx ?? 0,
			viewportMinimum,
		),
		delayMs: blockSettings?.delayMs ?? defaults.delayMs ?? 0,
		durationSeconds:
			blockSettings?.durationSeconds ?? defaults.durationSeconds ?? 0,
	};
}
