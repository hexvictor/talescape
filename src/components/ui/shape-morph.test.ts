import { describe, expect, it } from "vitest";
import { compileShape } from "./shape-geometry";
import { createShapeMorph } from "./shape-morph";
describe("outline morphing", () => {
	it("interpolates differing vertex counts and keeps exact endpoints", () => {
		const from = compileShape(
			[{ type: "corner", position: "top-left", size: 12 }],
			240,
			60,
		);
		const to = compileShape(
			[
				{ type: "step", position: "bottom-center", size: 16, width: 64 },
				{ type: "slant", position: "right", size: 20, slope: "end" },
			],
			240,
			60,
		);
		const morph = createShapeMorph(from.path, to.path);
		expect(morph(0)).toBe(from.path);
		expect(morph(1)).toBe(to.path);
		expect(morph(0.5)).not.toBe(from.path);
		expect(morph(0.5)).not.toBe(to.path);
		expect(morph(0.5)).not.toMatch(/NaN|Infinity/);
		const reverse = createShapeMorph(morph(0.4), from.path);
		expect(reverse(0)).toBe(morph(0.4));
		expect(reverse(1)).toBe(from.path);
	});
});
