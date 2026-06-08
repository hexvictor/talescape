import type {
	AnimationTrack,
	BlockFlow,
	PresetTarget,
	ReaderStyleConfig,
	TimelineRange,
} from "~/server/db/types/tale-reader/readerConfig";

export type AnimationPresetSeed = {
	name: string;
	target: PresetTarget;
	tracks: AnimationTrack[];
};

export type TransitionPresetSeed = {
	enteringAnimationPresetIndexes: number[];
	flow: BlockFlow;
	leavingAnimationPresetIndexes: number[];
	name: string;
};

export type VisibilityPresetSeed = {
	name: string;
	range: TimelineRange;
};

export type StylePresetSeed = {
	name: string;
	styleConfig: ReaderStyleConfig;
	target: PresetTarget;
};

export const animationPresetSeeds: AnimationPresetSeed[] = [
	{
		name: "Fade in",
		target: "both",
		tracks: [{ end: 1, from: 0, property: "opacity", start: 0, to: 1 }],
	},
	{
		name: "Fade out",
		target: "both",
		tracks: [{ end: 1, from: 1, property: "opacity", start: 0, to: 0 }],
	},
	{
		name: "Rise",
		target: "both",
		tracks: [
			{
				axis: "y",
				end: 1,
				from: 48,
				property: "translate",
				start: 0,
				to: 0,
			},
		],
	},
	{
		name: "Drift left",
		target: "both",
		tracks: [
			{
				axis: "x",
				end: 1,
				from: 64,
				property: "translate",
				start: 0,
				to: 0,
			},
		],
	},
];

export const transitionPresetSeeds: TransitionPresetSeed[] = [
	transition("Slide right", "right"),
	transition("Slide down", "down"),
	transition("Slide left", "left"),
	transition("Slide up", "up"),
	{
		enteringAnimationPresetIndexes: [0],
		flow: { type: "stack" },
		leavingAnimationPresetIndexes: [1],
		name: "Stack fade",
	},
];

export const visibilityPresetSeeds: VisibilityPresetSeed[] = [
	{ name: "Entire block", range: { end: 1, start: 0 } },
	{ name: "Early", range: { end: 0.55, start: 0 } },
	{ name: "Late", range: { end: 1, start: 0.45 } },
];

export const stylePresetSeeds: StylePresetSeed[] = [
	{
		name: "Story page",
		styleConfig: {
			backgroundCss: "#15121a",
			color: "#f5f1e8",
			padding: "clamp(2rem, 6vw, 7rem)",
		},
		target: "block",
	},
	{
		name: "Framed fragment",
		styleConfig: {
			backgroundCss: "rgba(0, 0, 0, 0.48)",
			border: "1px solid rgba(255,255,255,0.14)",
			borderRadius: 6,
			padding: "1.25rem",
		},
		target: "fragment",
	},
];

/**
 * Creates a movement-only official transition template.
 *
 * @param name - Preset name.
 * @param direction - Linear flow direction.
 * @returns Transition template without opacity tracks.
 */
function transition(
	name: string,
	direction: "down" | "left" | "right" | "up",
): TransitionPresetSeed {
	return {
		enteringAnimationPresetIndexes: [],
		flow: {
			direction,
			spacing: { unit: "px", value: 0 },
			type: "linear",
		},
		leavingAnimationPresetIndexes: [],
		name,
	};
}
