import { describe, expect, it } from "vitest";
import { formatSize } from "~/server/db/data/tale-reader/formatters/tale/formatSize";
import type { SceneSize, Tale } from "../types";
import { measureBlocks } from "./readerMeasurement";

function measure(size: SceneSize) {
	const tale = {
		indexMap: { scenesById: { scene: { size } } },
	} as unknown as Tale;
	return measureBlocks(tale, ["scene"], { width: 1000, height: 800 }, null)
		.scene;
}

describe("explicit scene constraints", () => {
	it("retains persisted limits and clamps explicit dimensions", () => {
		const size = formatSize("fixed", {
			width: { unit: "viewport", value: 2 },
			height: { unit: "px", value: 100 },
			maxWidth: { unit: "px", value: 1200 },
			minHeight: { unit: "viewport", value: 0.5 },
		});
		expect(measure(size)).toEqual({ width: 1200, height: 400 });
	});
	it("lets minimum bounds win when they exceed maximum bounds", () => {
		expect(
			measure({
				mode: "manual",
				width: 100,
				height: 100,
				widthUnit: "px",
				heightUnit: "px",
				minWidth: 500,
				maxWidth: 200,
				horizontalAlignment: "auto",
				verticalAlignment: "auto",
			}),
		).toEqual({ width: 500, height: 100 });
	});
});
