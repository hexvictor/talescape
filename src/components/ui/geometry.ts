import type { CSSProperties } from "react";
import type { ShapeOptions } from "./shape";
import type { ShapeConfiguration, ShapeTreatment } from "./shape-geometry";

export const geometryShapes = [
	"rectangle",
	"cut-opposite",
	"cut-opposite-reverse",
	"corner-top-left",
	"corner-top-right",
	"slant-left",
	"slant-right",
	"slant-both",
	"corner-left",
	"corner-right",
	"corner-bottom-left",
	"corner-bottom-right",
	"corners-left",
	"corners-right",
	"step-bottom-left",
	"step-bottom-right",
	"notch-bottom",
	"slant-left-step-bottom-right",
	"slant-left-step-bottom-left",
] as const;

export const geometrySlants = {
	sm: "6px",
	md: "10px",
	lg: "14px",
	xl: "18px",
} as const;

export type GeometryShape = (typeof geometryShapes)[number];
export type GeometrySlant =
	| keyof typeof geometrySlants
	| `${number}px`
	| `${number}%`;

export type GeometryStyle = CSSProperties & {
	"--ts-geometry-slant"?: string;
	"--ts-geometry-step-position"?: string;
	"--ts-geometry-step-depth"?: string;
	"--ts-geometry-edge-slant"?: string;
};

/** Composed shapes are shared; named shapes remain available for existing callers. */
export type SurfaceShapeProps = ShapeOptions & {
	shape?: GeometryShape;
	slant?: GeometrySlant;
	edgeSlant?: GeometrySlant;
	stepPosition?: `${number}%`;
	stepDepth?: `${number}px`;
};

export function resolveGeometrySlant(
	slant: GeometrySlant | undefined,
): string | undefined {
	if (!slant) return undefined;
	return slant in geometrySlants
		? geometrySlants[slant as keyof typeof geometrySlants]
		: slant;
}

/** Translate compatibility names into the same outline used by composed surfaces. */
export function geometryShapeTreatments(
	shape: GeometryShape,
	slant: GeometrySlant = "md",
	stepPosition: `${number}%` = "55%",
	stepDepth: `${number}px` = "6px",
	edgeSlant?: GeometrySlant,
): ShapeConfiguration {
	const size = resolveGeometrySlant(slant) as `${number}px` | `${number}%`;
	const left: ShapeTreatment = {
		type: "slant",
		position: "left",
		size: (resolveGeometrySlant(edgeSlant) as typeof size) ?? size,
		slope: "start",
	};
	const right: ShapeTreatment = {
		type: "slant",
		position: "right",
		size,
		slope: "end",
	};
	const corner = (
		position: "top-left" | "top-right" | "bottom-left" | "bottom-right",
	): ShapeTreatment => ({ type: "corner", position, size });
	const step = (side: "left" | "right"): ShapeTreatment => ({
		type: "step",
		position: side === "left" ? "bottom-left-h" : "bottom-right-h",
		direction: "inward",
		size: stepDepth,
		extent:
			side === "left"
				? stepPosition
				: `${100 - Number.parseFloat(stepPosition)}%`,
		ramp: size,
	});
	switch (shape) {
		case "rectangle":
			return [];
		case "cut-opposite":
			return [corner("top-right"), corner("bottom-left")];
		case "cut-opposite-reverse":
			return [corner("top-left"), corner("bottom-right")];
		case "corner-top-left":
			return [corner("top-left")];
		case "corner-top-right":
			return [corner("top-right")];
		case "slant-left":
			return [left];
		case "slant-right":
			return [right];
		case "slant-both":
			return [left, right];
		case "corner-left":
			return [corner("top-left")];
		case "corner-right":
			return [corner("top-right")];
		case "corner-bottom-left":
			return [corner("bottom-left")];
		case "corner-bottom-right":
			return [corner("bottom-right")];
		case "corners-left":
			return [corner("top-left"), corner("bottom-left")];
		case "corners-right":
			return [corner("top-right"), corner("bottom-right")];
		case "step-bottom-left":
			return [step("left")];
		case "step-bottom-right":
			return [step("right")];
		case "slant-left-step-bottom-left":
			return [left, step("left")];
		case "slant-left-step-bottom-right":
			return [left, step("right")];
		case "notch-bottom":
			return [
				{
					type: "notch",
					position: "bottom-center",
					direction: "inward",
					size: stepDepth,
					offset: stepPosition,
					width: `${Number.parseFloat(size) * 2}${size.endsWith("%") ? "%" : "px"}`,
				},
			];
	}
}
