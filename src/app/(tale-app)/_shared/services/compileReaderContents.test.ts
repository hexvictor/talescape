import { describe, expect, it } from "vitest";
import type { Anchor, Tale } from "../types";
import { compileReaderContents } from "./compileReaderContents";

function createAnchor({
	blockId,
	entryId = "entry-1",
	globalPageNumber,
	isFirstInPart,
	isLastInPart,
	pageId,
	partId,
	title,
}: {
	blockId: string;
	entryId?: string;
	globalPageNumber: number;
	isFirstInPart: boolean;
	isLastInPart: boolean;
	pageId: string;
	partId: string;
	title: string;
}): Anchor {
	return {
		block: {
			id: blockId,
			isChoiceBlock: false,
			title,
		},
		entry: {
			id: entryId,
		},
		page: {
			id: pageId,
			isPaginated: true,
			partId,
			position: {
				globalPageNumber,
				isFirstInPart,
				isLastInPart,
			},
			title,
			type: "story",
		},
	} as Anchor;
}

describe("compileReaderContents", () => {
	it("numbers route-visible parts without gaps", () => {
		const tale = {
			structure: {
				entries: [
					{
						id: "entry-1",
						partId: "part-1",
						title: "Visible route",
						type: "scene",
					},
				],
				parts: [
					{ id: "part-1", title: "One" },
					{ id: "part-hidden", title: "Hidden branch" },
					{ id: "part-2", title: "Two" },
				],
			},
		} as unknown as Tale;
		const anchors = [
			createAnchor({
				blockId: "block-1",
				globalPageNumber: 1,
				isFirstInPart: true,
				isLastInPart: true,
				pageId: "page-1",
				partId: "part-1",
				title: "Part one",
			}),
			createAnchor({
				blockId: "block-2",
				globalPageNumber: 2,
				isFirstInPart: true,
				isLastInPart: true,
				pageId: "page-2",
				partId: "part-2",
				title: "Part two",
			}),
		];

		const compiled = compileReaderContents(tale, anchors);

		expect(compiled.pages.map((page) => page.partNumber)).toEqual([1, 2]);
		expect(
			compiled.entries[0]?.partSpans.map((span) => span.partNumber),
		).toEqual([1, 2]);
	});

	it("tracks part boundaries when an entry changes parts between pages", () => {
		const tale = {
			structure: {
				entries: [
					{
						id: "entry-1",
						partId: "part-1",
						title: "Shared threshold",
						type: "scene",
					},
				],
				parts: [
					{ id: "part-1", title: "Arrival" },
					{ id: "part-2", title: "Aftermath" },
				],
			},
		} as unknown as Tale;
		const anchors = [
			createAnchor({
				blockId: "block-1",
				globalPageNumber: 1,
				isFirstInPart: false,
				isLastInPart: false,
				pageId: "page-1",
				partId: "part-1",
				title: "Page one",
			}),
			createAnchor({
				blockId: "block-2",
				globalPageNumber: 2,
				isFirstInPart: false,
				isLastInPart: true,
				pageId: "page-2",
				partId: "part-1",
				title: "Page two",
			}),
			createAnchor({
				blockId: "block-3",
				globalPageNumber: 3,
				isFirstInPart: true,
				isLastInPart: false,
				pageId: "page-3",
				partId: "part-2",
				title: "Page three",
			}),
		];

		const compiled = compileReaderContents(tale, anchors);
		const entry = compiled.entries[0];

		expect(entry?.partSpans).toEqual([
			{
				endPageId: "page-2",
				endsPart: true,
				partId: "part-1",
				partNumber: 1,
				partTitle: "Arrival",
				pageCount: 2,
				startPageId: "page-1",
				startsPart: false,
			},
			{
				endPageId: "page-3",
				endsPart: false,
				partId: "part-2",
				partNumber: 2,
				partTitle: "Aftermath",
				pageCount: 1,
				startPageId: "page-3",
				startsPart: true,
			},
		]);
		expect(entry?.pages.map((page) => page.partId)).toEqual([
			"part-1",
			"part-1",
			"part-2",
		]);
		expect(entry?.pages.map((page) => page.partNumber)).toEqual([1, 1, 2]);
		expect(entry?.pages.map((page) => page.isLastInPart)).toEqual([
			false,
			true,
			false,
		]);
	});
});
