import { describe, expect, it } from "vitest";
import { resolveReaderBlockPaintBounds } from "./readerBlockPaintBounds";

describe("reader block paint bounds", () => {
	it("overlaps adjacent fractional viewport panels instead of exposing the canvas", () => {
		const left = resolveReaderBlockPaintBounds({
			height: 399.5,
			point: { x: 199.75, y: 199.75 },
			width: 399.5,
		});
		const right = resolveReaderBlockPaintBounds({
			height: 399.5,
			point: { x: 599.25, y: 199.75 },
			width: 399.5,
		});
		expect(left.left + left.width).toBeGreaterThan(right.left);
	});
});
