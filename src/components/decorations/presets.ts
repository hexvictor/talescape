import type {
	CardDecorationPreset,
	Decoration,
	DecorationPreset,
	PanelDecorationPreset,
} from "./types";

const pageHalftone: Decoration = {
	color: "neutral",
	coverage: 0.42,
	density: "airy",
	opacity: 0.1,
	position: "bottom-left",
	shape: "circle",
	type: "halftone",
	variant: "soft",
};

const pageSpeedLines: Decoration = {
	color: "neutral",
	coverage: 0.64,
	density: "airy",
	opacity: 0.09,
	position: "top-right",
	type: "speed-lines",
	variant: "tapered",
};

function cornerAccent(color: "cyan" | "magenta" | "yellow"): Decoration[] {
	return [
		{
			aspectRatio: 3.2,
			color,
			coverage: 1.3,
			length: 0.92,
			opacity: 0.82,
			offsetX: 18,
			offsetY: -24,
			position: "bottom-left",
			quantity: 4,
			splatter: 0.5,
			thickness: 92,
			type: "accent-streak",
			variant: "brush",
		},
		{
			color,
			coverage: 0.86,
			density: "medium",
			opacity: 0.42,
			offsetX: 8,
			offsetY: -12,
			position: "bottom-left",
			shape: "circle",
			type: "halftone",
			variant: "soft",
		},
	];
}

function heroAccent(color: "cyan" | "magenta" | "yellow"): Decoration[] {
	return [
		{
			color,
			coverage: 0.5,
			opacity: 0.68,
			position: "top-right",
			rotation: -4,
			type: "accent-streak",
			variant: "brush",
		},
		{
			color,
			coverage: 0.46,
			density: "airy",
			opacity: 0.22,
			position: "bottom-left",
			shape: "circle",
			type: "halftone",
			variant: "soft",
		},
	];
}

export const decorationPresetItems: Record<DecorationPreset, Decoration[]> = {
	"page-subtle": [pageSpeedLines, pageHalftone],
	"page-editorial": [
		{ ...pageSpeedLines, opacity: 0.11 },
		{ ...pageHalftone, opacity: 0.12 },
	],
	"page-energetic": [
		{ ...pageSpeedLines, color: "foreground", opacity: 0.1 },
		{ ...pageHalftone, color: "foreground", opacity: 0.12 },
		{
			color: "cyan",
			coverage: 0.48,
			opacity: 0.58,
			position: "top-right",
			type: "accent-streak",
			variant: "brush",
		},
		{
			color: "magenta",
			coverage: 0.42,
			opacity: 0.52,
			position: "bottom-left",
			type: "accent-streak",
			variant: "brush",
		},
	],
	panel: [
		{
			color: "neutral",
			coverage: 0.82,
			density: "airy",
			opacity: 0.16,
			offsetX: -10,
			offsetY: 14,
			position: "top-right",
			shape: "circle",
			type: "halftone",
			variant: "soft",
		},
		{
			angle: 154,
			aspectRatio: 2.4,
			color: "neutral",
			coverage: 1.05,
			density: "sparse",
			endOpacity: 0,
			opacity: 0.12,
			offsetX: -12,
			offsetY: 15,
			position: "top-right",
			startOpacity: 0.8,
			type: "speed-lines",
			variant: "tapered",
		},
	],
	"panel-selected": [
		{
			color: "primary",
			coverage: 0.92,
			density: "medium",
			opacity: 0.36,
			offsetX: -8,
			offsetY: -10,
			position: "bottom-right",
			shape: "circle",
			type: "halftone",
			variant: "classic",
		},
		{
			aspectRatio: 3.2,
			color: "primary",
			coverage: 1.3,
			length: 0.92,
			opacity: 0.84,
			offsetX: -18,
			offsetY: 24,
			position: "top-right",
			quantity: 4,
			splatter: 0.52,
			thickness: 94,
			type: "accent-streak",
			variant: "brush",
		},
	],
	"image-accent": cornerAccent("cyan"),
	"hero-cyan": heroAccent("cyan"),
	"hero-magenta": heroAccent("magenta"),
	"hero-yellow": heroAccent("yellow"),
	"cyan-corner": cornerAccent("cyan"),
	"magenta-corner": cornerAccent("magenta"),
	"yellow-corner": cornerAccent("yellow"),
	"halftone-corner": [
		{
			color: "foreground",
			coverage: 0.5,
			density: "medium",
			opacity: 0.46,
			position: "bottom-left",
			shape: "triangle",
			type: "halftone",
			variant: "classic",
		},
	],
	"speed-accent": [
		{
			color: "primary",
			coverage: 0.55,
			density: "airy",
			opacity: 0.42,
			position: "bottom-left",
			type: "speed-lines",
			variant: "tapered",
		},
	],
	discover: [
		pageSpeedLines,
		pageHalftone,
		{
			color: "cyan",
			coverage: 0.46,
			opacity: 0.58,
			position: "top-right",
			type: "accent-streak",
			variant: "brush",
			viewport: "desktop",
		},
		{
			color: "magenta",
			coverage: 0.42,
			opacity: 0.5,
			position: "bottom-left",
			type: "accent-streak",
			variant: "brush",
			viewport: "mobile",
		},
	],
	library: [
		pageSpeedLines,
		pageHalftone,
		{
			color: "yellow",
			coverage: 0.4,
			opacity: 0.48,
			position: "bottom-right",
			type: "accent-streak",
			variant: "brush",
			viewport: "mobile",
		},
	],
	codex: [
		{ ...pageSpeedLines, opacity: 0.1 },
		{ ...pageHalftone, opacity: 0.11 },
		{
			color: "magenta",
			coverage: 0.44,
			opacity: 0.56,
			position: "top-right",
			type: "accent-streak",
			variant: "brush",
		},
	],
	detail: [
		pageSpeedLines,
		pageHalftone,
		{
			color: "cyan",
			coverage: 0.42,
			opacity: 0.52,
			position: "top-left",
			type: "accent-streak",
			variant: "brush",
		},
	],
	form: [
		{ ...pageSpeedLines, opacity: 0.07 },
		{ ...pageHalftone, opacity: 0.07 },
	],
	auth: [
		{ ...pageSpeedLines, opacity: 0.07 },
		{ ...pageHalftone, opacity: 0.08 },
		{
			color: "magenta",
			coverage: 0.38,
			opacity: 0.46,
			position: "top-right",
			type: "accent-streak",
			variant: "brush",
		},
	],
	reader: [
		{ ...pageSpeedLines, opacity: 0.06 },
		{ ...pageHalftone, opacity: 0.06 },
	],
};

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
