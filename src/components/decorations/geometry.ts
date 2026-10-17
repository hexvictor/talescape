import type { AccentStreakVariant, DecorationDensity } from "./types";

export function noise(x: number, y: number, seed = 0): number {
	const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
	return n - Math.floor(n);
}

/** Density scales manual spacing/count as well as the defaults. */
export function densityFactor(density: DecorationDensity): number {
	return {
		minimal: 0.25,
		sparse: 0.45,
		airy: 0.7,
		medium: 1,
		dense: 1.6,
		packed: 2.4,
	}[density];
}

type Point = [number, number];
const polygon = (points: Point[]) =>
	`${points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(3)} ${y.toFixed(3)}`).join(" ")} Z`;

export function modulationAt(
	index: number,
	point: number,
	amount: number,
	seed: number,
): number {
	return (
		1 -
		Math.max(0, Math.min(1, amount)) *
			(1 - noise(index, point, seed + 401) ** 2)
	);
}

export function modulatedRibbon(
	start: Point,
	end: Point,
	thickness: number,
	startWidth: number,
	endWidth: number,
	index: number,
	amount: number,
	segments: number,
	seed: number,
	electric = false,
): string {
	const dx = end[0] - start[0];
	const dy = end[1] - start[1];
	const magnitude = Math.max(1, Math.hypot(dx, dy));
	const count = Math.max(2, Math.min(128, Math.round(segments)));
	const top: Point[] = [];
	const bottom: Point[] = [];
	const branches: string[] = [];
	for (let i = 0; i <= count; i++) {
		const t = i / count;
		const shift =
			electric && i > 0 && i < count
				? (noise(index, i, seed + 77) - 0.5) *
					Math.min(magnitude * 0.1, thickness * 18)
				: 0;
		const half = Math.max(
			0,
			(thickness *
				(startWidth + (endWidth - startWidth) * t) *
				(i === 0 || i === count ? 1 : modulationAt(index, i, amount, seed))) /
				2,
		);
		const x = start[0] + dx * t - (dy / magnitude) * shift;
		const y = start[1] + dy * t + (dx / magnitude) * shift;
		top.push([x - (dy / magnitude) * half, y + (dx / magnitude) * half]);
		bottom.push([x + (dy / magnitude) * half, y - (dx / magnitude) * half]);
		if (electric && i > 0 && i < count && i % 4 === 0) {
			const side = noise(index, i, seed) > 0.5 ? 1 : -1;
			const run = magnitude * (0.06 + noise(index, i, seed + 1) * 0.1);
			const bend = Math.min(magnitude * 0.1, thickness * 22) * side;
			const local = (u: number, v: number): Point => [
				x + (dx / magnitude) * u - (dy / magnitude) * v,
				y + (dy / magnitude) * u + (dx / magnitude) * v,
			];
			branches.push(
				polygon([
					local(0, 0),
					local(run * 0.5, bend * 0.35),
					local(run * 0.38, bend * 0.5),
					local(run, bend),
					local(run * 0.28, bend * 0.6),
					local(run * 0.36, bend * 0.36),
					local(0, half),
				]),
			);
		}
	}
	return polygon([...top, ...bottom.reverse()]) + branches.join(" ");
}

type AccentMark = { d: string; opacity: number };
export function accentGeometry({
	width,
	thickness,
	quantity,
	variant,
	seed,
	roughness,
	branching,
	splatter,
}: {
	width: number;
	thickness: number;
	quantity: number;
	variant: AccentStreakVariant;
	seed: number;
	roughness: number;
	branching: number;
	splatter: number;
}): { marks: AccentMark[]; cuts: string[] } {
	const marks: AccentMark[] = [];
	const cuts: string[] = [];
	const rnd = (i: number, j: number) => noise(i, j, seed);
	const add = (points: Point[], opacity = 1) =>
		marks.push({ d: polygon(points), opacity });
	const w = width;
	const h = Math.max(0.1, thickness);
	const detail = Math.max(1, Math.min(128, Math.round(quantity)));
	const bolt = (
		x: number,
		y: number,
		length: number,
		weight: number,
		tilt: number,
	) => {
		const outline: Point[] = [
			[0, 0],
			[0.36, -0.85],
			[0.27, -0.16],
			[0.73, -0.62],
			[0.6, -0.05],
			[1, 0],
			[0.65, 0.72],
			[0.73, 0.16],
			[0.28, 0.61],
			[0.39, 0.08],
		];
		add(
			outline.map(([u, v], i) => [
				x + u * length,
				y + v * weight * (1 + (rnd(i, 78) - 0.5) * roughness * 0.6) + u * tilt,
			]),
		);
	};
	if (variant === "lightning") {
		bolt(-w / 2, 0, w, h, 0);
		for (let i = 0; i < detail * 3; i++) {
			const side = i % 2 ? 1 : -1;
			const x = (rnd(i, 1) - 0.5) * w * 0.85;
			const y = side * h * (0.3 + rnd(i, 2) * 0.7);
			const run = w * (0.06 + rnd(i, 3) * 0.28);
			const tip = y - side * h * (0.08 + rnd(i, 4) * 0.22);
			add([
				[x, y],
				[x + run, tip],
				[x + run * 0.38, y + side * h * 0.045],
			]);
		}
	} else if (variant === "cracks" || variant === "fracture") {
		// Branches share vertices with their trunk; these are fissures, not parallel lanes.
		const crack = (
			start: Point,
			end: Point,
			weight: number,
			key: number,
			depth: number,
		) => {
			const segments = Math.min(20, 6 + detail);
			const magnitude = Math.hypot(end[0] - start[0], end[1] - start[1]);
			const points: Point[] = Array.from({ length: segments + 1 }, (_, i) => {
				const t = i / segments;
				return [
					start[0] + (end[0] - start[0]) * t,
					start[1] +
						(end[1] - start[1]) * t +
						(i === 0 || i === segments
							? 0
							: (rnd(key, i) - 0.5) * Math.min(h, magnitude * 0.2) * roughness),
				];
			});
			const top: Point[] = points.map(([x, y], i) => [
				x,
				y -
					(weight *
						(1 - i / segments) *
						(key === 0 ? Math.sin((i / segments) * Math.PI) ** 0.3 : 1)) /
						2,
			]);
			const bottom: Point[] = points.map(([x, y], i) => [
				x,
				y +
					(weight *
						(1 - i / segments) *
						(key === 0 ? Math.sin((i / segments) * Math.PI) ** 0.3 : 1)) /
						2,
			]);
			add([...top, ...bottom.reverse()]);
			if (depth <= 0) return;
			for (
				let i = 2;
				i < segments;
				i += Math.max(2, Math.ceil(segments / (detail + 1)))
			) {
				const root = points[i];
				if (!root) continue;
				const side = (i + key) % 4 ? 1 : -1;
				crack(
					root,
					[
						root[0] + (end[0] - start[0]) * (0.1 + rnd(key, i + 21) * 0.24),
						root[1] +
							side *
								Math.min(h * 2, magnitude * 0.4) *
								(0.4 + rnd(key, i + 31)),
					],
					weight * 0.48,
					key + i + 13,
					depth - 1,
				);
			}
		};
		const arms = variant === "fracture" ? Math.min(16, detail + 3) : 1;
		for (let i = 0; i < arms; i++) {
			const a = (i / arms) * Math.PI * 2;
			crack(
				arms === 1 ? [-w / 2, 0] : [0, 0],
				arms === 1
					? [w / 2, 0]
					: [(Math.cos(a) * w) / 2, Math.sin(a) * h * 2.5],
				h * 0.18,
				i,
				Math.min(3, Math.max(0, Math.round(branching))),
			);
		}
	} else if (
		variant === "splash" ||
		variant === "burst" ||
		variant === "splatter"
	) {
		const samples = Math.min(160, 32 + detail * 4);
		const points: Point[] = Array.from({ length: samples }, (_, i) => {
			const a = (i / samples) * Math.PI * 2;
			const r =
				i % 4 === 0 ? 0.8 + rnd(i, 1) * roughness : 0.2 + rnd(i, 2) * 0.25;
			return [Math.cos(a) * w * 0.45 * r, Math.sin(a) * h * 2 * r];
		});
		if (variant === "splash") {
			// Curved lobes and narrow tendrils keep wet paint distinct from an impact burst.
			marks.push({
				d: `M${points[0]?.join(" ")} ${points
					.map((p, i) => {
						const n = points[(i + 1) % points.length] ?? p;
						return `Q${p.join(" ")} ${(p[0] + n[0]) / 2} ${(p[1] + n[1]) / 2}`;
					})
					.join(" ")} Z`,
				opacity: 1,
			});
		} else if (variant === "splatter") {
			for (let i = 0; i < detail * 5; i++) {
				const x = (rnd(i, 151) - 0.5) * w * 0.85;
				const y = (rnd(i, 152) - 0.5) * h * 2;
				const r = h * (0.025 + rnd(i, 153) ** 3 * 0.22);
				marks.push({
					d: `M${x - r} ${y} a${r} ${r * 0.8} 0 1 0 ${r * 2} 0 a${r} ${r * 0.8} 0 1 0 ${-r * 2} 0`,
					opacity: 0.8 + rnd(i, 154) * 0.2,
				});
			}
		} else add(points);
	} else {
		// A single pressure envelope joins many uneven bristles into one smeared stroke.
		const bristles = Math.min(320, 36 + detail * 9);
		for (let i = 0; i < bristles; i++) {
			const lane = (i / (bristles - 1)) * 2 - 1;
			const pressure = Math.sqrt(Math.max(0, 1 - lane * lane));
			const start =
				-w * (0.2 + pressure * 0.3) + rnd(i, 1) * w * 0.16 * roughness;
			const end =
				w * (0.12 + pressure * 0.38) - rnd(i, 2) * w * 0.24 * roughness;
			const y = lane * h * (variant === "underline" ? 0.22 : 0.55);
			const weight =
				(h / bristles) *
				(variant === "dry-brush" ? 0.85 : variant === "ink" ? 4 : 2.4);
			const drift = (rnd(i, 3) - 0.5) * h * 0.16;
			const edge = (side: number): Point[] =>
				Array.from({ length: 12 }, (_, p) => {
					const t = p / 11;
					return [
						start + (end - start) * t,
						y +
							drift * t +
							side *
								weight *
								Math.sin(Math.PI * t) *
								(1 + rnd(i, p + 80) * roughness * 2),
					];
				});
			add([...edge(-1), ...edge(1).reverse()], 0.8 + rnd(i, 4) * 0.2);
		}
		if (variant === "comet") bolt(-w * 0.45, 0, w * 0.9, h * 0.3, 0);
		if (variant === "slashes") {
			for (let i = 0; i < detail; i++)
				bolt(
					-w * 0.4 + rnd(i, 6) * w * 0.3,
					(rnd(i, 7) - 0.5) * h * 2,
					w * 0.5,
					h * 0.1,
					h * 0.5,
				);
		}
		for (let i = 0; i < Math.min(4000, detail * 8 * roughness); i++) {
			const x = (rnd(i, 11) - 0.5) * w;
			const y = (rnd(i, 12) - 0.5) * h;
			const l = w * (0.02 + rnd(i, 13) * 0.22);
			cuts.push(
				polygon([
					[x, y],
					[x + l, y - 1],
					[x + l * 0.8, y + 1 + rnd(i, 14) * 3],
				]),
			);
		}
		for (let i = 0; i < Math.min(2000, detail * 100 * roughness); i++) {
			const x = (rnd(i, 91) - 0.5) * w;
			const y = (rnd(i, 92) - 0.5) * h * 1.15;
			const l = 0.3 + rnd(i, 93) * w * 0.018;
			const r = 0.3 + rnd(i, 94) * 1.5;
			cuts.push(
				polygon([
					[x, y],
					[x + l, y - r],
					[x + l * 0.6, y + r],
				]),
			);
		}
	}
	const droplets = Math.min(
		2000,
		Math.round(Math.max(0, splatter) * (160 + detail * 64)),
	);
	for (let i = 0; i < droplets; i++) {
		const x = (rnd(i, 51) - 0.5) * w * 1.12;
		const y = (rnd(i, 52) - 0.5) * h * 4;
		const r = 0.25 + rnd(i, 53) ** 8 * h * 0.055;
		marks.push({
			d: `M${x - r} ${y} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`,
			opacity: 0.5 + rnd(i, 54) * 0.5,
		});
	}
	return { marks, cuts };
}
