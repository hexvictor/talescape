import { describe, expect, it } from "vitest";
import { formatElements } from "./formatElements";
describe("scene image placement persistence", () => {
	it("retains scene ownership and parallax after a JSON database round trip", () => {
		const placement = {
			mode: "absolute",
			horizontal: "left",
			vertical: "top",
			unit: "px",
			x: 0,
			y: 0,
			overflow: "clip",
			zIndex: -1,
			parallax: {
				enabled: true,
				source: "both",
				scrollBasis: "timeline",
				scrollX: 0,
				scrollY: -0.2,
				mouseX: 16,
				mouseY: 12,
				scale: 1.2,
			},
		};
		const rows = JSON.parse(
			JSON.stringify([
				{
					id: 10,
					sceneId: 1,
					frameId: null,
					type: "image",
					content: { src: "/background.png", alt: "City" },
					placementConfig: placement,
					styleConfig: { width: "100%", height: "100%" },
				},
			]),
		);
		const element = formatElements(rows)[0];
		expect(element?.frameId).toBeNull();
		expect(element?.placement.parallax).toEqual(placement.parallax);
		expect(element?.placement).toMatchObject({ mode: "absolute", zIndex: -1 });
	});
});
