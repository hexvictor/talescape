import polygonClipping, { type Polygon, type Ring } from "polygon-clipping";

export const shapeCorners = [
	"top-left",
	"top-right",
	"bottom-left",
	"bottom-right",
] as const;
export const shapeSides = ["top", "right", "bottom", "left"] as const;
export const shapePositions = [
	...shapeCorners,
	"top-left-h",
	"top-left-v",
	"top-right-h",
	"top-right-v",
	"bottom-left-h",
	"bottom-left-v",
	"bottom-right-h",
	"bottom-right-v",
	"top-center",
	"right-center",
	"bottom-center",
	"left-center",
	...shapeSides,
] as const;
export type ShapeCorner = (typeof shapeCorners)[number];
export type ShapeSide = (typeof shapeSides)[number];
export type ShapePosition = (typeof shapePositions)[number];
export type ShapeLength = number | `${number}px` | `${number}%`;
type CornerSlot = ShapeCorner | `${ShapeCorner}-h` | `${ShapeCorner}-v`;
type CenterSlot =
	| "top-center"
	| "right-center"
	| "bottom-center"
	| "left-center";
type ShapeBase = { size?: ShapeLength };
export type ShapeTreatment =
	| (ShapeBase & { type: "corner"; position: ShapeCorner })
	| (ShapeBase & {
			type: "slant";
			position: CornerSlot;
			orientation?: "horizontal" | "vertical";
			extent?: ShapeLength;
	  })
	| (ShapeBase & {
			type: "step";
			position: CornerSlot | CenterSlot;
			orientation?: "horizontal" | "vertical";
			direction?: "inward" | "outward";
			extent?: ShapeLength;
			width?: ShapeLength;
			offset?: ShapeLength;
			ramp?: ShapeLength;
	  })
	| (ShapeBase & {
			type: "notch";
			position: CenterSlot;
			direction?: "inward" | "outward";
			width?: ShapeLength;
			offset?: ShapeLength;
	  })
	| (ShapeBase & {
			type: "slant";
			position: ShapeSide;
			slope?: "start" | "end";
	  })
	| (ShapeBase & { type: "corners"; position: ShapeSide });
export type ShapeConfiguration = readonly ShapeTreatment[];
export type ShapeGeometry = {
	path: string;
	clipPath: string;
	rings: Ring[];
	reservations: Record<ShapeSide, number>;
	cornerOutsets: Record<ShapeSide, number>;
};

const clamp = (value: number, min: number, max: number) =>
	Math.max(min, Math.min(max, value));
export function shapeLength(
	value: ShapeLength | undefined,
	total: number,
	fallback: number,
): number {
	if (value === undefined) return fallback;
	const parsed = typeof value === "number" ? value : Number.parseFloat(value);
	return Number.isFinite(parsed)
		? Math.max(
				0,
				typeof value === "string" && value.endsWith("%")
					? (parsed * total) / 100
					: parsed,
			)
		: fallback;
}
function isSide(position: string): position is ShapeSide {
	return (shapeSides as readonly string[]).includes(position);
}
function cornerName(position: string): ShapeCorner | undefined {
	return shapeCorners.find(
		(corner) =>
			position === corner ||
			position === `${corner}-h` ||
			position === `${corner}-v`,
	);
}
function cornerSides(corner: ShapeCorner): [ShapeSide, ShapeSide] {
	return [
		corner.startsWith("top") ? "top" : "bottom",
		corner.endsWith("left") ? "left" : "right",
	];
}
function treatmentSide(treatment: ShapeTreatment): ShapeSide | undefined {
	if (isSide(treatment.position)) return treatment.position;
	const corner = cornerName(treatment.position);
	if (!corner) return treatment.position.split("-")[0] as ShapeSide;
	if (treatment.type === "corner") return undefined;
	const orientation = treatment.position.endsWith("-h")
		? "horizontal"
		: treatment.position.endsWith("-v")
			? "vertical"
			: "orientation" in treatment
				? (treatment.orientation ?? "vertical")
				: "vertical";
	return cornerSides(corner)[orientation === "horizontal" ? 0 : 1];
}

