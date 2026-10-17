import { useId } from "react";
import { densityFactor, noise } from "./geometry";
import { primitiveProps } from "./primitives";
import type {
	BackgroundTextureDecoration,
	CircularLineworkDecoration,
	GeometricDecoration,
} from "./types";

export type BackgroundTextureProps = Omit<BackgroundTextureDecoration, "type">;
export type GeometricShapeProps = Omit<GeometricDecoration, "type">;
export type CircularLineworkProps = Omit<CircularLineworkDecoration, "type">;

export function BackgroundTexture({
	variant = "paper",
	density = "medium",
	seed = 1,
	tileSize = 256,
	grainSize = 0.65,
	roughness = 0.5,
	angle = -32,
	...base
}: BackgroundTextureProps) {
	const id = useId().replace(/:/g, "");
	const count = Math.min(
		2400,
		Math.max(1, Math.round(480 * densityFactor(density))),
	);
	const marks = Array.from({ length: count }, (_, i) => {
		const x = noise(i, 1, seed) * 256;
		const y = noise(i, 2, seed) * 256;
		const r = Math.max(0.05, grainSize) * (0.2 + noise(i, 3, seed));
		const opacity = 0.12 + noise(i, 4, seed) * 0.65;
		const key = `mark-${i}`;
		if (variant === "scratches" || variant === "scuffs" || variant === "wear") {
			const length =
				(variant === "scuffs" ? 65 : 22) *
				(0.15 + noise(i, 5, seed)) *
				(1 + roughness);
			return (
				<path
					key={key}
					d={`M${x} ${y}l${length} ${noise(i, 6, seed) * roughness * 4}`}
					stroke="currentColor"
					strokeWidth={r * (variant === "scuffs" ? 2 : 0.45)}
					opacity={opacity}
				/>
			);
		}
		if (variant === "paper" && i % 3 === 0) {
			return (
				<path
					key={key}
					d={`M${x} ${y}q${3 + roughness * 5} ${noise(i, 5, seed) * 3} ${4 + noise(i, 6, seed) * 8} 1`}
					stroke="currentColor"
					strokeWidth={r * 0.35}
					opacity={opacity * 0.5}
				/>
			);
		}
		if (variant === "grunge") {
			const radius = r * (1 + noise(i, 7, seed) * roughness * 8);
			const d = Array.from({ length: 7 }, (_, k) => {
				const a = (k * Math.PI * 2) / 7;
				const size = radius * (0.4 + noise(i, k + 8, seed));
				return `${k ? "L" : "M"}${x + Math.cos(a) * size} ${y + Math.sin(a) * size}`;
			}).join(" ");
			return (
				<path key={key} d={`${d}Z`} fill="currentColor" opacity={opacity} />
			);
		}
		return (
			<ellipse
				key={key}
				cx={x}
				cy={y}
				rx={r}
				ry={r}
				fill="currentColor"
				opacity={opacity}
			/>
		);
	});
	const props = primitiveProps("background-texture", {
		color: "neutral",
		opacity: 0.16,
		...base,
	});
	return (
		<svg
			{...props}
			aria-hidden="true"
			className={`${props.className} ts-decoration-texture`}
			width="100%"
			height="100%"
		>
			<defs>
				<g id={`${id}-marks`} fill="none">
					{marks}
				</g>
				<pattern
					id={id}
					width={Math.max(8, tileSize) * Math.max(0.05, base.scale ?? 1)}
					height={Math.max(8, tileSize) * Math.max(0.05, base.scale ?? 1)}
					patternUnits="userSpaceOnUse"
					viewBox="0 0 256 256"
					patternTransform={`rotate(${variant === "wear" ? 90 : angle})`}
				>
					{[-256, 0, 256].flatMap((x) =>
						[-256, 0, 256].map((y) => (
							<use
								key={`${x}-${y}`}
								href={`#${id}-marks`}
								transform={`translate(${x} ${y})`}
							/>
						)),
					)}
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill={`url(#${id})`} />
		</svg>
	);
}

