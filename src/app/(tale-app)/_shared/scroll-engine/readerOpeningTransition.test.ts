import { describe, expect, it } from "vitest";
import { compileReader } from "../services/readerCompiler";
import type { Tale } from "../types";
import { compileReaderFramePlans } from "./readerFramePlan";

function createSingleBlockTale(): Tale {
	return {
		bounds: { rootBranchId: "branch-1" },
		firstBlockTransitionMode: "inPlace",
		indexMap: {
			blocksById: {
				"block-1": {
					branchId: "branch-1",
					entryId: "entry-1",
					id: "block-1",
					isChoiceBlock: false,
					pageId: "page-1",
					partId: "part-1",
					reading: {
						cameraPath: { mode: "auto" },
						pauses: { atEnd: 0, atStart: 0 },
						readingLength: 300,
						readingLengthMode: "manual",
					},
					resolved: { flow: { type: "stack" } },
					size: {
						height: 100,
						heightUnit: "px",
						horizontalAlignment: "center",
						mode: "manual",
						verticalAlignment: "center",
						width: 100,
						widthUnit: "px",
					},
					snap: { mode: "snap-off" },
					transition: {
						animations: {
							entering: { animations: [] },
							leaving: { animations: [] },
							previousVisible: { animations: [] },
						},
						enteringLength: 240,
						flow: { type: "stack" },
						leavingLength: null,
						previousBlocksDuringEnter: "keep",
						scrollLength: null,
					},
				},
			},
			branchesById: {
				"branch-1": { blockIds: ["block-1"], id: "branch-1" },
			},
			entriesById: {
				"entry-1": {
					id: "entry-1",
					partId: "part-1",
					title: "Opening",
					type: "scene",
				},
			},
			pagesById: {
				"page-1": {
					entryId: "entry-1",
					id: "page-1",
					isPaginated: false,
					partId: "part-1",
					position: { isFirstInPart: true, isLastInPart: true },
					title: "Opening",
					type: "story",
				},
			},
			partsById: {
				"part-1": { id: "part-1", title: "Opening" },
			},
		},
		order: { entryIds: ["entry-1"], partIds: ["part-1"] },
		snapConfig: {
			scrollSnap: {},
			snap: {},
		},
	} as unknown as Tale;
}

describe("reader opening transition", () => {
	it("compiles the first block as a normal transition destination", () => {
		const compiled = compileReader(
			createSingleBlockTale(),
			[],
			{ "block-1": { height: 100, width: 100 } },
			{ height: 720, width: 1280 },
		);

		expect(compiled.segments[0]).toMatchObject({
			end: 240,
			fromBlockId: null,
			index: 0,
			start: 0,
			toBlockId: "block-1",
			type: "transition",
		});
		expect(compiled.openingTransitionAnchor).not.toBeNull();
		expect(compiled.transitionIntoByBlockId["block-1"]).toBe(0);
	});

	it("assigns the opening source the pre-story timeline index", () => {
		const compiled = compileReader(
			createSingleBlockTale(),
			[],
			{ "block-1": { height: 100, width: 100 } },
			{ height: 720, width: 1280 },
		);
		const framePlan = compileReaderFramePlans(compiled)[0];

		expect(framePlan?.activeAnchorIndex).toBe(-1);
		expect(framePlan?.foregroundBlockIds).toEqual(new Set(["block-1"]));
		expect(framePlan?.paintedBlockIds).toEqual(new Set(["block-1"]));
	});

	it("compiles separate forward and backward entry snap behaviors", () => {
		const tale = createSingleBlockTale();
		const block = tale.indexMap.blocksById["block-1"];
		if (!block) throw new Error("Expected block fixture");
		block.snap = {
			backward: { mode: "scroll-snap", settings: { delayMs: 320 } },
			forward: { mode: "snap", settings: { durationSeconds: 0.45 } },
			mode: "snap-off",
			strategy: "separate",
		};

		const compiled = compileReader(
			tale,
			[],
			{ "block-1": { height: 100, width: 100 } },
			{ height: 720, width: 1280 },
		);

		expect(
			compiled.snapPoints.find(
				(point) => point.id === "block-1-opening-transition-start",
			),
		).toMatchObject({
			direction: "fromPrevious",
			mode: "snap",
			settings: { durationSeconds: 0.45 },
		});
		expect(
			compiled.snapPoints.find((point) => point.id === "block-1-end"),
		).toMatchObject({
			direction: "fromNext",
			mode: "scroll-snap",
			settings: { delayMs: 320 },
		});
	});
});
