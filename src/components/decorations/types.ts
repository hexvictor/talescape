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

export type DecorationBase = {
	className?: string;
	color?: DecorationColor;
	opacity?: number;
	position?: DecorationPosition;
	rotation?: number;
	scale?: number;
	viewport?: DecorationViewport;
};

export type HalftoneDecoration = DecorationBase & {
	type: "halftone";
	density?: "airy" | "dense" | "medium";
	dotSize?: number;
	spacing?: number;
	variant?: "cluster" | "corner" | "fade" | "field";
};

export type SpeedLinesDecoration = DecorationBase & {
	type: "speed-lines";
	density?: "airy" | "dense" | "medium";
	direction?: "down-left" | "down-right" | "up-left" | "up-right";
	strokeWidth?: number;
	variant?: "fine" | "rough" | "sweeping";
};

export type AccentStreakDecoration = DecorationBase & {
	type: "accent-streak";
	direction?: "down-left" | "down-right" | "up-left" | "up-right";
	variant?: "brush" | "edge" | "slash" | "spray";
};

export type ScratchLinesDecoration = DecorationBase & {
	type: "scratch-lines";
	density?: "airy" | "dense" | "medium";
	direction?: "down-left" | "down-right" | "up-left" | "up-right";
	strokeWidth?: number;
	variant?: "crosshatch" | "grunge" | "hairline";
};

export type CircularLineworkDecoration = DecorationBase & {
	strokeWidth?: number;
	type: "circular-linework";
	variant?: "contour" | "rings" | "sweep";
};

export type GeometricShapeDecoration = DecorationBase & {
	strokeWidth?: number;
	type: "geometric-shape";
	variant?: "angle" | "block" | "corner-cut" | "frame" | "slashes";
};

export type PaperTextureDecoration = DecorationBase & {
	density?: "airy" | "dense" | "medium";
	type: "paper-texture";
	variant?: "fibers" | "grain" | "print";
};

export type Decoration =
	| HalftoneDecoration
	| SpeedLinesDecoration
	| AccentStreakDecoration
	| ScratchLinesDecoration
	| CircularLineworkDecoration
	| GeometricShapeDecoration
	| PaperTextureDecoration;

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
