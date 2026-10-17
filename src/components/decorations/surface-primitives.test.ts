import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Decorations } from "./decorations";
import {
	BackgroundTexture,
	CircularLinework,
	GeometricShape,
} from "./surface-primitives";

const render = renderToStaticMarkup;
describe("surface decoration families", () => {
	it.each(["paper", "grain", "grunge", "scratches", "scuffs", "wear"] as const)(
		"%s texture repeats in pixel units with seeded variation",
		(variant) => {
			const markup = render(
				createElement(BackgroundTexture, { variant, seed: 12 }),
			);
			expect(markup).toContain('patternUnits="userSpaceOnUse"');
			expect(markup).toContain('width="100%" height="100%"');
			expect(markup).not.toMatch(/NaN|Infinity/);
			expect(markup).not.toEqual(
				render(createElement(BackgroundTexture, { variant, seed: 13 })),
			);
		},
	);
	it("density changes texture marks and tile size changes spacing without fitting to the parent", () => {
		const sparse = render(
			createElement(BackgroundTexture, { density: "sparse", tileSize: 400 }),
		);
		const packed = render(
			createElement(BackgroundTexture, { density: "packed", tileSize: 400 }),
		);
		expect(sparse).toContain('width="400" height="400"');
		expect(packed.length).toBeGreaterThan(sparse.length);
	});
	it("geometric repetition is bounded and intrinsic geometry is not distorted", () => {
		const markup = render(
			createElement(GeometricShape, { shape: "cross-grid", quantity: 10000 }),
		);
		expect([...markup.matchAll(/<path /g)]).toHaveLength(512);
		expect(markup).toContain('preserveAspectRatio="xMidYMid meet"');
	});
	it("circular arc, spacing and jitter affect paths", () => {
		const paths = (options: Parameters<typeof CircularLinework>[0]) =>
			[
				...render(createElement(CircularLinework, options)).matchAll(
					/ d="([^"]+)"/g,
				),
			].map((m) => m[1]);
		const base = paths({});
		for (const options of [
			{ arc: 90 },
			{ spacing: 40 },
			{ jitter: 2 },
			{ variant: "broken-ring" as const },
		])
			expect(paths(options)).not.toEqual(base);
	});
	it("mixed presets dispatch all new primitives through the same parent wrapper", () => {
		const markup = render(
			createElement(Decorations, { preset: "technical-linework" }),
		);
		for (const type of ["background-texture", "circular-linework", "geometric"])
			expect(markup).toContain(`data-decoration-type="${type}"`);
		expect(markup).toContain('data-reader-role="decoration-frame"');
	});
});
