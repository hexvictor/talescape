import type {
	CardDecorationPreset,
	Decoration,
	DecorationPreset,
	PanelDecorationPreset,
} from "./types";

export const decorationPresetItems: Record<DecorationPreset, Decoration[]> = {
	"page-subtle": [
		{
			color: "neutral",
			opacity: 0.055,
			position: "top-right",
			type: "scratch-lines",
			variant: "hairline",
		},
		{
			color: "neutral",
			opacity: 0.07,
			position: "bottom-left",
			scale: 1.1,
			type: "halftone",
			variant: "fade",
		},
		{
			opacity: 0.28,
			position: "center",
			type: "paper-texture",
			variant: "grain",
		},
	] satisfies Decoration[],
	"page-editorial": [
		{
			color: "neutral",
			opacity: 0.08,
			position: "top-left",
			type: "halftone",
			variant: "corner",
		},
		{
			color: "neutral",
			opacity: 0.075,
			position: "bottom-right",
			scale: 1.25,
			type: "circular-linework",
			variant: "contour",
		},
		{
			color: "neutral",
			opacity: 0.05,
			position: "center",
			rotation: -5,
			type: "speed-lines",
			variant: "fine",
		},
		{
			opacity: 0.26,
			position: "center",
			type: "paper-texture",
			variant: "fibers",
		},
	] satisfies Decoration[],
	"page-energetic": [
		{
			color: "foreground",
			opacity: 0.12,
			position: "top-left",
			type: "halftone",
			variant: "cluster",
		},
		{
			color: "cyan",
			opacity: 0.9,
			position: "top-right",
			rotation: -4,
			type: "accent-streak",
			variant: "brush",
		},
		{
			color: "magenta",
			opacity: 0.86,
			position: "bottom-left",
			rotation: 4,
			type: "accent-streak",
			variant: "spray",
		},
		{
			color: "neutral",
			opacity: 0.07,
			position: "bottom-right",
			type: "circular-linework",
			variant: "sweep",
		},
	] satisfies Decoration[],
	panel: [
		{
			color: "neutral",
			opacity: 0.08,
			position: "bottom-right",
			scale: 0.8,
			type: "halftone",
			variant: "corner",
		},
	] satisfies Decoration[],
	"panel-selected": [
		{
			color: "primary",
			opacity: 0.38,
			position: "bottom-left",
			type: "halftone",
			variant: "corner",
		},
		{
			color: "primary",
			opacity: 0.9,
			position: "top-right",
			type: "geometric-shape",
			variant: "corner-cut",
		},
	] satisfies Decoration[],
	"image-accent": [
		{
			color: "primary",
			opacity: 0.85,
			position: "bottom-left",
			type: "halftone",
			variant: "corner",
		},
		{
			color: "primary",
			position: "bottom-left",
			type: "geometric-shape",
			variant: "corner-cut",
		},
	] satisfies Decoration[],
	"hero-cyan": [],
	"hero-magenta": [],
	"hero-yellow": [],
	"cyan-corner": [],
	"magenta-corner": [],
	"yellow-corner": [],
	"halftone-corner": [
		{
			color: "foreground",
			opacity: 0.62,
			position: "bottom-left",
			type: "halftone",
			variant: "corner",
		},
	] satisfies Decoration[],
	"speed-accent": [
		{
			color: "primary",
			opacity: 0.82,
			position: "bottom-left",
			type: "speed-lines",
			variant: "rough",
		},
	] satisfies Decoration[],
	discover: [],
	library: [],
	codex: [],
	detail: [],
	form: [],
	auth: [],
	reader: [],
};

const accentPreset = (color: "cyan" | "magenta" | "yellow"): Decoration[] => [
	{
		color,
		opacity: 0.92,
		position: "bottom-left",
		type: "halftone",
		variant: "corner",
	},
	{
		color,
		position: "bottom-left",
		type: "geometric-shape",
		variant: "corner-cut",
	},
];

