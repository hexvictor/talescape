import { type CSSProperties, useId } from "react";
import cn from "~/lib/utils/cn";
import {
	accentGeometry,
	densityFactor,
	modulatedRibbon,
	modulationAt,
} from "./geometry";
import type {
	AccentStreakDecoration,
	DecorationBase,
	DecorationDensity,
	DecorationDirection,
	DecorationPosition,
	HalftoneDecoration,
	HalftoneShape,
	SpeedLineShape,
	SpeedLineVariant,
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
	"--ts-decoration-coverage": string;
	"--ts-decoration-offset-x": string;
	"--ts-decoration-offset-y": string;
	"--ts-decoration-opacity": number;
	"--ts-decoration-rotation": string;
	"--ts-decoration-scale": number;
};

function clamp(value: number, minimum: number, maximum: number): number {
	return Math.max(minimum, Math.min(maximum, value));
}

export function resolveDecorationColor(
	color: DecorationBase["color"] = "neutral",
) {
	return color in decorationColors
		? decorationColors[color as keyof typeof decorationColors]
		: color;
}

export function primitiveProps(
	type: string,
	{
		aspectRatio,
		className,
		color,
		coverage = 0.5,
		offsetX = 0,
		offsetY = 0,
		offsetUnit = "percent",
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
		"data-decoration-aspect-ratio": aspectRatio,
		"data-decoration-position": position,
		"data-decoration-type": type,
		"data-reader-component": (
			{
				halftone: "HalftoneDots",
				"speed-lines": "SpeedLines",
				"accent-streak": "AccentStreak",
				"background-texture": "BackgroundTexture",
				geometric: "GeometricShape",
				"circular-linework": "CircularLinework",
			} as Record<string, string>
		)[type],
		"data-reader-role": "decoration",
		"data-decoration-viewport": viewport,
		focusable: false,
		style: {
			aspectRatio: aspectRatio ?? 1,
			"--ts-decoration-color": resolveDecorationColor(color),
			"--ts-decoration-coverage": `${Math.max(0.05, coverage) * 100}%`,
			"--ts-decoration-offset-x": `${offsetX}${offsetUnit === "percent" ? "%" : "px"}`,
			"--ts-decoration-offset-y": `${offsetY}${offsetUnit === "percent" ? "%" : "px"}`,
			"--ts-decoration-opacity": opacity,
			"--ts-decoration-rotation": `${rotation}deg`,
			"--ts-decoration-scale": scale,
		} as DecorationStyle,
	};
}

function positionOrigin(position: DecorationPosition): [number, number] {
	switch (position) {
		case "top-left":
			return [0, 0];
		case "top-center":
		case "top":
			return [0.5, 0];
		case "top-right":
			return [1, 0];
		case "center-left":
		case "left":
			return [0, 0.5];
		case "center-right":
		case "right":
			return [1, 0.5];
		case "bottom-left":
			return [0, 1];
		case "bottom-center":
		case "bottom":
			return [0.5, 1];
		case "bottom-right":
			return [1, 1];
		case "center":
			return [0.5, 0.5];
	}
}

function seededNoise(x: number, y: number, seed = 0): number {
	const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
	return value - Math.floor(value);
}

function circlePath(cx: number, cy: number, radius: number): string {
	const left = cx - radius;
	const diameter = radius * 2;
	return `M${left.toFixed(2)} ${cy.toFixed(2)}a${radius.toFixed(2)} ${radius.toFixed(2)} 0 1 0 ${diameter.toFixed(2)} 0a${radius.toFixed(2)} ${radius.toFixed(2)} 0 1 0 -${diameter.toFixed(2)} 0`;
}

function directionAngle(direction: DecorationDirection): number {
	switch (direction) {
		case "right":
			return 0;
		case "left":
			return 180;
		case "up":
			return -90;
		case "down":
			return 90;
		case "down-right":
			return 28;
		case "down-left":
			return 152;
		case "up-right":
			return -28;
		case "up-left":
			return 208;
	}
}

