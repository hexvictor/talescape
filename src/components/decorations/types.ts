export const decorationPositions = [
	"top-left",
	"top-center",
	"top-right",
	"center-left",
	"center",
	"center-right",
	"bottom-left",
	"bottom-center",
	"bottom-right",
	"top",
	"right",
	"bottom",
	"left",
] as const;

export type DecorationPosition = (typeof decorationPositions)[number];

export const decorationColorTokens = [
	"neutral",
	"foreground",
	"cyan",
	"magenta",
	"yellow",
	"green",
	"primary",
	"secondary",
	"accent",
] as const;

export type DecorationColorToken = (typeof decorationColorTokens)[number];
export type DecorationColor = DecorationColorToken | (string & {});
export type DecorationViewport = "all" | "desktop" | "mobile";
export type DecorationDensity =
	| "minimal"
	| "sparse"
	| "airy"
	| "medium"
	| "dense"
	| "packed";
export type DecorationDirection =
	| "right"
	| "left"
	| "up"
	| "down"
	| "down-left"
	| "down-right"
	| "up-left"
	| "up-right";

export type DecorationBase = {
	/** Intrinsic width-to-height ratio. Parent proportions never distort it. */
	aspectRatio?: number;
	className?: string;
	color?: DecorationColor;
	/** Unbounded parent-width multiplier; height follows the intrinsic ratio. */
	coverage?: number;
	opacity?: number;
	/** Offset from the selected parent anchor. */
	offsetX?: number;
	offsetY?: number;
	offsetUnit?: "percent" | "px";
	position?: DecorationPosition;
	rotation?: number;
	scale?: number;
	viewport?: DecorationViewport;
};

export type HalftoneShape =
	| "circle"
	| "field"
	| "random"
	| "rectangle"
	| "speed-lines"
	| "triangle"
	| "vignette";

export type HalftoneDecoration = DecorationBase & {
	type: "halftone";
	decayMode?: "both" | "opacity" | "size";
	density?: DecorationDensity;
	dotSize?: number;
	falloff?: number;
	/** Growth origin within the shape, independent of its parent anchor. */
	decayOrigin?: DecorationPosition;
	minimumOpacity?: number;
	shape?: HalftoneShape;
	spacing?: number;
	variant?: "bold" | "classic" | "distressed" | "soft";
};

export type SpeedLineVariant =
	| "brush"
	| "electric"
	| "fan"
	| "laser"
	| "radial"
	| "shards"
	| "tapered"
	| "velocity";

export type SpeedLineShape =
	| "circle"
	| "field"
	| "rectangle"
	| "square"
	| "triangle"
	| "vignette";

export type SpeedLinesDecoration = DecorationBase & {
	type: "speed-lines";
	/** Angular offset in degrees from direction. */
	angle?: number;
	seed?: number;
	/** Random width/opacity variation along each line, from 0 to 1. */
	modulation?: number;
	modulationSegments?: number;
	density?: DecorationDensity;
	direction?: DecorationDirection;
	endOpacity?: number;
	endWidth?: number;
	jitter?: number;
	length?: number;
	originOpacity?: number;
	originRadius?: number;
	quantity?: number;
	shape?: SpeedLineShape;
	shapeMode?: "inside" | "outside";
	spread?: number;
	startOpacity?: number;
	startWidth?: number;
	strokeWidth?: number;
	vignetteFeather?: number;
	vignetteRadius?: number;
	variant?: SpeedLineVariant;
};

export type AccentStreakVariant =
	| "fracture"
	| "ink"
	| "comet"
	| "brush"
	| "burst"
	| "cracks"
	| "dry-brush"
	| "lightning"
	| "slashes"
	| "splatter"
	| "splash"
	| "underline";

export type AccentStreakDecoration = DecorationBase & {
	type: "accent-streak";
	/** Angular offset in degrees from direction. */
	angle?: number;
	seed?: number;
	stretch?: number;
	roughness?: number;
	branching?: number;
	density?: DecorationDensity;
	direction?: DecorationDirection;
	length?: number;
	quantity?: number;
	splatter?: number;
	thickness?: number;
	variant?: AccentStreakVariant;
};

