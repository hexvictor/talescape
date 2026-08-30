import { describe, expect, it } from "vitest";
import type { SnapPoint, TaleSnapConfig, TimelineSegment } from "../types";
import { createReaderSnapModel } from "./scrollSnapModel";

const defaults: TaleSnapConfig = {
	scrollSnap: { captureDistancePx: 1_000 },
	snap: { captureDistancePx: 1_000 },
};

const segments: TimelineSegment[] = [
	{
		blockId: "block-a",
		end: 100,
		index: 0,
		length: 100,
		start: 0,
		type: "reading",
	},
	{
		end: 150,
		fromBlockId: "block-a",
		index: 1,
		length: 50,
		start: 100,
		toBlockId: "block-b",
		type: "transition",
	},
	{
		blockId: "block-b",
		end: 250,
		index: 2,
		length: 100,
		start: 150,
		type: "reading",
	},
	{
		end: 300,
		fromBlockId: "block-b",
		index: 3,
		length: 50,
		start: 250,
		toBlockId: "block-c",
		type: "transition",
	},
	{
		blockId: "block-c",
		end: 400,
		index: 4,
		length: 100,
		start: 300,
		type: "reading",
	},
];

const points: SnapPoint[] = [
	{
		blockId: "block-a",
		direction: "fromNext",
		id: "block-a-end",
		mode: "scroll-snap",
		scroll: 100,
		type: "block-end",
	},
	{
		blockId: "block-c",
		direction: "fromPrevious",
		id: "block-c-start",
		mode: "scroll-snap",
		scroll: 300,
		type: "block-start",
	},
];

describe("createReaderSnapModel", () => {
	it("does not skip forward across a non-snapping adjacent block", () => {
		const model = createReaderSnapModel(points, segments);

		expect(model.getSnapTarget(320, 1, defaults, 50)).toBeNull();
	});

	it("does not skip backward across a non-snapping adjacent block", () => {
		const model = createReaderSnapModel(points, segments);

		expect(model.getSnapTarget(80, -1, defaults, 350)).toBeNull();
	});

	it("keeps scrolling freely while movement remains inside a reading block", () => {
		const model = createReaderSnapModel(points, segments);

		expect(model.getSnapTarget(220, 1, defaults, 180)).toBeNull();
	});

	it("snaps to the immediate next block when movement crosses its transition", () => {
		const model = createReaderSnapModel(points, segments);

		expect(model.getSnapTarget(260, 1, defaults, 220)?.scroll).toBe(300);
	});

	it("snaps to the immediate previous block when movement crosses its transition", () => {
		const model = createReaderSnapModel(points, segments);

		expect(model.getSnapTarget(140, -1, defaults, 200)?.scroll).toBe(100);
	});

	it("continues snapping while movement remains inside the direct transition", () => {
		const model = createReaderSnapModel(points, segments);

		expect(model.getSnapTarget(275, 1, defaults, 260)?.scroll).toBe(300);
	});

	it("starts strict snap as soon as the direct transition is entered", () => {
		const strictPoint: SnapPoint = {
			blockId: "block-b",
			direction: "fromPrevious",
			id: "block-b-transition-start",
			mode: "snap",
			scroll: 150,
			transitionEnd: 150,
			transitionStart: 100,
			type: "block-start",
		};
		const model = createReaderSnapModel([strictPoint], segments);
		const narrowCaptureDefaults: TaleSnapConfig = {
			scrollSnap: {},
			snap: { captureDistancePx: 1 },
		};

		expect(
			model.getSnapTarget(101, 1, narrowCaptureDefaults, 80),
		).toMatchObject({
			forced: true,
			scroll: 150,
		});
	});
});
