import { describe, expect, it } from "vitest";
import type { Anchor } from "../types";
import { getReaderStyleAnchors } from "./readerVisibility";

function createAnchor(blockId: string): Anchor {
	return { blockId } as Anchor;
}

describe("getReaderStyleAnchors", () => {
	it("initializes nearby future blocks that are not currently visible", () => {
		const first = createAnchor("first");
		const future = createAnchor("future");

		expect(getReaderStyleAnchors([first], [first, future])).toEqual([
			first,
			future,
		]);
	});
});