function intrinsicCanvas(aspectRatio: number | undefined, fallback: number) {
	const height = 600;
	return { height, width: height * clamp(aspectRatio ?? fallback, 0.1, 20) };
}

function halftoneInfluence(
	shape: HalftoneShape,
	x: number,
	y: number,
	originX: number,
	originY: number,
	falloff: number,
	width: number,
	height: number,
): number {
	if (shape === "field") return 1;
	const centerDistance = Math.hypot(x - width / 2, y - height / 2);
	const centerRadius = Math.max(1, Math.min(width, height) / 2);
	if (shape === "vignette") {
		return clamp((centerDistance / centerRadius - 0.28) / 0.72, 0, 1);
	}

	const originPxX = originX * width;
	const originPxY = originY * height;
	const dx = Math.abs(x - originPxX);
	const dy = Math.abs(y - originPxY);
	const maxDx = Math.max(originPxX, width - originPxX);
	const maxDy = Math.max(originPxY, height - originPxY);
	let distance: number;
	let maxDistance: number;

	if (shape === "triangle") {
		distance = dx + dy;
		maxDistance = maxDx + maxDy;
	} else if (shape === "rectangle") {
		// Edge origins decay along one axis, preserving the full rectangular field.
		distance =
			originX !== 0.5 && originY === 0.5
				? dx / maxDx
				: originY !== 0.5 && originX === 0.5
					? dy / maxDy
					: Math.max(dx / maxDx, dy / maxDy);
		maxDistance = 1;
	} else if (shape === "speed-lines") {
		const diagonal = (dx + dy) / Math.max(1, maxDx + maxDy);
		const stripe = seededNoise(Math.floor(x / 42), Math.floor(y / 20), 9);
		return Math.max(0, 1 - diagonal / falloff) * (0.35 + stripe * 0.65);
	} else {
		distance = Math.hypot(dx, dy);
		const centered = originX === 0.5 && originY === 0.5;
		maxDistance = centered
			? centerRadius
			: Math.min(Math.hypot(maxDx, maxDy), Math.max(width, height));
	}

	const radial = Math.max(
		0,
		1 - distance / Math.max(0.001, maxDistance * Math.max(0.05, falloff)),
	);
	if (shape === "random") {
		return radial * (0.25 + seededNoise(x, y, 3) * 0.75);
	}
	return radial;
}

export type HalftoneDotsProps = Omit<HalftoneDecoration, "type">;
export type HalftoneProps = HalftoneDotsProps;

export function HalftoneDots({
	aspectRatio = 1,
	coverage,
	decayMode = "both",
	decayOrigin = "center",
	density = "medium",
	dotSize,
	falloff = 0.82,
	minimumOpacity = 0,
	position = "bottom-left",
	shape = "circle",
	spacing,
	variant = "classic",
	...props
}: HalftoneDotsProps): React.JSX.Element {
	const { height, width } = intrinsicCanvas(aspectRatio, 1);
	const gap = Math.max(
		0.5,
		Math.sqrt((width * height) / 120000),
		(spacing ?? 21) / Math.sqrt(densityFactor(density)),
	);
	const dot = Math.max(0, dotSize ?? 3);
	const [originX, originY] = positionOrigin(decayOrigin);
	const columns = Math.ceil(width / gap);
	const rows = Math.ceil(height / gap);
	const opacityBuckets = Array.from({ length: 9 }, () => [] as string[]);

	for (let row = 0; row <= rows; row += 1) {
		for (let column = 0; column <= columns; column += 1) {
			const cx = column * gap;
			const cy = row * gap;
			const noise = seededNoise(column, row, 17);
			let influence = halftoneInfluence(
				shape,
				cx,
				cy,
				originX,
				originY,
				falloff,
				width,
				height,
			);
			if (variant === "distressed" && noise < 0.22) continue;
			if (variant === "soft") influence **= 1.35;
			if (variant === "bold") influence = Math.sqrt(influence);
			if (influence < 0.015) continue;

			const irregularity = variant === "distressed" ? 0.7 + noise * 0.45 : 1;
			const sizeInfluence = decayMode === "opacity" ? 1 : influence;
			const opacityInfluence =
				decayMode === "size"
					? 1
					: clamp(minimumOpacity + influence * (1 - minimumOpacity), 0, 1);
			const radius = Math.max(
				0.45,
				dot * 2.05 * sizeInfluence ** 0.7 * irregularity,
			);
			const bucket = clamp(Math.round(opacityInfluence * 8), 0, 8);
			opacityBuckets[bucket]?.push(circlePath(cx, cy, radius));
		}
	}

	return (
		<svg
			{...primitiveProps("halftone", {
				...props,
				aspectRatio,
				coverage:
					coverage ?? (shape === "field" || shape === "vignette" ? 1 : 0.56),
				position,
			})}
			data-decoration-density={density}
			data-decoration-shape={shape}
			data-decoration-variant={variant}
			preserveAspectRatio="xMidYMid meet"
			viewBox={`0 0 ${width} ${height}`}
		>
			<title>Halftone dot decoration</title>
			{opacityBuckets.map((dots, bucket) =>
				dots.length > 0 ? (
					<path
						d={dots.join("")}
						fill="currentColor"
						key={dots[0]}
						opacity={Math.max(0.04, bucket / 8)}
					/>
				) : null,
			)}
		</svg>
	);
}

