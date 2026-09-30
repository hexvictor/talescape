import { useId, type CSSProperties } from "react";
import cn from "~/lib/utils/cn";
import type {
	AccentStreakDecoration,
	CircularLineworkDecoration,
	DecorationBase,
	GeometricShapeDecoration,
	HalftoneDecoration,
	PaperTextureDecoration,
	ScratchLinesDecoration,
	SpeedLinesDecoration,
} from "./types";

const decorationColors = {
	accent: "var(--accent)",
	cyan: "var(--ts-cyan)",
	foreground: "var(--foreground)",
	green: "var(--ts-green)",
	magenta: "var(--ts-pink)",
	neutral: "var(--ts-decoration-neutral)",
	primary: "var(--primary)",
	secondary: "var(--secondary)",
	yellow: "var(--ts-yellow)",
} as const;

type DecorationStyle = CSSProperties & {
	"--ts-decoration-color": string;
	"--ts-decoration-opacity": number;
	"--ts-decoration-rotation": string;
	"--ts-decoration-scale": number;
};

function resolveDecorationColor(color: DecorationBase["color"] = "neutral") {
	return color in decorationColors
		? decorationColors[color as keyof typeof decorationColors]
		: color;
}

function primitiveProps(
	type: string,
	{
		className,
		color,
		opacity = 1,
		position = "center",
		rotation = 0,
		scale = 1,
		viewport = "all",
	}: DecorationBase,
) {
	return {
		"aria-hidden": true,
		className: cn("ts-decoration", className),
		"data-decoration-position": position,
		"data-decoration-type": type,
		"data-decoration-viewport": viewport,
		focusable: false,
		style: {
			"--ts-decoration-color": resolveDecorationColor(color),
			"--ts-decoration-opacity": opacity,
			"--ts-decoration-rotation": `${rotation}deg`,
			"--ts-decoration-scale": scale,
		} as DecorationStyle,
	};
}

function directionTransform(
	direction: "down-left" | "down-right" | "up-left" | "up-right" = "down-right",
): string | undefined {
	if (direction === "down-left") return "translate(220 0) scale(-1 1)";
	if (direction === "up-right") return "translate(0 180) scale(1 -1)";
	if (direction === "up-left") return "translate(220 180) scale(-1 -1)";
	return undefined;
}

export type HalftoneProps = Omit<HalftoneDecoration, "type">;

export function Halftone({
	density = "medium",
	dotSize,
	spacing,
	variant = "fade",
	...props
}: HalftoneProps): React.JSX.Element {
	const id = useId().replaceAll(":", "");
	const resolvedSpacing =
		spacing ?? { airy: 18, dense: 8, medium: 12 }[density];
	const resolvedDotSize =
		dotSize ?? { airy: 2.1, dense: 2.8, medium: 2.4 }[density];
	const maskId = `halftone-mask-${id}`;
	const patternId = `halftone-pattern-${id}`;

	return (
		<svg
			{...primitiveProps("halftone", props)}
			data-decoration-variant={variant}
			viewBox="0 0 220 180"
		>
			<title>Decorative halftone pattern</title>
			<defs>
				<pattern
					height={resolvedSpacing}
					id={patternId}
					patternUnits="userSpaceOnUse"
					width={resolvedSpacing}
				>
					<circle
						cx={resolvedSpacing / 2}
						cy={resolvedSpacing / 2}
						fill="currentColor"
						r={resolvedDotSize}
					/>
				</pattern>
				<radialGradient
					cx={variant === "corner" ? "0" : "45%"}
					cy={variant === "corner" ? "100%" : "50%"}
					id={maskId}
					r="76%"
				>
					<stop offset="0" stopColor="white" />
					<stop
						offset={variant === "field" ? "0.9" : "0.32"}
						stopColor="white"
					/>
					<stop
						offset="1"
						stopColor={variant === "field" ? "white" : "black"}
					/>
				</radialGradient>
				<mask id={`${maskId}-mask`}>
					<rect fill={`url(#${maskId})`} height="180" width="220" />
				</mask>
			</defs>
			<rect
				fill={`url(#${patternId})`}
				height="180"
				mask={variant === "cluster" ? undefined : `url(#${maskId}-mask)`}
				width="220"
			/>
			{variant === "cluster" ? (
				<circle cx="188" cy="28" fill="currentColor" r="3.2" />
			) : null}
		</svg>
	);
}