decorationPresetItems["hero-cyan"] = [
	{
		color: "cyan",
		position: "top-right",
		type: "accent-streak",
		variant: "brush",
	},
	{
		color: "cyan",
		opacity: 0.5,
		position: "bottom-left",
		type: "halftone",
		variant: "fade",
	},
];
decorationPresetItems["hero-magenta"] = [
	{
		color: "magenta",
		position: "top-right",
		type: "accent-streak",
		variant: "brush",
	},
	{
		color: "magenta",
		opacity: 0.5,
		position: "bottom-left",
		type: "halftone",
		variant: "fade",
	},
];
decorationPresetItems["hero-yellow"] = [
	{
		color: "yellow",
		position: "top-right",
		type: "accent-streak",
		variant: "brush",
	},
	{
		color: "yellow",
		opacity: 0.5,
		position: "bottom-left",
		type: "halftone",
		variant: "fade",
	},
];
decorationPresetItems["cyan-corner"] = accentPreset("cyan");
decorationPresetItems["magenta-corner"] = accentPreset("magenta");
decorationPresetItems["yellow-corner"] = accentPreset("yellow");

decorationPresetItems.discover = [
	...decorationPresetItems["page-editorial"],
	{
		color: "cyan",
		opacity: 0.82,
		position: "top-right",
		type: "accent-streak",
		variant: "brush",
		viewport: "desktop",
	},
	{
		color: "magenta",
		opacity: 0.7,
		position: "bottom-left",
		type: "accent-streak",
		variant: "edge",
		viewport: "mobile",
	},
];
decorationPresetItems.library = [
	...decorationPresetItems["page-subtle"],
	{
		color: "neutral",
		opacity: 0.08,
		position: "top-right",
		type: "circular-linework",
		variant: "contour",
		viewport: "desktop",
	},
	{
		color: "yellow",
		opacity: 0.75,
		position: "bottom-right",
		type: "accent-streak",
		variant: "edge",
		viewport: "mobile",
	},
];
decorationPresetItems.codex = [
	...decorationPresetItems["page-editorial"],
	{
		color: "magenta",
		opacity: 0.78,
		position: "top-right",
		type: "accent-streak",
		variant: "spray",
	},
	{
		color: "foreground",
		opacity: 0.08,
		position: "bottom-left",
		type: "speed-lines",
		variant: "rough",
		viewport: "desktop",
	},
];
decorationPresetItems.detail = [
	...decorationPresetItems["page-editorial"],
	{
		color: "cyan",
		opacity: 0.7,
		position: "top-left",
		type: "accent-streak",
		variant: "slash",
	},
];
decorationPresetItems.form = [
	...decorationPresetItems["page-subtle"],
	{
		color: "foreground",
		opacity: 0.05,
		position: "top-right",
		type: "geometric-shape",
		variant: "slashes",
	},
];
decorationPresetItems.auth = [
	...decorationPresetItems["page-subtle"],
	{
		color: "magenta",
		opacity: 0.62,
		position: "top-right",
		type: "accent-streak",
		variant: "slash",
	},
];
decorationPresetItems.reader = [
	{
		color: "neutral",
		opacity: 0.06,
		position: "bottom-right",
		type: "halftone",
		variant: "fade",
	},
	{
		color: "neutral",
		opacity: 0.05,
		position: "top-left",
		type: "scratch-lines",
		variant: "hairline",
	},
];

export const panelDecorationPresets: Record<
	PanelDecorationPreset,
	DecorationPreset
> = {
	selected: "panel-selected",
	subtle: "panel",
};

export const cardDecorationPresets: Record<
	CardDecorationPreset,
	DecorationPreset
> = {
	"accent-cyan": "cyan-corner",
	"accent-magenta": "magenta-corner",
	"accent-yellow": "yellow-corner",
	selected: "panel-selected",
	subtle: "panel",
};

export function resolveDecorationItems(
	preset?: DecorationPreset,
	items: Decoration[] = [],
): Decoration[] {
	return preset ? [...decorationPresetItems[preset], ...items] : items;
}
