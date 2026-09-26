import { describe, expect, it } from "vitest";
import type { Anchor, CompiledReader, Tale } from "../types";
import { filterTimelineVisibleAnchors } from "./readerTimelineVisibility";

function createAnchor(sceneId: string): Anchor {
	return { sceneId } as Anchor;
}

function createTale(flowTypes: Record<string, "linear" | "stack">): Tale {
	return {
		indexMap: {
			scenesById: Object.fromEntries(
				Object.entries(flowTypes).map(([sceneId, type]) => [
					sceneId,
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
	it("treats later scenes as future during the opening transition", () => {
		const anchors = ["first", "stacked", "later"].map(createAnchor);
		const anchorIndexBySceneId = {
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
			anchorIndexBySceneId,
			new Set(["first"]),
			tale,
		);
		expect(timelineVisible).toEqual([anchors[0]]);
	});
});
