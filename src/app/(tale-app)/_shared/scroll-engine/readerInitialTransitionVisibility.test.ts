import { describe, expect, it } from "vitest";
import type { Anchor, CompiledReader } from "../types";
import { getInitialTransitionVisibleAnchors } from "./readerInitialTransitionVisibility";

/**
 * Creates the smallest anchor shape needed by initial visibility tests.
 *
 * @param id - Stable block id.
 * @returns Test anchor.
 *
 * @example
 * const anchor = createAnchor("1");
 */
function createAnchor(id: string): Anchor {
	return {
		block: { id },
	} as Anchor;
}

/**
 * Creates a minimal compiled route for visibility tests.
 *
 * @param anchors - Ordered route anchors.
 * @returns Test compiled reader.
 *
 * @example
 * const compiled = createCompiled([createAnchor("1")]);
 */
function createCompiled(anchors: Anchor[]): CompiledReader {
	return {
		anchorIndexByBlockId: Object.fromEntries(
			anchors.map((anchor, index) => [anchor.block.id, index]),
		),
		anchors,
	} as CompiledReader;
}

describe("getInitialTransitionVisibleAnchors", () => {
	const anchors = ["1", "2", "3", "4"].map(createAnchor);
	const compiled = createCompiled(anchors);

	it("shows nothing before the first block intersects", () => {
		expect(
			getInitialTransitionVisibleAnchors(compiled, [anchors[3] as Anchor]),
		).toEqual([]);
	});

	it("shows adjacent following blocks that share the viewport", () => {
		expect(
			getInitialTransitionVisibleAnchors(compiled, [
				anchors[0] as Anchor,
				anchors[1] as Anchor,
				anchors[2] as Anchor,
			]),
		).toEqual(anchors.slice(0, 3));
	});

	it("does not reveal later overlapping geometry across a route gap", () => {
		expect(
			getInitialTransitionVisibleAnchors(compiled, [
				anchors[0] as Anchor,
				anchors[3] as Anchor,
			]),
		).toEqual([anchors[0]]);
	});
});
