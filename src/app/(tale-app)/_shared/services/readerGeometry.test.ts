import { describe, expect, it } from "vitest";
import {
	getAdjacentBlockPoint,
	getBlockEdgeWithViewportAlignmentPoint,
	getCameraViewportEdgePoint,
} from "./readerGeometry";

describe("getAdjacentBlockPoint", () => {
	it("places differently sized blocks edge-to-edge", () => {
		expect(
			getAdjacentBlockPoint(
				{ x: 0, y: 0 },
				{ height: 800, width: 250 },
				{ height: 400, width: 500 },
				"right",
				{ x: 0, y: 0 },
			),
		).toEqual({ x: 375, y: 0 });
	});

	it("aligns horizontal placements to the previous top edge", () => {
		expect(
			getAdjacentBlockPoint(
				{ x: 0, y: 0 },
				{ height: 800, width: 250 },
				{ height: 200, width: 250 },
				"right",
				{ x: 0, y: 0 },
				"start",
			),
		).toEqual({ x: 250, y: -300 });
	});

	it("supports diagonal placement without viewport framing offsets", () => {
		const point = getAdjacentBlockPoint(
			{ x: 100, y: 100 },
			{ height: 200, width: 300 },
			{ height: 100, width: 100 },
			"down-left",
			{ x: 20, y: 30 },
		);
		expect(point.x).toBeCloseTo(-116.4, 1);
		expect(point.y).toBeCloseTo(274.6, 1);
	});
});

describe("getCameraViewportEdgePoint", () => {
	it("aligns a tall destination to the top of the previous viewport", () => {
		expect(
			getCameraViewportEdgePoint(
				{ x: 500, y: 400 },
				{ height: 800, width: 1000 },
				{ height: 1400, width: 600 },
				"right",
				{ x: 0, y: 0 },
				"start",
			),
		).toEqual({ x: 1300, y: 700 });
	});

	it("aligns a destination below the left edge of the previous viewport", () => {
		expect(
			getCameraViewportEdgePoint(
				{ x: 500, y: 400 },
				{ height: 800, width: 1000 },
				{ height: 500, width: 400 },
				"down",
				{ x: 0, y: 0 },
				"start",
			),
		).toEqual({ x: 200, y: 1050 });
	});
});

describe("getBlockEdgeWithViewportAlignmentPoint", () => {
	it("uses the block right edge and the camera viewport top edge", () => {
		expect(
			getBlockEdgeWithViewportAlignmentPoint(
				{
					height: 200,
					point: { x: 300, y: 700 },
					width: 250,
				},
				{ x: 300, y: 400 },
				{ height: 800, width: 1000 },
				{ height: 1400, width: 600 },
				"right",
				{ x: 0, y: 0 },
				"start",
			),
		).toEqual({ x: 725, y: 700 });
	});

	it("uses the block bottom edge and the camera viewport left edge", () => {
		expect(
			getBlockEdgeWithViewportAlignmentPoint(
				{
					height: 300,
					point: { x: 900, y: 600 },
					width: 200,
				},
				{ x: 500, y: 600 },
				{ height: 800, width: 1000 },
				{ height: 500, width: 400 },
				"down",
				{ x: 0, y: 0 },
				"start",
			),
		).toEqual({ x: 200, y: 1000 });
	});
});