/** @deprecated Use HalftoneDots. */
export const Halftone = HalftoneDots;

type SpeedMark = {
	d: string;
	endX: number;
	endY: number;
	fill: boolean;
	opacity: number;
	startX: number;
	startY: number;
	strokeWidth: number;
};

function lineMark(
	startX: number,
	startY: number,
	endX: number,
	endY: number,
	thickness: number,
	_endWidth: number,
	variant: SpeedLineVariant,
	index: number,
	_startWidth: number,
): SpeedMark {
	return {
		d: "",
		startX,
		startY,
		endX,
		endY,
		fill: true,
		opacity: 0.55 + (index % 5) * 0.1,
		strokeWidth: variant === "laser" ? thickness * 4 : thickness,
	};
}

function parallelSpeedMarks({
	angle,
	seed,
	height,
	jitter,
	length,
	quantity,
	endWidth,
	startWidth,
	strokeWidth,
	variant,
	width,
}: {
	angle: number;
	seed: number;
	height: number;
	jitter: number;
	length: number;
	quantity: number;
	endWidth: number;
	startWidth: number;
	strokeWidth: number;
	variant: SpeedLineVariant;
	width: number;
}): SpeedMark[] {
	const radians = (angle * Math.PI) / 180;
	const dx = Math.cos(radians);
	const dy = Math.sin(radians);
	const px = -dy;
	const py = dx;
	const diagonal = Math.hypot(width, height);
	const laneSpan = Math.abs(px) * width + Math.abs(py) * height;

	return Array.from({ length: quantity }, (_, index) => {
		const noise = seededNoise(index, quantity, seed + 29);
		const lane = quantity === 1 ? 0 : index / (quantity - 1) - 0.5;
		const offset = lane * laneSpan + (noise - 0.5) * 52 * jitter;
		const run = diagonal * Math.max(0.01, length) * (1 - jitter * noise * 0.4);
		const centerX = width / 2 + px * offset;
		const centerY = height / 2 + py * offset;
		return lineMark(
			centerX - (dx * run) / 2,
			centerY - (dy * run) / 2,
			centerX + (dx * run) / 2,
			centerY + (dy * run) / 2,
			strokeWidth * (0.55 + noise * 1.3),
			endWidth,
			variant,
			index,
			startWidth,
		);
	});
}