/** Exact slots are last-wins; full sides and base-corner slants/steps take precedence. */
export function resolveShapeTreatments(
	shapes: ShapeConfiguration,
): ShapeTreatment[] {
	const slots = new Map(shapes.map((shape) => [shape.position, shape]));
	return [...slots.values()].filter((shape) => {
		if (isSide(shape.position)) return true;
		const corner = cornerName(shape.position);
		if (corner) {
			const base = slots.get(corner);
			if (shape.position !== corner && base && base.type !== "corner")
				return false;
			if (shape.type === "corner")
				return !cornerSides(corner).some((side) => slots.has(side));
		}
		const side = treatmentSide(shape);
		return !side || !slots.has(side);
	});
}

type ProfilePoint = [number, number];
function interpolate(points: ProfilePoint[], s: number): number {
	for (let i = 1; i < points.length; i++) {
		const previous = points[i - 1];
		const next = points[i];
		if (previous && next && s <= next[0])
			return (
				previous[1] +
				((next[1] - previous[1]) * (s - previous[0])) /
					Math.max(0.00001, next[0] - previous[0])
			);
	}
	return points.at(-1)?.[1] ?? 0;
}
function sideProfile(
	side: ShapeSide,
	length: number,
	depth: number,
	shapes: ShapeTreatment[],
): { points: ProfilePoint[]; reservation: number; cornerOutset: number } {
	const relevant = shapes.filter((shape) => treatmentSide(shape) === side);
	const full = relevant.find((shape) => isSide(shape.position));
	const sizeOf = (shape: ShapeTreatment) =>
		clamp(shapeLength(shape.size, depth, 12), 0, depth * 0.45);
	if (full) {
		const size = sizeOf(full);
		return {
			points:
				full.type === "corners"
					? [
							[0, size],
							[Math.min(size, length / 2), 0],
							[Math.max(length - size, length / 2), 0],
							[length, size],
						]
					: "slope" in full && full.slope === "end"
						? [
								[0, 0],
								[length, size],
							]
						: [
								[0, size],
								[length, 0],
							],
			reservation: 0,
			cornerOutset: 0,
		};
	}
	const center = relevant.find((shape) => !cornerName(shape.position));
	const cornerShapes = relevant.filter((shape) => cornerName(shape.position));
	const cornerOutset = Math.max(
		0,
		...cornerShapes
			.filter((shape) => shape.type === "step" && shape.direction === "outward")
			.map(sizeOf),
	);
	const centerOutset =
		center && "direction" in center && center.direction === "outward"
			? sizeOf(center)
			: 0;
	const reservation = Math.max(cornerOutset, centerOutset);
	const startCorner = side === "top" || side === "bottom" ? "left" : "top";
	const start = cornerShapes.find((shape) =>
		cornerName(shape.position)?.includes(startCorner),
	);
	const end = cornerShapes.find((shape) => shape !== start);
	const centerWidth = center
		? clamp(
				shapeLength(
					"width" in center ? center.width : undefined,
					length,
					length * 0.25,
				),
				0,
				length,
			)
		: 0;
	const centerOffset =
		center && "offset" in center
			? clamp(
					shapeLength(center.offset, length, length / 2),
					centerWidth / 2,
					length - centerWidth / 2,
				)
			: length / 2;
	const centerStart = center ? centerOffset - centerWidth / 2 : length / 2;
	const centerEnd = center ? centerOffset + centerWidth / 2 : length / 2;
	const cornerProfile = (
		shape: ShapeTreatment | undefined,
		fromEnd: boolean,
	): ProfilePoint[] => {
		if (!shape)
			return [
				[0, reservation],
				[length, reservation],
			];
		const extent =
			"extent" in shape
				? shapeLength(shape.extent, length, length / 2)
				: length / 2;
		const span = clamp(
			extent,
			0,
			Math.min(length / 2, fromEnd ? length - centerEnd : centerStart),
		);
		const size = sizeOf(shape);
		const cornerDepth =
			shape.type === "step" && shape.direction === "outward"
				? reservation - cornerOutset
				: reservation + size;
		const ramp =
			shape.type === "step"
				? Math.min(span, shapeLength(shape.ramp, length, size))
				: span;
		const points: ProfilePoint[] = [
			[0, cornerDepth],
			[Math.max(0, span - ramp), cornerDepth],
			[span, reservation],
			[length, reservation],
		];
		return fromEnd ? points.reverse().map(([s, d]) => [length - s, d]) : points;
	};
	const first = cornerProfile(start, false);
	const last = cornerProfile(end, true);
	const knots = [...new Set([...first, ...last].map(([s]) => s))].sort(
		(a, b) => a - b,
	);
	let points: ProfilePoint[] = knots.map((s) => [
		s,
		interpolate(s <= length / 2 ? first : last, s),
	]);
	if (center) {
		const target =
			"direction" in center && center.direction === "outward"
				? reservation - sizeOf(center)
				: reservation + sizeOf(center);
		const ramp =
			center.type === "step"
				? Math.min(
						centerWidth / 2,
						shapeLength(center.ramp, length, sizeOf(center)),
					)
				: centerWidth / 2;
		points = [
			...points.filter(([s]) => s < centerStart),
			[centerStart, reservation],
			[centerStart + ramp, target],
			[centerEnd - ramp, target],
			[centerEnd, reservation],
			...points.filter(([s]) => s > centerEnd),
		];
	}
	return { points, reservation, cornerOutset };
}
function project(
	side: ShapeSide,
	width: number,
	height: number,
	[s, d]: ProfilePoint,
): [number, number] {
	switch (side) {
		case "top":
			return [s, d];
		case "bottom":
			return [s, height - d];
		case "left":
			return [d, s];
		case "right":
			return [width - d, s];
	}
}
const number = (value: number) => Math.round(value * 1000) / 1000;

