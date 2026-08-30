import { describe, expect, it } from "vitest";
import type { Anchor, CompiledReader, Tale } from "../types";
import { filterTimelineVisibleAnchors } from "./readerTimelineVisibility";

function createAnchor(blockId: string): Anchor {
	return { blockId } as Anchor;
}

function createTale(flowTypes: Record<string, "linear" | "stack">): Tale {
	return {
		indexMap: {
			blocksById: Object.fromEntries(
				Object.entries(flowTypes).map(([blockId, type]) => [
					blockId,
					{
						transition: {
							flow: type === "stack" ? { type } : { direction: "down", type },
						},
					},
				]),
			),
		},
	} as Tale;
}

describe("filterTimelineVisibleAnchors", () => {
	it("treats later blocks as future during the opening transition", () => {
		const anchors = ["first", "stacked", "later"].map(createAnchor);
		const anchorIndexByBlockId = {
			first: 0,
			later: 2,
			stacked: 1,
		};
		const tale = createTale({
			first: "linear",
			later: "linear",
			stacked: "stack",
		});
		const timelineVisible = filterTimelineVisibleAnchors(
			anchors,
			-1,
			anchorIndexByBlockId,
			new Set(["first"]),
			tale,
		);
		expect(timelineVisible).toEqual([anchors[0]]);
	});
});
