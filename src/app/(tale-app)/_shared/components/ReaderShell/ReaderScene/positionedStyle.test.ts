import { describe, expect, it } from "vitest";
import { positionedStyle } from "./positionedStyle";
describe("positioned element dimensions", () => {
	it("uses frame proportions for frame-owned elements", () => {
		const placement = {
			mode: "absolute",
			horizontal: "left",
			vertical: "top",
			unit: "viewport",
			x: 0.25,
			y: 0.5,
			width: 0.5,
		} as const;
		expect(positionedStyle(placement, true)).toMatchObject({
			left: "25%",
			top: "50%",
			width: "50%",
		});
		expect(positionedStyle(placement)).toMatchObject({
			left: "25dvw",
			top: "50dvh",
			width: "50dvw",
		});
	});
	it("preserves a full-scene image's authored width without a placement width override", () => {
		const placement = {
			mode: "absolute",
			horizontal: "left",
			vertical: "top",
			unit: "px",
			x: 0,
			y: 0,
			zIndex: -1,
		} as const;
		expect({ width: "100%", ...positionedStyle(placement) }).toMatchObject({
			width: "100%",
			zIndex: -1,
		});
		expect(positionedStyle({ ...placement, width: 640 }).width).toBe("640px");
	});
});