function radialSpeedMarks({
	angle,
	jitter,
	seed,
	height,
	length,
	originRadius,
	quantity,
	spread,
	endWidth,
	startWidth,
	strokeWidth,
	variant,
	width,
}: {
	angle: number;
	jitter: number;
	seed: number;
	height: number;
	length: number;
	originRadius: number;
	quantity: number;
	spread: number;
	endWidth: number;
	startWidth: number;
	strokeWidth: number;
	variant: SpeedLineVariant;
	width: number;
}): SpeedMark[] {
	const originX = width / 2;
	const originY = height / 2;
	const baseAngle = (angle * Math.PI) / 180;
	const totalSpread = clamp(spread, 0, 360);
	const radius = Math.max(0, originRadius) * (Math.min(width, height) / 2);

	return Array.from({ length: quantity }, (_, index) => {
		const noise = seededNoise(index, quantity, seed + 37);
		const progress =
			quantity === 1
				? 0.5
				: index / (totalSpread === 360 ? quantity : quantity - 1);
		const radians =
			baseAngle +
			((progress - 0.5 + ((noise - 0.5) * jitter) / quantity) *
				totalSpread *
				Math.PI) /
				180;
		const startX = originX + Math.cos(radians) * radius;
		const startY = originY + Math.sin(radians) * radius;
		const rayX = Math.cos(radians);
		const rayY = Math.sin(radians);
		const run =
			(Math.hypot(width, height) / 2) *
			Math.max(0.01, length) *
			(1 - jitter * noise * 0.35);
		return lineMark(
			startX,
			startY,
			startX + rayX * run,
			startY + rayY * run,
			strokeWidth * (0.5 + noise * 1.5),
			endWidth,
			variant,
			index,
			startWidth,
		);
	});
}

function BoundaryShape({
	fill,
	height,
	shape,
	width,
}: {
	fill: string;
	height: number;
	shape: Exclude<SpeedLineShape, "field" | "vignette">;
	width: number;
}): React.JSX.Element {
	const size = Math.min(width, height) * 0.78;
	if (shape === "circle") {
		return <circle cx={width / 2} cy={height / 2} fill={fill} r={size / 2} />;
	}
	if (shape === "triangle") {
		return (
			<polygon
				fill={fill}
				points={`${width / 2},${(height - size) / 2} ${(width + size) / 2},${(height + size) / 2} ${(width - size) / 2},${(height + size) / 2}`}
			/>
		);
	}
	const shapeWidth =
		shape === "rectangle" ? Math.min(width * 0.82, size * 1.45) : size;
	const shapeHeight = shape === "rectangle" ? size * 0.62 : size;
	return (
		<rect
			fill={fill}
			height={shapeHeight}
			width={shapeWidth}
			x={(width - shapeWidth) / 2}
			y={(height - shapeHeight) / 2}
		/>
	);
}

export type SpeedLinesProps = Omit<SpeedLinesDecoration, "type">;