const speedPathSets = {
	fine: [
		"M-20 158 L92 46",
		"M8 180 L130 58",
		"M48 180 L180 48",
		"M92 180 L226 46",
		"M136 180 L240 76",
		"M-10 116 L52 54",
		"M150 98 L220 28",
	],
	rough: [
		"M-24 166 L102 40",
		"M-8 180 L132 40",
		"M32 180 L170 42",
		"M74 180 L205 49",
		"M116 180 L238 58",
		"M-20 126 L50 56",
		"M142 100 L218 24",
		"M18 126 L98 46",
		"M88 130 L188 30",
	],
	sweeping: [
		"M-28 154 C38 144 82 88 126 18",
		"M-12 176 C62 156 114 104 170 18",
		"M42 190 C112 164 164 102 220 26",
		"M102 188 C158 152 194 108 238 54",
	],
} as const;

export type SpeedLinesProps = Omit<SpeedLinesDecoration, "type">;

export function SpeedLines({
	density = "medium",
	direction = "down-right",
	strokeWidth,
	variant = "rough",
	...props
}: SpeedLinesProps): React.JSX.Element {
	const baseWidth =
		strokeWidth ?? { airy: 1, dense: 2.5, medium: 1.6 }[density];
	const shared = primitiveProps("speed-lines", props);
	return (
		<svg {...shared} data-decoration-variant={variant} viewBox="0 0 220 180">
			<title>Decorative speed lines</title>
			<g
				fill="none"
				stroke="currentColor"
				strokeLinecap="square"
				transform={directionTransform(direction)}
			>
				{speedPathSets[variant].map((path, index) => (
					<path
						d={path}
						key={path}
						opacity={0.24 + (index % 3) * 0.26}
						strokeWidth={baseWidth + (index % 4) * 0.75}
					/>
				))}
			</g>
		</svg>
	);
}

const streakPaths = {
	brush: [
		"M-12 139 L76 42 L112 27 L98 43 L131 30 L49 119 L74 108 L21 158 Z",
		"M25 160 L137 34 L183 20 L166 40 L208 25 L82 151 L113 132 L65 170 Z",
		"M91 174 L198 53 L230 39 L214 61 L239 52 L131 171 Z",
		"M-14 170 L51 99 L72 94 L61 108 L87 99 L13 178 Z",
	],
	edge: [
		"M0 180 L0 112 L98 14 L132 10 L28 126 Z",
		"M18 180 L64 134 L142 58 L158 66 L48 180 Z",
	],
	slash: [
		"M34 180 L142 0 L188 0 L80 180 Z",
		"M98 180 L206 0 L224 0 L118 180 Z",
	],
	spray: [
		"M-12 150 L106 22 L144 16 L22 154 Z",
		"M38 170 L158 34 L214 22 L78 174 Z",
		"M118 180 L222 62 L238 66 L144 180 Z",
	],
} as const;

export type AccentStreakProps = Omit<AccentStreakDecoration, "type">;

export function AccentStreak({
	direction = "down-right",
	variant = "brush",
	...props
}: AccentStreakProps): React.JSX.Element {
	const shared = primitiveProps("accent-streak", props);
	return (
		<svg {...shared} data-decoration-variant={variant} viewBox="0 0 220 180">
			<title>Decorative accent streak</title>
			<g fill="currentColor" transform={directionTransform(direction)}>
				{streakPaths[variant].map((path, index) => (
					<path d={path} key={path} opacity={1 - index * 0.17} />
				))}
				{variant === "spray"
					? [
							[178, 122, 3],
							[194, 105, 2],
							[154, 145, 1.8],
							[210, 86, 1.4],
						].map(([cx, cy, r]) => (
							<circle cx={cx} cy={cy} key={`${cx}-${cy}`} r={r} />
						))
					: null}
			</g>
		</svg>
	);
}

export type ScratchLinesProps = Omit<ScratchLinesDecoration, "type">;

const scratchLineIds = [
	"scratch-a",
	"scratch-b",
	"scratch-c",
	"scratch-d",
	"scratch-e",
	"scratch-f",
	"scratch-g",
	"scratch-h",
	"scratch-i",
	"scratch-j",
	"scratch-k",
	"scratch-l",
] as const;

const crosshatchLineIds = [
	"crosshatch-a",
	"crosshatch-b",
	"crosshatch-c",
	"crosshatch-d",
	"crosshatch-e",
] as const;

