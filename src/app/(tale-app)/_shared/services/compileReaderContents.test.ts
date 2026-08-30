import { describe, expect, it } from "vitest";
import type { Anchor, Tale } from "../types";
import { compileReaderContents } from "./compileReaderContents";
import { createReaderNavigationView } from "./readerNavigationView";

function createAnchor({
	blockId,
	entryId = "entry-1",
	pageId,
	partId,
}: {
	blockId: string;
	entryId?: string;
	pageId: string;
	partId: string;
}): Anchor {
	return {
		blockId,
		branchId: "branch-1",
		cameraFramingOffset: { x: 0, y: 0 },
		cameraPoint: { x: 0, y: 0 },
		entryId,
		height: 100,
		id: blockId,
		pageId,
		partId,
		point: { x: 0, y: 0 },
		readingPathPoints: [
			{ x: 0, y: 0 },
			{ x: 0, y: 0 },
		],
		scroll: 0,
		width: 100,
	};
}

describe("compileReaderContents", () => {
	it("stores route-visible parts, entries, and pages as identifiers", () => {
		const tale = {
			indexMap: {
				blocksById: {
					"block-1": { id: "block-1", isChoiceBlock: false },
					"block-2": { id: "block-2", isChoiceBlock: false },
				},
				entriesById: {
					"entry-1": {
						id: "entry-1",
						partId: "part-1",
						title: "Visible route",
						type: "scene",
					},
					"entry-2": {
						id: "entry-2",
						partId: "part-2",
						title: "Second route",
						type: "scene",
					},
				},
				pagesById: {
					"page-1": {
						entryId: "entry-1",
						id: "page-1",
						isPaginated: true,
						partId: "part-1",
						position: { isFirstInPart: true, isLastInPart: true },
						title: "Part one",
						type: "story",
					},
					"page-2": {
						entryId: "entry-2",
						id: "page-2",
						isPaginated: true,
						partId: "part-2",
						position: { isFirstInPart: true, isLastInPart: true },
						title: "Part two",
						type: "story",
					},
				},
				partsById: {
					"part-1": { id: "part-1", title: "One" },
					"part-hidden": { id: "part-hidden", title: "Hidden branch" },
					"part-2": { id: "part-2", title: "Two" },
				},
			},
			order: {
				entryIds: ["entry-1", "entry-2"],
				partIds: ["part-1", "part-hidden", "part-2"],
			},
		} as unknown as Tale;
		const anchors = [
			createAnchor({
				blockId: "block-1",
				pageId: "page-1",
				partId: "part-1",
			}),
			createAnchor({
				blockId: "block-2",
				entryId: "entry-2",
				pageId: "page-2",
				partId: "part-2",
			}),
		];

		const compiled = compileReaderContents(tale, anchors);

		expect(compiled.contents).toEqual([
			{ entryIds: ["entry-1"], id: "part-1" },
			{ entryIds: ["entry-2"], id: "part-2" },
		]);
		expect(compiled.pages).toEqual([
			{
				blockIds: ["block-1"],
				hasChoiceBlock: false,
				id: "page-1",
				number: 1,
			},
			{
				blockIds: ["block-2"],
				hasChoiceBlock: false,
				id: "page-2",
				number: 2,
			},
		]);
		expect(
			createReaderNavigationView(compiled, tale).pages.map(
				(page) => page.partNumber,
			),
		).toEqual([1, 2]);
	});

	it("tracks part boundaries when an entry changes parts between pages", () => {
		const tale = {
			indexMap: {
				blocksById: {
					"block-1": { id: "block-1", isChoiceBlock: false },
					"block-2": { id: "block-2", isChoiceBlock: false },
					"block-3": { id: "block-3", isChoiceBlock: false },
				},
				entriesById: {
					"entry-1": {
						id: "entry-1",
						partId: "part-1",
						title: "Shared threshold",
						type: "scene",
					},
				},
				partsById: {
					"part-1": { id: "part-1", title: "Arrival" },
					"part-2": { id: "part-2", title: "Aftermath" },
				},
				pagesById: {
					"page-1": { id: "page-1", isPaginated: true, partId: "part-1" },
					"page-2": { id: "page-2", isPaginated: true, partId: "part-1" },
					"page-3": { id: "page-3", isPaginated: true, partId: "part-2" },
				},
			},
			order: {
				entryIds: ["entry-1"],
				partIds: ["part-1", "part-2"],
			},
		} as unknown as Tale;
		const anchors = [
			createAnchor({
				blockId: "block-1",
				pageId: "page-1",
				partId: "part-1",
			}),
			createAnchor({
				blockId: "block-2",
				pageId: "page-2",
				partId: "part-1",
			}),
			createAnchor({
				blockId: "block-3",
				pageId: "page-3",
				partId: "part-2",
			}),
		];

		const compiled = compileReaderContents(tale, anchors);
		const entry = compiled.entries[0];

		expect(entry?.partSpans).toEqual([
			{
				endPageId: "page-2",
				partId: "part-1",
				pageCount: 2,
				startPageId: "page-1",
			},
			{
				endPageId: "page-3",
				partId: "part-2",
				pageCount: 1,
				startPageId: "page-3",
			},
		]);
		expect(entry?.pageIds).toEqual(["page-1", "page-2", "page-3"]);
		expect(entry?.blockIds).toEqual(["block-1", "block-2", "block-3"]);
	});
});