export function SpeedLines({
	angle = 0,
	aspectRatio = 1.8,
	coverage = 0.72,
	density = "medium",
	direction,
	endOpacity = 1,
	endWidth = 0.08,
	jitter = 0.65,
	length = 0.72,
	originOpacity = 0,
	originRadius = 0.2,
	position = "center",
	quantity,
	shape = "field",
	shapeMode = "inside",
	spread,
	seed = 29,
	modulation = 0,
	modulationSegments = 16,
	startOpacity = 1,
	startWidth = 1,
	strokeWidth = 2,
	vignetteFeather = 0.18,
	vignetteRadius = 0.28,
	variant = "tapered",
	...props
}: SpeedLinesProps): React.JSX.Element {
	const id = useId().replaceAll(":", "");
	const { height, width } = intrinsicCanvas(aspectRatio, 1.8);
	const count = clamp(
		Math.round((quantity ?? 16) * densityFactor(density)),
		1,
		2048,
	);
	const radial = ["fan", "laser", "radial"].includes(variant);
	const [anchorX, anchorY] = positionOrigin(position);
	const inwardAngle =
		position === "center"
			? 0
			: (Math.atan2(0.5 - anchorY, 0.5 - anchorX) * 180) / Math.PI;
	const resolvedAngle =
		angle + (direction ? directionAngle(direction) : radial ? inwardAngle : 28);
	const segments = clamp(Math.round(modulationSegments), 2, 128);
	const marks = radial
		? radialSpeedMarks({
				angle: resolvedAngle,
				jitter,
				seed,
				height,
				length,
				originRadius,
				quantity: count,
				spread: spread ?? (variant === "radial" ? 360 : 90),
				endWidth,
				startWidth,
				strokeWidth,
				variant,
				width,
			})
		: parallelSpeedMarks({
				angle: resolvedAngle,
				seed,
				height,
				jitter,
				length,
				quantity: count,
				endWidth,
				startWidth,
				strokeWidth,
				variant,
				width,
			});
	for (const [index, mark] of marks.entries()) {
		mark.d = modulatedRibbon(
			[mark.startX, mark.startY],
			[mark.endX, mark.endY],
			mark.strokeWidth,
			startWidth,
			endWidth,
			index,
			modulation,
			segments,
			seed,
			variant === "electric",
		);
		mark.fill = true;
	}
	const boundaryShape = shape === "vignette" ? "circle" : shape;
	const outside = shape === "vignette" || shapeMode === "outside";
	const constrained = boundaryShape !== "field";
	const clipId = `speed-clip-${id}`;
	const maskId = `speed-mask-${id}`;
	const fadeId = `speed-fade-${id}`;
	const fadeRadius = shape === "vignette" ? vignetteRadius : originRadius;
	const fadeEnd = clamp(fadeRadius + vignetteFeather, 0.01, 1);
	const usesFade = shape === "vignette" || (radial && originOpacity < 1);
	const usesMask = outside || usesFade;

	return (
		<svg
			{...primitiveProps("speed-lines", {
				...props,
				aspectRatio,
				coverage,
				position,
			})}
			data-decoration-density={density}
			data-decoration-shape={shape}
			data-decoration-variant={variant}
			preserveAspectRatio="xMidYMid meet"
			viewBox={`0 0 ${width} ${height}`}
		>
			<title>Comic speed line decoration</title>
			<defs>
				<radialGradient
					id={fadeId}
					gradientUnits="userSpaceOnUse"
					cx={width / 2}
					cy={height / 2}
					r={Math.min(width, height) / 2}
				>
					<stop offset="0%" stopColor="white" stopOpacity={originOpacity} />
					<stop
						offset={`${clamp(fadeRadius, 0, 0.99) * 100}%`}
						stopColor="white"
						stopOpacity={originOpacity}
					/>
					<stop
						offset={`${fadeEnd * 100}%`}
						stopColor="white"
						stopOpacity="1"
					/>
				</radialGradient>
				{marks.map((mark, index) => (
					<linearGradient
						gradientUnits="userSpaceOnUse"
						id={`speed-line-${id}-${index}`}
						key={`gradient-${mark.d}-${index}`}
						x1={mark.startX}
						x2={mark.endX}
						y1={mark.startY}
						y2={mark.endY}
					>
						<stop
							offset="0%"
							stopColor="currentColor"
							stopOpacity={startOpacity}
						/>
						{Array.from({ length: segments - 1 }, (_, point) => {
							const t = (point + 1) / segments;
							return (
								<stop
									key={t}
									offset={`${t * 100}%`}
									stopColor="currentColor"
									stopOpacity={
										(startOpacity + (endOpacity - startOpacity) * t) *
										modulationAt(index, point + 1, modulation, seed)
									}
								/>
							);
						})}
						<stop
							offset="100%"
							stopColor="currentColor"
							stopOpacity={endOpacity}
						/>
					</linearGradient>
				))}
				<filter
					id={`speed-rough-${id}`}
					x="-8%"
					y="-8%"
					width="116%"
					height="116%"
				>
					<feTurbulence
						baseFrequency="0.012 0.065"
						numOctaves="2"
						seed="23"
						type="fractalNoise"
					/>
					<feDisplacementMap
						in="SourceGraphic"
						scale={variant === "brush" ? 7 : 2}
					/>
				</filter>
				{constrained && !outside ? (
					<clipPath id={clipId}>
						<BoundaryShape
							fill="white"
							height={height}
							shape={
								boundaryShape as Exclude<SpeedLineShape, "field" | "vignette">
							}
							width={width}
						/>
					</clipPath>
				) : null}
				{usesMask ? (
					<mask
						id={maskId}
						maskUnits="userSpaceOnUse"
						x={-width * Math.max(2, length * 2)}
						y={-height * Math.max(2, length * 2)}
						width={width * Math.max(5, length * 5)}
						height={height * Math.max(5, length * 5)}
					>
						<rect
							fill={usesFade ? `url(#${fadeId})` : "white"}
							x={-width * Math.max(2, length * 2)}
							y={-height * Math.max(2, length * 2)}
							height={height * Math.max(5, length * 5)}
							width={width * Math.max(5, length * 5)}
						/>
						{outside && shape !== "vignette" ? (
							<BoundaryShape
								fill="black"
								height={height}
								shape={
									boundaryShape as Exclude<SpeedLineShape, "field" | "vignette">
								}
								width={width}
							/>
						) : null}
					</mask>
				) : null}
			</defs>
			<g
				clipPath={constrained && !outside ? `url(#${clipId})` : undefined}
				filter={variant === "brush" ? `url(#speed-rough-${id})` : undefined}
				mask={usesMask ? `url(#${maskId})` : undefined}
			>
				{marks.map((mark, index) => (
					<path
						d={mark.d}
						fill={mark.fill ? `url(#speed-line-${id}-${index})` : "none"}
						key={`${mark.d}-${index}`}
						opacity={mark.opacity}
						stroke={mark.fill ? "none" : `url(#speed-line-${id}-${index})`}
						strokeLinecap="square"
						strokeLinejoin="miter"
						strokeWidth={mark.fill ? undefined : mark.strokeWidth}
					/>
				))}
			</g>
		</svg>
	);
}

