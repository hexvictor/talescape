import { describe, expect, it } from "vitest";
import {
	defaultElementParallax,
	getElementParallaxStyle,
} from "./ElementParallaxLayer";

describe("parallax layer", () => {
	it("uses camera and viewport pointer variables without overwriting animation transforms", () => {
		const style = getElementParallaxStyle({
			...defaultElementParallax,
			scrollBasis: "camera",
		});
		expect(style.translate).toContain("--reader-camera-offset-y");
		expect(style.translate).toContain("--reader-pointer-y");
		expect(style.transform).toBeUndefined();
	});
	it("supports independent motion sources and explicit disabling", () => {
		expect(
			getElementParallaxStyle({ ...defaultElementParallax, source: "scroll" })
				.translate,
		).toContain("--reader-pointer-x, 0) * 0px");
		expect(
			getElementParallaxStyle({ ...defaultElementParallax, source: "mouse" })
				.translate,
		).toContain("--reader-scroll-offset, 0px) * 0");
		expect(getElementParallaxStyle(defaultElementParallax, false)).toEqual({});
		expect(
			getElementParallaxStyle({ ...defaultElementParallax, enabled: false }),
		).toEqual({});
	});
	it("allows unscaled scene graphics to move", () => {
		const style = getElementParallaxStyle({
			...defaultElementParallax,
			scale: 1,
		});
		expect(style.translate).not.toContain("clamp");
		expect(style.translate).toContain("--reader-pointer-y");
	});
});
