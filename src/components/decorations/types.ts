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
	| "down-left"
	| "down-right"
	| "up-left"
	| "up-right";

export type DecorationBase = {
	/** Intrinsic width-to-height ratio. Parent proportions never distort it. */
	aspectRatio?: number;
	className?: string;
	color?: DecorationColor;
	/** Fraction of each parent dimension occupied by the decoration. */
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
	angle?: number;
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
	angle?: number;
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
	| AccentStreakDecoration;

export const decorationPresets = [
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
export type PanelDecorationPreset = "selected" | "subtle";
export type CardDecorationPreset =
	| "accent-cyan"
	| "accent-magenta"
	| "accent-yellow"
	| "selected"
	| "subtle";
export type MediaDecorationPreset =
	| "cyan-corner"
	| "halftone-corner"
	| "magenta-corner"
	| "speed-accent"
	| "yellow-corner";

export type DecorationInput = DecorationPreset | Decoration[];
