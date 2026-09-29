import type { CSSProperties } from "react";

export const geometryShapes = [
	"rectangle",
	"slant-left",
	"slant-right",
	"slant-both",
	"corner-left",
	"corner-right",
	"corner-bottom-left",
	"corner-bottom-right",
	"corners-left",
	"corners-right",
] as const;

export const geometrySlants = {
	sm: "6px",
	md: "10px",
	lg: "14px",
	xl: "18px",
} as const;

export type GeometryShape = (typeof geometryShapes)[number];
export type GeometrySlant = keyof typeof geometrySlants | `${number}px`;

export type GeometryStyle = CSSProperties & {
	"--ts-geometry-slant"?: string;
};

export function resolveGeometrySlant(
	slant: GeometrySlant | undefined,
): string | undefined {
	if (!slant) return undefined;
	return slant in geometrySlants
		? geometrySlants[slant as keyof typeof geometrySlants]
		: slant;
}
