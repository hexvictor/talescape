import { describe, expect, it } from "vitest";
import type { Anchor } from "../types";
import { resolveGroupEdgeBlockPoint } from "./readerSceneLayout";

function anchor(
	id: string,
	x: number,
	y: number,
	width: number,
	height: number,
): Anchor {
	return {
		sceneId: id,
		cameraFramingOffset: { x: 0, y: 0 },
		cameraPoint: { x, y },
		height,
		id,
		point: { x, y },
		readingPathPoints: [{ x: 0, y: 0 }],
		scroll: 0,
		width,
	} as Anchor;
}

describe("resolveGroupEdgeBlockPoint", () => {
	it("places a wide block directly below a two-column panel group", () => {
		const scenes = [
			anchor("old", 0, -720, 1280, 720),
			anchor("left", 0, 0, 640, 360),
			anchor("right", 640, 0, 640, 360),
		];

		const point = resolveGroupEdgeBlockPoint(
			{ x: 640, y: 540 },
			{ height: 720, width: 1280 },
			"down",
			scenes,
			{
				crossAxisAlignment: "start",
				horizontalAlignment: "start",
				referenceCamera: { x: 320, y: 0 },
				viewport: { height: 720, width: 1280 },
			},
		);

		expect(point).toEqual({ x: 320, y: 540 });
	});

	it("keeps an edge-touching sibling in a completed panel row", () => {
		const scenes = [
			anchor("left", 0, 0, 640, 360),
			anchor("right", 640, 0, 640, 360),
		];

		const point = resolveGroupEdgeBlockPoint(
			{ x: 640, y: 540 },
			{ height: 720, width: 1920 },
			"down",
			scenes,
			{
				horizontalAlignment: "start",
				referenceCamera: { x: 960, y: 0 },
				viewport: { height: 720, width: 1280 },
			},
		);

		expect(point).toEqual({ x: 640, y: 540 });
	});

	it("does not use the camera viewport bottom as the panel-group edge", () => {
		const scenes = [
			anchor("older-camera-panel", 320, 360, 1280, 360),
			anchor("left", 0, 0, 640, 360),
			anchor("right", 640, 0, 640, 360),
		];

		const point = resolveGroupEdgeBlockPoint(
			{ x: 640, y: 540 },
			{ height: 720, width: 1920 },
			"down",
			scenes,
			{
				horizontalAlignment: "start",
				referenceCamera: { x: 320, y: 180 },
				viewport: { height: 720, width: 1280 },
			},
		);

		expect(point).toEqual({ x: 640, y: 540 });
	});

	it("uses only scenes framed by the previous camera", () => {
		const scenes = [
			anchor("old", 0, 1080, 1280, 720),
			anchor("top", 0, 0, 640, 360),
			anchor("bottom", 0, 360, 640, 360),
		];

		const point = resolveGroupEdgeBlockPoint(
			{ x: 960, y: 360 },
			{ height: 720, width: 1280 },
			"right",
			scenes,
			{
				crossAxisAlignment: "start",
				referenceCamera: { x: 0, y: 180 },
				viewport: { height: 720, width: 1280 },
			},
		);

		expect(point).toEqual({ x: 960, y: 180 });
	});
});