export type Decoration =
	| HalftoneDecoration
	| SpeedLinesDecoration
	| AccentStreakDecoration
	| BackgroundTextureDecoration
	| GeometricDecoration
	| CircularLineworkDecoration;

export type BackgroundTextureDecoration = DecorationBase & {
	type: "background-texture";
	variant?: "paper" | "grain" | "grunge" | "scratches" | "scuffs" | "wear";
	density?: DecorationDensity;
	seed?: number;
	/** Repeating tile size in CSS pixels, independent of parent dimensions. */
	tileSize?: number;
	grainSize?: number;
	roughness?: number;
	angle?: number;
};

export type GeometricDecoration = DecorationBase & {
	type: "geometric";
	shape?:
		| "triangle"
		| "square"
		| "rectangle"
		| "diamond"
		| "parallelogram"
		| "chevron"
		| "corner-cut"
		| "notched-frame"
		| "stripes"
		| "cross-grid";
	fill?: "solid" | "outline";
	quantity?: number;
	spacing?: number;
	strokeWidth?: number;
	cut?: number;
};

export type CircularLineworkDecoration = DecorationBase & {
	type: "circular-linework";
	variant?: "open-arc" | "broken-ring" | "concentric" | "sweep";
	quantity?: number;
	spacing?: number;
	strokeWidth?: number;
	arc?: number;
	jitter?: number;
	seed?: number;
};

export const decorationKinds = [
	"halftone",
	"speed-lines",
	"accent-streak",
	"background-texture",
	"geometric",
	"circular-linework",
] as const;

export const decorationPresets = [
	"button-halftone",
	"button-halftone-light",
	"button-halftone-magenta",
	"button-halftone-yellow",
	"button-ink",
	"panel-cyan",
	"panel-magenta",
	"panel-yellow",
	"image-home",
	"image-library",
	"image-auth",
	"site-background",
	"paper-subtle",
	"paper-grunge",
	"graphic-corners",
	"editorial-texture",
	"brush-halftone",
	"technical-linework",
	"page-subtle",
	"page-editorial",
	"page-energetic",
	"panel",
	"panel-selected",
	"image-accent",
	"hero-cyan",
	"hero-magenta",
	"hero-yellow",
	"cyan-corner",
	"magenta-corner",
	"yellow-corner",
	"halftone-corner",
	"speed-accent",
	"discover",
	"library",
	"codex",
	"detail",
	"form",
	"auth",
	"reader",
] as const;

export type DecorationPreset = (typeof decorationPresets)[number];
export const buttonDecorationPresets = [
	"button-halftone",
	"button-halftone-light",
	"button-halftone-magenta",
	"button-halftone-yellow",
	"button-ink",
	"halftone-corner",
] as const;
export type ButtonDecorationPreset = (typeof buttonDecorationPresets)[number];
export const panelPresetOptions = [
	"selected",
	"subtle",
	"panel-cyan",
	"panel-magenta",
	"panel-yellow",
	"paper-subtle",
	"halftone-corner",
	"brush-halftone",
] as const;
export type PanelDecorationPreset = (typeof panelPresetOptions)[number];
export type CardDecorationPreset =
	| "accent-cyan"
	| "accent-magenta"
	| "accent-yellow"
	| "selected"
	| "subtle";
export const imageDecorationPresets = [
	"image-accent",
	"image-home",
	"image-library",
	"image-auth",
	"cyan-corner",
	"halftone-corner",
	"magenta-corner",
	"speed-accent",
	"yellow-corner",
] as const;
export type MediaDecorationPreset = (typeof imageDecorationPresets)[number];
export const pageDecorationPresets = [
	"site-background",
	"page-subtle",
	"page-editorial",
	"page-energetic",
	"discover",
	"library",
	"codex",
	"detail",
	"form",
	"auth",
	"reader",
] as const;
export type PageDecorationPreset = (typeof pageDecorationPresets)[number];

export type DecorationInput = DecorationPreset | Decoration[];
