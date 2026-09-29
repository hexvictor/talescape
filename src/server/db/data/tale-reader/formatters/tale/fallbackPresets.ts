import type {
	AnimationPreset,
	RawTaleRecord,
} from "~/app/(tale-app)/_shared/types";

const builtinAnimationPresets: AnimationPreset[] = [
	{
		id: "official:animation-fade-in",
		name: "Fade In",
		source: "official",
		target: "both",
		tracks: [{ end: 1, from: 0, property: "opacity", start: 0, to: 1 }],
	},
	{
		id: "official:animation-fade-out",
		name: "Fade Out",
		source: "official",
		target: "both",
		tracks: [{ end: 1, from: 1, property: "opacity", start: 0, to: 0 }],
	},
	{
		id: "official:animation-pulse",
		name: "Pulse",
		source: "official",
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
		id: "official:animation-rotate",
		name: "Rotate",
		source: "official",
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
		id: "official:animation-slide-in-right",
		name: "Slide in from right",
		source: "official",
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
		id: "official:animation-slide-out-right",
		name: "Slide out to right",
		source: "official",
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
		id: "official:animation-slide-in-left",
		name: "Slide in from left",
		source: "official",
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
		id: "official:animation-slide-out-left",
		name: "Slide out to left",
		source: "official",
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
		id: "official:animation-rise-in",
		name: "Rise in",
		source: "official",
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
		id: "official:animation-drop-out",
		name: "Drop out",
		source: "official",
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
		id: "official:animation-rotate-in",
		name: "Rotate in",
		source: "official",
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
		id: "official:animation-rotate-out",
		name: "Rotate out",
		source: "official",
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
		id: "official:animation-gentle-float",
		name: "Gentle float",
		source: "official",
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
		id: "official:animation-slow-tilt",
		name: "Slow tilt",
		source: "official",
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

/**
 * Adds minimum official presets when the database has no preset rows yet.
 *
 * @param raw - Raw tale record formatted from database rows.
 * @returns The same raw tale with fallback preset collections populated.
 *
 * @example
 * const tale = formatTale(withFallbackPresets(raw));
 */
export function withFallbackPresets(raw: RawTaleRecord): RawTaleRecord {
	return {
		...raw,
		animationPresets: mergeBuiltinAnimationPresets(raw.animationPresets),
		sceneStylePresets: raw.sceneStylePresets.length
			? raw.sceneStylePresets
			: [
					{
						id: "official:style-default",
						name: "Default",
						source: "official",
						style: { backgroundCss: "#14100c" },
						target: "both",
					},
				],
		transitionPresets: raw.transitionPresets.length
			? raw.transitionPresets
			: [
					{
						enteringAnimationPresetIds: [],
						flow: { direction: "down", type: "linear" },
						id: "official:transition-scroll-down",
						leavingAnimationPresetIds: [],
						name: "Scroll Down",
						source: "official",
					},
				],
		visibilityPresets: raw.visibilityPresets.length
			? raw.visibilityPresets
			: [
					{
						id: "official:visibility-entire-block",
						name: "Entire Scene",
						range: { end: 1, start: 0 },
						source: "official",
					},
				],
	};
}

function mergeBuiltinAnimationPresets(
	presets: AnimationPreset[],
): AnimationPreset[] {
	const existingNames = new Set(presets.map((preset) => preset.name));
	const existingIds = new Set(presets.map((preset) => preset.id));
	return [
		...presets,
		...builtinAnimationPresets.filter(
			(preset) =>
				!existingIds.has(preset.id) && !existingNames.has(preset.name),
		),
	];
}
