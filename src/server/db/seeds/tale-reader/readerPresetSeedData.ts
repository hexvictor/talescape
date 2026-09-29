import type {
	AnimationTrack,
	PresetTarget,
	ReaderStyleConfig,
	SceneFlow,
	TimelineRange,
} from "~/server/db/types/tale-reader/readerConfig";

export type AnimationPresetSeed = {
	name: string;
	target: PresetTarget;
	tracks: AnimationTrack[];
};

export type TransitionPresetSeed = {
	enteringAnimationPresetIndexes: number[];
	flow: SceneFlow;
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
		name: "Pulse",
		target: "both",
		tracks: [
			{
				end: 1,
				from: 1,
				loopDurationSeconds: 1.2,
				loopPlayback: "alternate",
				property: "scale",
				start: 0,
				to: 1.08,
			},
		],
	},
	{
		name: "Rotate",
		target: "both",
		tracks: [
			{
				end: 1,
				from: 0,
				loopDurationSeconds: 3,
				loopPlayback: "restart",
				property: "rotate",
				start: 0,
				to: 360,
			},
		],
	},
	{
		name: "Slide in from right",
		target: "both",
		tracks: [
			{ end: 1, from: 0, property: "opacity", start: 0, to: 1 },
			{
				axis: "x",
				easing: "power3.out",
				end: 1,
				from: 120,
				property: "translate",
				start: 0,
				to: 0,
				unit: "px",
			},
		],
	},
	{
		name: "Slide out to right",
		target: "both",
		tracks: [
			{ end: 1, from: 1, property: "opacity", start: 0, to: 0 },
			{
				axis: "x",
				easing: "power2.in",
				end: 1,
				from: 0,
				property: "translate",
				start: 0,
				to: 120,
				unit: "px",
			},
		],
	},
	{
		name: "Slide in from left",
		target: "both",
		tracks: [
			{ end: 1, from: 0, property: "opacity", start: 0, to: 1 },
			{
				axis: "x",
				easing: "power3.out",
				end: 1,
				from: -120,
				property: "translate",
				start: 0,
				to: 0,
				unit: "px",
			},
		],
	},
	{
		name: "Slide out to left",
		target: "both",
		tracks: [
			{ end: 1, from: 1, property: "opacity", start: 0, to: 0 },
			{
				axis: "x",
				easing: "power2.in",
				end: 1,
				from: 0,
				property: "translate",
				start: 0,
				to: -120,
				unit: "px",
			},
		],
	},
	{
		name: "Rise in",
		target: "both",
		tracks: [
			{ end: 1, from: 0, property: "opacity", start: 0, to: 1 },
			{
				axis: "y",
				easing: "power3.out",
				end: 1,
				from: 72,
				property: "translate",
				start: 0,
				to: 0,
				unit: "px",
			},
		],
	},
	{
		name: "Drop out",
		target: "both",
		tracks: [
			{ end: 1, from: 1, property: "opacity", start: 0, to: 0 },
			{
				axis: "y",
				easing: "power2.in",
				end: 1,
				from: 0,
				property: "translate",
				start: 0,
				to: 72,
				unit: "px",
			},
		],
	},
	{
		name: "Rotate in",
		target: "both",
		tracks: [
			{ end: 1, from: 0, property: "opacity", start: 0, to: 1 },
			{
				easing: "back.out",
				end: 1,
				from: -12,
				property: "rotate",
				start: 0,
				to: 0,
			},
			{
				easing: "back.out",
				end: 1,
				from: 0.94,
				property: "scale",
				start: 0,
				to: 1,
			},
		],
	},
	{
		name: "Rotate out",
		target: "both",
		tracks: [
			{ end: 1, from: 1, property: "opacity", start: 0, to: 0 },
			{
				easing: "power2.in",
				end: 1,
				from: 0,
				property: "rotate",
				start: 0,
				to: 14,
			},
			{
				easing: "power2.in",
				end: 1,
				from: 1,
				property: "scale",
				start: 0,
				to: 0.92,
			},
		],
	},
	{
		name: "Gentle float",
		target: "both",
		tracks: [
			{
				axis: "y",
				end: 1,
				from: -8,
				loopDurationSeconds: 2.6,
				loopPlayback: "alternate",
				property: "translate",
				start: 0,
				to: 8,
				unit: "px",
			},
		],
	},
	{
		name: "Slow tilt",
		target: "both",
		tracks: [
			{
				end: 1,
				from: -2,
				loopDurationSeconds: 3.4,
				loopPlayback: "alternate",
				property: "rotate",
				start: 0,
				to: 2,
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