export type AccentStreakProps = Omit<AccentStreakDecoration, "type">;

export function AccentStreak({
	angle = 0,
	aspectRatio = 2.1,
	coverage = 0.58,
	density = "medium",
	direction = "down-right",
	length = 0.72,
	position = "center",
	quantity = 4,
	splatter = 0.35,
	thickness = 78,
	variant = "brush",
	seed = 41,
	stretch = 1,
	roughness = 0.7,
	branching = 2,
	...props
}: AccentStreakProps): React.JSX.Element {
	const id = useId().replaceAll(":", "");
	const { height, width } = intrinsicCanvas(aspectRatio, 2.1);
	const { marks, cuts } = accentGeometry({
		width,
		thickness,
		quantity: quantity * densityFactor(density),
		variant,
		seed,
		roughness,
		branching,
		splatter,
	});
	const rotation = angle + directionAngle(direction);
	return (
		<svg
			{...primitiveProps("accent-streak", {
				...props,
				aspectRatio,
				coverage,
				position,
			})}
			data-decoration-density={density}
			data-decoration-variant={variant}
			preserveAspectRatio="xMidYMid meet"
			viewBox={`0 0 ${width} ${height}`}
		>
			<title>Comic accent streak decoration</title>
			<defs>
				<mask
					id={`paint-${id}`}
					maskUnits="userSpaceOnUse"
					x={-width * 2}
					y={-height * 10}
					width={width * 4}
					height={height * 20}
				>
					<rect
						x={-width * 2}
						y={-height * 10}
						width={width * 4}
						height={height * 20}
						fill="white"
					/>
					{cuts.map((d) => (
						<path key={d} d={d} fill="black" />
					))}
				</mask>
			</defs>
			<g
				transform={`translate(${width / 2} ${height / 2}) rotate(${rotation}) scale(${Math.max(0.01, length) * Math.max(0.01, stretch)} 1)`}
				fill="currentColor"
				mask={cuts.length ? `url(#paint-${id})` : undefined}
			>
				{marks.map((mark) => (
					<path key={mark.d} d={mark.d} opacity={mark.opacity} />
				))}
			</g>
		</svg>
	);
}
