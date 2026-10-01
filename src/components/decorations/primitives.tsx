import { type CSSProperties, useId } from "react";
import cn from "~/lib/utils/cn";
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

const densityIndex: Record<DecorationDensity, number> = {
	minimal: 0,
	sparse: 1,
	airy: 2,
	medium: 3,
	dense: 4,
	packed: 5,
};

function clamp(value: number, minimum: number, maximum: number): number {
	return Math.max(minimum, Math.min(maximum, value));
}

function resolveDecorationColor(color: DecorationBase["color"] = "neutral") {
	return color in decorationColors
		? decorationColors[color as keyof typeof decorationColors]
		: color;
}

function primitiveProps(
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
		"data-decoration-viewport": viewport,
		focusable: false,
		style: {
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
	return { height, width: height * clamp(aspectRatio ?? fallback, 0.5, 3) };
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
		distance = Math.max(dx, dy);
		maxDistance = Math.max(maxDx, maxDy);
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
		1 - distance / Math.max(1, maxDistance * Math.max(0.05, falloff)),
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
	const gap =
		spacing ??
		{ minimal: 38, sparse: 31, airy: 26, medium: 21, dense: 17, packed: 13 }[
			density
		];
	const dot =
		dotSize ??
		{ minimal: 2, sparse: 2.3, airy: 2.6, medium: 3, dense: 3.3, packed: 3.6 }[
			density
		];
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
				0.5,
				0.5,
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
	endWidth: number,
	variant: SpeedLineVariant,
	index: number,
	startWidth: number,
): SpeedMark {
	const lineThickness = variant === "laser" ? thickness * 4 : thickness;
	const dx = endX - startX;
	const dy = endY - startY;
	const magnitude = Math.max(1, Math.hypot(dx, dy));
	const startHalf = (lineThickness * Math.max(0, startWidth)) / 2;
	const endHalf = (lineThickness * Math.max(0, endWidth)) / 2;
	const startPx = (-dy / magnitude) * startHalf;
	const startPy = (dx / magnitude) * startHalf;
	const endPx = (-dy / magnitude) * endHalf;
	const endPy = (dx / magnitude) * endHalf;
	const opacity = 0.55 + (index % 5) * 0.1;

	if (variant === "electric") {
		const points = Array.from({ length: 7 }, (_, point) => {
			const progress = point / 6;
			const offset =
				(point === 0 || point === 6 ? 0 : seededNoise(index, point, 31) - 0.5) *
				Math.max(1, thickness) *
				8;
			return `${startX + dx * progress + (-dy / magnitude) * offset} ${startY + dy * progress + (dx / magnitude) * offset}`;
		});
		return {
			d: `M${points.join(" L")}`,
			endX,
			endY,
			fill: false,
			opacity,
			startX,
			startY,
			strokeWidth: lineThickness,
		};
	}

	return {
		d: `M${startX + startPx} ${startY + startPy} L${endX + endPx} ${endY + endPy} L${endX - endPx} ${endY - endPy} L${startX - startPx} ${startY - startPy} Z`,
		endX,
		endY,
		fill: true,
		opacity,
		startX,
		startY,
		strokeWidth: lineThickness,
	};
}

function parallelSpeedMarks({
	angle,
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
		const noise = seededNoise(index, quantity, 29);
		const lane = quantity === 1 ? 0 : index / (quantity - 1) - 0.5;
		const offset = lane * laneSpan + (noise - 0.5) * 52 * jitter;
		const run = diagonal * length * (0.58 + noise * 0.48);
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
	height,
	length,
	originRadius,
	position,
	quantity,
	spread,
	endWidth,
	startWidth,
	strokeWidth,
	variant,
	width,
}: {
	height: number;
	length: number;
	originRadius: number;
	position: DecorationPosition;
	quantity: number;
	spread: number;
	endWidth: number;
	startWidth: number;
	strokeWidth: number;
	variant: SpeedLineVariant;
	width: number;
}): SpeedMark[] {
	const [normalizedX, normalizedY] = positionOrigin(position);
	const originX = width / 2;
	const originY = height / 2;
	const centered = normalizedX === 0.5 && normalizedY === 0.5;
	const baseAngle = centered
		? 0
		: Math.atan2(0.5 - normalizedY, 0.5 - normalizedX);
	const totalSpread =
		variant === "radial" && centered ? 360 : clamp(spread, 10, 360);
	const radius = clamp(originRadius, 0, 0.8) * (Math.min(width, height) / 2);

	return Array.from({ length: quantity }, (_, index) => {
		const noise = seededNoise(index, quantity, 37);
		const progress = quantity === 1 ? 0.5 : index / (quantity - 1);
		const radians =
			baseAngle + ((progress - 0.5) * totalSpread * Math.PI) / 180;
		const startX = originX + Math.cos(radians) * radius;
		const startY = originY + Math.sin(radians) * radius;
		const rayX = Math.cos(radians);
		const rayY = Math.sin(radians);
		const horizontalDistance =
			Math.abs(rayX) < 0.0001
				? Number.POSITIVE_INFINITY
				: rayX > 0
					? (width - startX) / rayX
					: -startX / rayX;
		const verticalDistance =
			Math.abs(rayY) < 0.0001
				? Number.POSITIVE_INFINITY
				: rayY > 0
					? (height - startY) / rayY
					: -startY / rayY;
		const available = Math.max(
			0,
			Math.min(horizontalDistance, verticalDistance),
		);
		const run = available * clamp(length, 0.08, 1) * (0.72 + noise * 0.28);
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
	angle,
	aspectRatio = 1.8,
	coverage = 0.72,
	density = "medium",
	direction = "down-right",
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
	spread = 90,
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
		quantity ?? [3, 5, 8, 12, 18, 26][densityIndex[density]] ?? 12,
		1,
		72,
	);
	const radial = ["fan", "laser", "radial"].includes(variant);
	const marks = radial
		? radialSpeedMarks({
				height,
				length,
				originRadius,
				position,
				quantity: count,
				spread,
				endWidth,
				startWidth,
				strokeWidth,
				variant,
				width,
			})
		: parallelSpeedMarks({
				angle: angle ?? directionAngle(direction),
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
				<radialGradient id={fadeId} r="50%">
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
					<mask id={maskId}>
						<rect
							fill={usesFade ? `url(#${fadeId})` : "white"}
							height={height}
							width={width}
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

function brushStrokePath(
	index: number,
	quantity: number,
	length: number,
	thickness: number,
	variant: AccentStreakDecoration["variant"],
	width: number,
	height: number,
): string {
	const random = seededNoise(index, quantity, 47);
	const usableLength = width * clamp(length, 0.1, 1);
	const startX = (width - usableLength) / 2 - usableLength * random * 0.04;
	const endX = startX + usableLength * (0.9 + random * 0.12);
	const centeredIndex = index - (quantity - 1) / 2;
	const lane = centeredIndex * thickness * 0.22;
	const centerY = height / 2 + lane + (random - 0.5) * thickness * 0.3;
	const weight =
		index === 0
			? 1.35
			: (0.28 + random * 0.54) * (variant === "slashes" ? 0.45 : 1);
	const body = thickness * weight * (variant === "underline" ? 0.55 : 1);
	const samples = 18;
	const top = Array.from({ length: samples }, (_, point) => {
		const progress = point / (samples - 1);
		const taper = Math.sin(Math.PI * progress) ** 0.34;
		const ragged = 0.72 + seededNoise(index, point, 211) * 0.42;
		const drift = (seededNoise(index, point, 223) - 0.5) * body * 0.16;
		return [
			startX + (endX - startX) * progress,
			centerY - body * 0.5 * taper * ragged + drift,
		] as const;
	});
	const bottom = Array.from({ length: samples }, (_, reversePoint) => {
		const point = samples - reversePoint - 1;
		const progress = point / (samples - 1);
		const taper = Math.sin(Math.PI * progress) ** 0.34;
		const ragged = 0.7 + seededNoise(index, point, 239) * 0.48;
		const drift = (seededNoise(index, point, 241) - 0.5) * body * 0.18;
		return [
			startX + (endX - startX) * progress,
			centerY + body * 0.5 * taper * ragged + drift,
		] as const;
	});
	return `${[...top, ...bottom]
		.map(([x, y], point) => `${point === 0 ? "M" : "L"}${x} ${y}`)
		.join(" ")} Z`;
}

function jaggedPath(
	index: number,
	quantity: number,
	width: number,
	height: number,
	branches: number,
): string {
	const lane =
		(index - (quantity - 1) / 2) * (height / Math.max(quantity, 3)) * 0.45;
	const points = Array.from({ length: branches }, (_, point) => {
		const progress = point / (branches - 1);
		const noise = seededNoise(index, point, 107) - 0.5;
		return `${width * (0.08 + progress * 0.84)} ${height / 2 + lane + noise * height * 0.18}`;
	});
	return `M${points.join(" L")}`;
}

function lightningPath(
	index: number,
	quantity: number,
	width: number,
	height: number,
	thickness: number,
): string {
	const points = 9;
	const lane =
		(index - (quantity - 1) / 2) * thickness * 0.58 +
		(seededNoise(index, quantity, 251) - 0.5) * thickness;
	const centerLine = Array.from({ length: points }, (_, point) => {
		const progress = point / (points - 1);
		const stagger =
			point === 0 || point === points - 1 ? 0 : point % 2 ? 1 : -1;
		const noise = seededNoise(index, point, 257) - 0.5;
		return [
			width * (0.04 + progress * 0.92),
			height / 2 + lane + (stagger * 0.34 + noise * 0.5) * thickness,
		] as const;
	});
	const top = centerLine.map(([x, y], point) => {
		const taper = Math.sin((point / (points - 1)) * Math.PI) ** 0.24;
		return [x, y - thickness * (0.12 + taper * 0.42)] as const;
	});
	const bottom = [...centerLine].reverse().map(([x, y], reversePoint) => {
		const point = points - reversePoint - 1;
		const taper = Math.sin((point / (points - 1)) * Math.PI) ** 0.24;
		return [x, y + thickness * (0.12 + taper * 0.42)] as const;
	});
	return `${[...top, ...bottom]
		.map(([x, y], point) => `${point === 0 ? "M" : "L"}${x} ${y}`)
		.join(" ")} Z`;
}

function lightningShardPath(
	index: number,
	width: number,
	height: number,
	thickness: number,
): string {
	const x = width * (0.08 + seededNoise(index, 1, 263) * 0.84);
	const y = height * (0.22 + seededNoise(index, 2, 269) * 0.56);
	const size = thickness * (0.18 + seededNoise(index, 3, 271) * 0.36);
	const direction = seededNoise(index, 4, 277) > 0.5 ? 1 : -1;
	return `M${x - size} ${y} L${x + size * 1.4} ${y - size * direction} L${x + size * 0.28} ${y + size * 1.3 * direction} Z`;
}

function burstPath(
	index: number,
	points: number,
	radius: number,
	centerX: number,
	centerY: number,
): string {
	return `${Array.from({ length: points * 2 }, (_, point) => {
		const angle = (point / (points * 2)) * Math.PI * 2;
		const random = seededNoise(index, point, 131);
		const pointRadius =
			point % 2 === 0
				? radius * (0.72 + random * 0.48)
				: radius * (0.15 + random * 0.24);
		return `${point === 0 ? "M" : "L"}${centerX + Math.cos(angle) * pointRadius} ${centerY + Math.sin(angle) * pointRadius}`;
	}).join(" ")} Z`;
}

function splashPath(
	index: number,
	radius: number,
	centerX: number,
	centerY: number,
): string {
	const points = 30;
	const shiftedX = centerX + (seededNoise(index, 2, 149) - 0.5) * radius * 0.32;
	const shiftedY = centerY + (seededNoise(index, 4, 151) - 0.5) * radius * 0.32;
	return `${Array.from({ length: points }, (_, point) => {
		const angle = (point / points) * Math.PI * 2;
		const random = seededNoise(index, point, 157);
		const spike = point % 5 === 0 ? 1.65 + random * 0.8 : 0.48 + random * 0.72;
		const pointRadius = radius * spike;
		return `${point === 0 ? "M" : "L"}${shiftedX + Math.cos(angle) * pointRadius} ${shiftedY + Math.sin(angle) * pointRadius}`;
	}).join(" ")} Z`;
}

export type AccentStreakProps = Omit<AccentStreakDecoration, "type">;

export function AccentStreak({
	angle,
	aspectRatio = 2.1,
	coverage = 0.58,
	density = "medium",
	direction = "down-right",
	length = 0.72,
	position = "center",
	quantity,
	splatter = 0.35,
	thickness = 78,
	variant = "brush",
	...props
}: AccentStreakProps): React.JSX.Element {
	const id = useId().replaceAll(":", "");
	const { height, width } = intrinsicCanvas(aspectRatio, 2.1);
	const defaultCount = [1, 2, 3, 4, 6, 8][densityIndex[density]] ?? 4;
	const count = clamp(quantity ?? defaultCount, 1, 18);
	const angularVariant = ["burst", "splash"].includes(variant);
	const crackedVariant = variant === "cracks";
	const lightningVariant = variant === "lightning";
	const paths = crackedVariant
		? Array.from({ length: count }, (_, index) =>
				jaggedPath(index, count, width, height, 9),
			)
		: lightningVariant
			? [
					...Array.from({ length: count }, (_, index) =>
						lightningPath(index, count, width, height, Math.max(10, thickness)),
					),
					...Array.from({ length: count * 3 }, (_, index) =>
						lightningShardPath(index, width, height, Math.max(10, thickness)),
					),
				]
			: angularVariant
				? Array.from({ length: count }, (_, index) =>
						variant === "splash"
							? splashPath(
									index,
									Math.min(width, height) * (0.1 + index * 0.014),
									width / 2,
									height / 2,
								)
							: burstPath(
									index,
									10,
									Math.min(width, height) * (0.24 + index * 0.015),
									width / 2,
									height / 2,
								),
					)
				: Array.from({ length: count }, (_, index) =>
						brushStrokePath(
							index,
							count,
							length,
							Math.max(4, thickness),
							variant,
							width,
							height,
						),
					);
	const splatterCount = Math.round(
		clamp(splatter, 0, 1) *
			(variant === "splash"
				? 72
				: variant === "splatter"
					? 46
					: variant === "dry-brush"
						? 34
						: 36),
	);
	const rotation = angle ?? directionAngle(direction);
	const texturedPaint =
		!crackedVariant &&
		!lightningVariant &&
		!angularVariant &&
		variant !== "slashes";
	const paintMaskId = `paint-mask-${id}`;

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
				<filter
					id={`paint-rough-${id}`}
					x="-8%"
					y="-12%"
					width="116%"
					height="124%"
				>
					<feTurbulence
						baseFrequency={
							variant === "dry-brush" ? "0.02 0.12" : "0.012 0.075"
						}
						numOctaves="2"
						seed="41"
						type="fractalNoise"
					/>
					<feDisplacementMap
						in="SourceGraphic"
						scale={variant === "slashes" ? 2 : variant === "dry-brush" ? 13 : 7}
					/>
				</filter>
				{texturedPaint ? (
					<mask id={paintMaskId}>
						<rect fill="white" height={height} width={width} />
						{Array.from({ length: 22 }, (_, cutout) => {
							const x = width * (0.1 + seededNoise(cutout, 1, 283) * 0.72);
							const y =
								height / 2 +
								(seededNoise(cutout, 2, 293) - 0.5) * thickness * 1.8;
							const cutoutWidth =
								width * (0.025 + seededNoise(cutout, 3, 307) * 0.15);
							const cutoutHeight =
								1 + seededNoise(cutout, 4, 311) * Math.max(2, thickness * 0.08);
							return (
								<rect
									fill="black"
									height={cutoutHeight}
									key={`${x}-${y}`}
									rx={cutoutHeight / 2}
									width={cutoutWidth}
									x={x}
									y={y}
								/>
							);
						})}
					</mask>
				) : null}
			</defs>
			<g
				fill={crackedVariant ? "none" : "currentColor"}
				filter={texturedPaint ? `url(#paint-rough-${id})` : undefined}
				mask={texturedPaint ? `url(#${paintMaskId})` : undefined}
				stroke={crackedVariant ? "currentColor" : "none"}
				strokeLinecap="square"
				strokeLinejoin="miter"
				strokeWidth={crackedVariant ? thickness * 0.12 : undefined}
				transform={`rotate(${rotation} ${width / 2} ${height / 2})`}
			>
				{paths.map((path, index) => (
					<path
						d={path}
						key={path}
						opacity={index === 0 ? 1 : 0.74 + (index % 3) * 0.1}
					/>
				))}
				{Array.from({ length: splatterCount }, (_, index) => {
					const cx = width * (0.08 + seededNoise(index, count, 61) * 0.84);
					const cy = height * (0.25 + seededNoise(index, count, 73) * 0.5);
					const radius =
						1.5 +
						seededNoise(index, count, 89) * (variant === "splash" ? 10 : 8);
					return (
						<circle
							cx={cx}
							cy={cy}
							key={`${cx}-${cy}`}
							opacity={0.5 + (index % 4) * 0.12}
							r={radius}
						/>
					);
				})}
			</g>
		</svg>
	);
}
