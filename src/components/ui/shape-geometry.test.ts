import { describe, expect, it } from "vitest";
import {
	type ShapeConfiguration,
	compileShape,
	resolveShapeTreatments,
} from "./shape-geometry";

describe("composed shapes", () => {
	it("shares the larger corner outset and reserves the larger center outset", () => {
		const result = compileShape(
			[
				{ type: "step", position: "top-left-h", direction: "outward", size: 5 },
				{
					type: "step",
					position: "top-right-h",
					direction: "outward",
					size: 10,
				},
				{
					type: "step",
					position: "top-center",
					direction: "outward",
					size: 15,
					width: 60,
				},
			],
			300,
			100,
		);
		expect(result.reservations.top).toBe(15);
		expect(result.cornerOutsets.top).toBe(10);
		expect(result.rings.flat()).toContainEqual([0, 5]);
		expect(result.rings.flat()).toContainEqual([300, 5]);
		expect(result.rings.flat()).toContainEqual([135, 0]);
	});
	it("adds inward gaps to the outward baseline", () => {
		const result = compileShape(
			[
				{ type: "step", position: "top-left-h", direction: "inward", size: 10 },
				{
					type: "step",
					position: "top-right-h",
					direction: "inward",
					size: 10,
				},
				{
					type: "step",
					position: "top-center",
					direction: "outward",
					size: 15,
					width: 60,
				},
			],
			300,
			100,
		);
		expect(result.rings.flat()).toContainEqual([0, 25]);
		expect(result.rings.flat()).toContainEqual([300, 25]);
	});
	it("uses the larger outward step on a vertical side", () => {
		const result = compileShape(
			[
				{
					type: "step",
					position: "top-left-v",
					direction: "outward",
					size: 10,
				},
				{
					type: "step",
					position: "bottom-left-v",
					direction: "outward",
					size: 15,
				},
			],
			200,
			160,
		);
		expect(result.reservations.left).toBe(15);
		expect(result.cornerOutsets.left).toBe(15);
		expect(result.rings.flat()).toContainEqual([0, 0]);
		expect(result.rings.flat()).toContainEqual([0, 160]);
	});
	it("full sides override their slots, and base steps override h/v slots", () => {
		const shapes: ShapeConfiguration = [
			{ type: "step", position: "top-left-h" },
			{ type: "step", position: "top-left-v" },
			{ type: "slant", position: "top-left", orientation: "horizontal" },
			{ type: "notch", position: "top-center" },
			{ type: "slant", position: "top", slope: "end" },
		];
		expect(resolveShapeTreatments(shapes)).toEqual([shapes[4]]);
	});
	it("allows a corner alongside independent horizontal and vertical steps", () => {
		const result = compileShape(
			[
				{ type: "step", position: "top-left-h", size: 10 },
				{ type: "step", position: "top-left-v", size: 10 },
				{ type: "corner", position: "top-left", size: 5 },
			],
			200,
			100,
		);
		expect(result.rings.flat()).toContainEqual([10, 15]);
		expect(result.rings.flat()).toContainEqual([15, 10]);
	});
	it.each(["top", "bottom", "left", "right"] as const)(
		"honors start/end slopes on %s",
		(position) => {
			const start = compileShape(
				[{ type: "slant", position, size: 20, slope: "start" }],
				200,
				100,
			);
			const end = compileShape(
				[{ type: "slant", position, size: 20, slope: "end" }],
				200,
				100,
			);
			expect(start.path).not.toBe(end.path);
			expect(start.path).not.toContain("NaN");
		},
	);
	it("rescales percent sizes with the parent and keeps pixel sizes fixed", () => {
		const a = compileShape(
			[{ type: "corner", position: "top-left", size: "10%" }],
			200,
			100,
		);
		const b = compileShape(
			[{ type: "corner", position: "top-left", size: "10%" }],
			400,
			200,
		);
		expect(a.rings.flat()).toContainEqual([10, 0]);
		expect(b.rings.flat()).toContainEqual([20, 0]);
		expect(
			compileShape(
				[{ type: "corner", position: "top-left", size: 10 }],
				400,
				200,
			).rings.flat(),
		).toContainEqual([10, 0]);
	});
});