function polygon(shape: GeometricDecoration["shape"], cut: number): string {
	switch (shape) {
		case "triangle":
			return "M80 510L300 90L520 510Z";
		case "diamond":
			return "M300 60L540 300L300 540L60 300Z";
		case "parallelogram":
			return "M190 90H550L410 510H50Z";
		case "chevron":
			return "M80 90L340 90L540 300L340 510H80L280 300Z";
		case "corner-cut":
			return `M300 300H${300 + cut}L300 ${300 + cut}Z`;
		case "notched-frame":
			return `M${cut} 20H${580 - cut}L580 ${cut + 20}V${580 - cut}L${580 - cut} 580H${cut}L20 ${580 - cut}V${cut + 20}Z`;
		case "rectangle":
			return "M45 170H555V430H45Z";
		default:
			return "M90 90H510V510H90Z";
	}
}

export function GeometricShape({
	shape = "parallelogram",
	fill = "solid",
	quantity = 1,
	spacing = 42,
	strokeWidth = 3,
	cut = 100,
	...base
}: GeometricShapeProps) {
	const count = Math.min(512, Math.max(1, Math.round(quantity)));
	const outline = fill === "outline" || shape === "notched-frame";
	return (
		<svg
			{...primitiveProps("geometric", base)}
			aria-hidden="true"
			viewBox="0 0 600 600"
			preserveAspectRatio="xMidYMid meet"
		>
			<g
				fill={outline ? "none" : "currentColor"}
				stroke={outline ? "currentColor" : "none"}
				strokeWidth={strokeWidth}
			>
				{Array.from({ length: count }, (_, i) => {
					const key = `shape-${i}`;
					if (shape === "cross-grid") {
						const columns = Math.ceil(Math.sqrt(count));
						const x = 300 + ((i % columns) - (columns - 1) / 2) * spacing;
						const y =
							300 + (Math.floor(i / columns) - (columns - 1) / 2) * spacing;
						return (
							<path
								key={key}
								d={`M${x - 7} ${y}h14M${x} ${y - 7}v14`}
								fill="none"
								stroke="currentColor"
								strokeWidth={strokeWidth}
							/>
						);
					}
					if (shape === "stripes")
						return (
							<path
								key={key}
								d={`M${300 + (i - (count - 1) / 2) * spacing - 100} 500l200 -400`}
								fill="none"
								stroke="currentColor"
								strokeWidth={strokeWidth}
							/>
						);
					return (
						<path
							key={key}
							d={polygon(shape, Math.max(0, Math.min(270, cut)))}
							transform={`translate(${(i - (count - 1) / 2) * spacing} 0)`}
						/>
					);
				})}
			</g>
		</svg>
	);
}

export function CircularLinework({
	variant = "open-arc",
	quantity = 5,
	spacing = 22,
	strokeWidth = 2,
	arc = 270,
	jitter = 0.35,
	seed = 1,
	...base
}: CircularLineworkProps) {
	const count = Math.min(128, Math.max(1, Math.round(quantity)));
	const segments = variant === "broken-ring" ? 5 : variant === "sweep" ? 2 : 1;
	const sweep = Math.max(
		1,
		Math.min(359.99, variant === "concentric" ? 359.99 : arc),
	);
	return (
		<svg
			{...primitiveProps("circular-linework", base)}
			aria-hidden="true"
			viewBox="0 0 600 600"
			preserveAspectRatio="xMidYMid meet"
		>
			<g
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
			>
				{Array.from({ length: count * segments }, (_, i) => {
					const key = `arc-${i}`;
					const ring = Math.floor(i / segments);
					const r = Math.max(1, 110 + ring * spacing);
					const start =
						((i % segments) * 360) / segments +
						noise(ring, 1, seed) * jitter * 24;
					const span = sweep / segments - (segments > 1 ? 12 : 0);
					const a = (start * Math.PI) / 180;
					const b = ((start + Math.max(1, span)) * Math.PI) / 180;
					return (
						<path
							key={key}
							d={`M${300 + r * Math.cos(a)} ${300 + r * Math.sin(a)}A${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${300 + r * Math.cos(b)} ${300 + r * Math.sin(b)}`}
							opacity={0.4 + noise(ring, 2, seed) * 0.6}
							strokeWidth={strokeWidth * (1 + noise(ring, 3, seed) * jitter)}
						/>
					);
				})}
			</g>
		</svg>
	);
}