export function compileShape(
	shapes: ShapeConfiguration,
	width: number,
	height: number,
): ShapeGeometry {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const treatments = resolveShapeTreatments(shapes);
	const reservations = { top: 0, right: 0, bottom: 0, left: 0 };
	const cornerOutsets = { top: 0, right: 0, bottom: 0, left: 0 };
	const profiles = new Map<ShapeSide, ProfilePoint[]>();
	const cuts: Polygon[] = [];
	for (const side of shapeSides) {
		const length = side === "top" || side === "bottom" ? w : h;
		const depth = side === "top" || side === "bottom" ? h : w;
		const profile = sideProfile(side, length, depth, treatments);
		profiles.set(side, profile.points);
		reservations[side] = profile.reservation;
		cornerOutsets[side] = profile.cornerOutset;
		if (profile.points.some(([, d]) => d > 0))
			cuts.push([
				[
					project(side, w, h, [0, -1]),
					...profile.points.map((point) => project(side, w, h, point)),
					project(side, w, h, [length, -1]),
				],
			]);
	}
	for (const shape of treatments) {
		if (shape.type !== "corner") continue;
		const [horizontal, vertical] = cornerSides(shape.position);
		const top = horizontal === "top";
		const left = vertical === "left";
		const xDepth = interpolate(profiles.get(vertical) ?? [], top ? 0 : h);
		const yDepth = interpolate(profiles.get(horizontal) ?? [], left ? 0 : w);
		const x = left ? xDepth : w - xDepth;
		const y = top ? yDepth : h - yDepth;
		const size = clamp(
			shapeLength(shape.size, Math.min(w, h), 12),
			0,
			Math.min(w, h) * 0.45,
		);
		if (size)
			cuts.push([
				[
					[x, y],
					[x + (left ? size : -size), y],
					[x, y + (top ? size : -size)],
				],
			]);
	}
	const rectangle: Polygon = [
		[
			[0, 0],
			[w, 0],
			[w, h],
			[0, h],
			[0, 0],
		],
	];
	const result = cuts.length
		? polygonClipping.difference(rectangle, ...cuts)
		: [rectangle];
	const rings = result.flat();
	const path = rings
		.map(
			(ring) =>
				`${ring
					.map(([x, y], i) => `${i ? "L" : "M"}${number(x)} ${number(y)}`)
					.join(" ")} Z`,
		)
		.join(" ");
	return {
		path,
		clipPath: path ? `path(evenodd, "${path}")` : "inset(100%)",
		rings,
		reservations,
		cornerOutsets,
	};
}