export function ScratchLines({
	density = "medium",
	direction = "down-right",
	strokeWidth = 1,
	variant = "hairline",
	...props
}: ScratchLinesProps): React.JSX.Element {
	const shared = primitiveProps("scratch-lines", props);
	const count = { airy: 5, dense: 12, medium: 8 }[density];
	return (
		<svg {...shared} data-decoration-variant={variant} viewBox="0 0 220 180">
			<title>Decorative scratch lines</title>
			<g
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				transform={directionTransform(direction)}
			>
				{scratchLineIds.slice(0, count).map((id, index) => (
					<path
						d={`M${-20 + index * 22} ${170 - (index % 3) * 13} L${92 + index * 18} ${40 - (index % 4) * 6}`}
						key={id}
						opacity={0.2 + (index % 4) * 0.16}
						strokeDasharray={
							variant === "grunge"
								? `${20 + index * 2} ${5 + (index % 3) * 7}`
								: variant === "crosshatch"
									? "34 9"
									: undefined
						}
						strokeWidth={strokeWidth + (variant === "grunge" ? index % 3 : 0)}
					/>
				))}
				{variant === "crosshatch"
					? crosshatchLineIds.map((id, index) => (
							<path
								d={`M${18 + index * 38} 24 L${92 + index * 30} 128`}
								key={id}
								opacity="0.34"
								strokeWidth={strokeWidth}
							/>
						))
					: null}
			</g>
		</svg>
	);
}

export type CircularLineworkProps = Omit<CircularLineworkDecoration, "type">;

export function CircularLinework({
	strokeWidth = 1.2,
	variant = "contour",
	...props
}: CircularLineworkProps): React.JSX.Element {
	const radii =
		variant === "rings" ? [24, 40, 57, 74, 91] : [42, 58, 74, 90, 106];
	return (
		<svg
			{...primitiveProps("circular-linework", props)}
			data-decoration-variant={variant}
			viewBox="0 0 220 180"
		>
			<title>Decorative circular linework</title>
			<g fill="none" stroke="currentColor" strokeLinecap="round">
				{radii.map((radius, index) => (
					<circle
						cx={variant === "sweep" ? 30 : 188}
						cy={variant === "sweep" ? 168 : 18}
						key={radius}
						r={radius}
						strokeDasharray={
							variant === "rings"
								? undefined
								: `${90 + index * 18} ${48 + index * 11}`
						}
						strokeWidth={strokeWidth}
					/>
				))}
				{variant === "contour" ? (
					<path
						d="M-8 156 C48 118 76 126 116 82 C150 45 172 38 230 40"
						strokeWidth={strokeWidth * 0.8}
					/>
				) : null}
			</g>
		</svg>
	);
}

export type GeometricShapesProps = Omit<GeometricShapeDecoration, "type">;

export function GeometricShapes({
	strokeWidth = 2,
	variant = "corner-cut",
	...props
}: GeometricShapesProps): React.JSX.Element {
	return (
		<svg
			{...primitiveProps("geometric-shape", props)}
			data-decoration-variant={variant}
			viewBox="0 0 220 180"
		>
			<title>Decorative geometric shapes</title>
			{variant === "corner-cut" ? (
				<path d="M0 180 L0 100 L82 180 Z" fill="currentColor" />
			) : null}
			{variant === "angle" ? (
				<path d="M18 152 L122 18 H202 L98 152 Z" fill="currentColor" />
			) : null}
			{variant === "block" ? (
				<path d="M34 30 H202 V92 L118 176 H34 Z" fill="currentColor" />
			) : null}
			{variant === "slashes" ? (
				<g fill="currentColor">
					<path d="M22 156 L116 22 H150 L56 156 Z" />
					<path d="M84 156 L178 22 H198 L104 156 Z" opacity="0.56" />
				</g>
			) : null}
			{variant === "frame" ? (
				<path
					d="M20 150 V28 H196 M20 150 H152"
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
				/>
			) : null}
		</svg>
	);
}

export type PaperTextureProps = Omit<PaperTextureDecoration, "type">;

export function PaperTexture({
	density = "medium",
	variant = "grain",
	...props
}: PaperTextureProps): React.JSX.Element {
	const id = useId().replaceAll(":", "");
	const frequency = { airy: 0.35, dense: 0.95, medium: 0.62 }[density];
	return (
		<svg
			{...primitiveProps("paper-texture", props)}
			data-decoration-variant={variant}
			preserveAspectRatio="none"
			viewBox="0 0 220 180"
		>
			<title>Decorative paper texture</title>
			<filter id={`paper-${id}`} x="-10%" y="-10%" width="120%" height="120%">
				<feTurbulence
					baseFrequency={
						variant === "fibers"
							? `${frequency * 0.08} ${frequency}`
							: frequency
					}
					numOctaves={variant === "print" ? 2 : 3}
					seed={variant === "print" ? 17 : 8}
					type="fractalNoise"
				/>
				<feColorMatrix type="saturate" values="0" />
			</filter>
			<rect
				fill="currentColor"
				filter={`url(#paper-${id})`}
				height="180"
				opacity={variant === "print" ? 0.28 : 0.2}
				width="220"
			/>
		</svg>
	);
}
