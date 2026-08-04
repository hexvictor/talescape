import type {
	AnimationPreset,
	BlockStylePreset,
	Direction,
	ReaderStyle,
	TransitionPreset,
	VisibilityPreset,
} from "~/app/(tale-app)/_shared/types";
import type { BlockFlow } from "~/server/db/types/tale-reader/readerConfig";
import { type PresetSource, presetKey } from "./presetKeys";

/**
 * Formats animation preset rows from either official or creator sources.
 *
 * @param rows - Animation preset rows.
 * @param source - Preset source namespace.
 * @returns Reader animation presets.
 *
 * @example
 * const presets = formatAnimationPresets(record.animationPresets, "creator");
 */
export function formatAnimationPresets(
	rows: unknown[],
	source: PresetSource,
): AnimationPreset[] {
	return rows.map((row) => {
		const item = row as {
			id: number;
			name: string;
			sortOrder?: number;
			target: AnimationPreset["target"];
			tracks: AnimationPreset["tracks"];
		};
		return {
			id: presetKey(source, item.id),
			name: item.name,
			source,
			target: item.target,
			tracks: item.tracks ?? [],
		};
	});
}

/**
 * Formats visibility preset rows from either official or creator sources.
 *
 * @param rows - Visibility preset rows.
 * @param source - Preset source namespace.
 * @returns Reader visibility presets.
 *
 * @example
 * const presets = formatVisibilityPresets(record.visibilityPresets, "creator");
 */
export function formatVisibilityPresets(
	rows: unknown[],
	source: PresetSource,
): VisibilityPreset[] {
	return rows.map((row) => {
		const item = row as {
			id: number;
			name: string;
			range: VisibilityPreset["range"];
		};
		return {
			id: presetKey(source, item.id),
			name: item.name,
			range: item.range,
			source,
		};
	});
}

/**
 * Formats transition preset rows from either official or creator sources.
 *
 * @param rows - Transition preset rows.
 * @param source - Preset source namespace.
 * @returns Reader transition presets.
 *
 * @example
 * const presets = formatTransitionPresets(record.transitionPresets, "creator");
 */
export function formatTransitionPresets(
	rows: unknown[],
	source: PresetSource,
): TransitionPreset[] {
	return rows.map((row) => {
		const item = row as {
			enteringAnimationPresetIds?: number[];
			flowConfig: BlockFlow;
			id: number;
			leavingAnimationPresetIds?: number[];
			name: string;
		};
		return {
			enteringAnimationPresetIds:
				item.enteringAnimationPresetIds?.map((id) => presetKey(source, id)) ??
				[],
			flow: normalizeFlow(item.flowConfig),
			id: presetKey(source, item.id),
			leavingAnimationPresetIds:
				item.leavingAnimationPresetIds?.map((id) => presetKey(source, id)) ??
				[],
			name: item.name,
			source,
		};
	});
}

/**
 * Formats style preset rows from either official or creator sources.
 *
 * @param rows - Style preset rows.
 * @param source - Preset source namespace.
 * @returns Reader style presets.
 *
 * @example
 * const presets = formatStylePresets(record.stylePresets, "creator");
 */
export function formatStylePresets(
	rows: unknown[],
	source: PresetSource,
): BlockStylePreset[] {
	return rows.map((row) => {
		const item = row as {
			id: number;
			name: string;
			styleConfig: ReaderStyle;
			target?: BlockStylePreset["target"];
		};
		return {
			id: presetKey(source, item.id),
			name: item.name,
			source,
			style: item.styleConfig ?? {},
			target: item.target ?? "both",
		};
	});
}

/**
 * Normalizes database block flow into the frontend transition flow type.
 *
 * @param flow - Database transition flow config.
 * @returns Reader transition flow.
 *
 * @example
 * const flow = normalizeFlow(row.flowConfig);
 */
function normalizeFlow(flow: BlockFlow): TransitionPreset["flow"] {
	return flow.type === "stack"
		? flow
		: {
				...flow,
				direction: flow.direction as Direction,
			};
}
