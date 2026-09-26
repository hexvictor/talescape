import { describe, expect, it } from "vitest";
import type { Anchor } from "../types";
import { getReaderStyleAnchors } from "./readerVisibility";

function createAnchor(sceneId: string): Anchor {
	return { sceneId } as Anchor;
}

describe("getReaderStyleAnchors", () => {
	it("initializes nearby future scenes that are not currently visible", () => {
		const first = createAnchor("first");
		const future = createAnchor("future");

		expect(getReaderStyleAnchors([first], [first, future])).toEqual([
			first,
			future,
		]);
	});
});
