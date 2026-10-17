import { describe, expect, it } from "vitest";
import { geometryShapeTreatments, geometryShapes } from "./geometry";
import { compileShape } from "./shape-geometry";
describe("named shape compatibility", () => {
	it("preserves the original opposite-corner preset orientation", () => {
		expect(
			geometryShapeTreatments("cut-opposite").map((shape) => shape.position),
		).toEqual(["top-right", "bottom-left"]);
		expect(
			geometryShapeTreatments("cut-opposite-reverse").map(
				(shape) => shape.position,
			),
		).toEqual(["top-left", "bottom-right"]);
	});
	it("compiles every compatibility shape through the composed geometry engine", () => {
		for (const shape of geometryShapes) {
			const result = compileShape(
				geometryShapeTreatments(shape, "lg"),
				240,
				60,
			);
			expect(result.path).not.toMatch(/NaN|Infinity/);
			expect(result.rings).toHaveLength(1);
		}
	});
});
