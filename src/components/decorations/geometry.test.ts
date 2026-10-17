import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
	accentGeometry,
	densityFactor,
	modulatedRibbon,
	modulationAt,
} from "./geometry";
import { AccentStreak, HalftoneDots, SpeedLines } from "./primitives";
import type { AccentStreakVariant } from "./types";

const render = renderToStaticMarkup;
const paths = (markup: string) =>
	[...markup.matchAll(/ d="([^"]*)"/g)].map((match) => match[1]);

describe("decoration geometry controls", () => {
	it("density changes explicit dot spacing and explicit line quantities", () => {
		const dots = (density: "sparse" | "packed") =>
			paths(
				render(
					createElement(HalftoneDots, { spacing: 21, dotSize: 3, density }),
				),
			);
		expect(dots("sparse")).not.toEqual(dots("packed"));
		const lines = (density: "sparse" | "packed") =>
			paths(render(createElement(SpeedLines, { quantity: 100, density })));
		expect(lines("packed").length).toBe(240);
		expect(lines("sparse").length).toBe(45);
		expect(densityFactor("medium")).toBe(1);
	});
	it("rectangle growth is independent of the parent anchor", () => {
		const dots = (decayOrigin: "center-left" | "center-right") =>
			paths(
				render(
					createElement(HalftoneDots, {
						shape: "rectangle",
						position: "center",
						decayOrigin,
					}),
				),
			);
		expect(dots("center-left")).not.toEqual(dots("center-right"));
	});
	it.each(["radial", "fan", "laser"] as const)(
		"%s responds to angle, jitter, spread, seed, length and direction",
		(variant) => {
			const base = {
				variant,
				quantity: 10,
				jitter: 0.5,
				direction: "right" as const,
			};
			const original = paths(render(createElement(SpeedLines, base)));
			for (const option of [
				{ angle: 80 },
				{ jitter: 0 },
				{ spread: 30 },
				{ seed: 432 },
				{ length: 4 },
				{ direction: "up" as const },
			]) {
				expect(
					paths(render(createElement(SpeedLines, { ...base, ...option }))),
				).not.toEqual(original);
			}
		},
	);
	it("accepts more than 72 speed lines and lengths beyond the old cap", () => {
		expect(
			paths(render(createElement(SpeedLines, { quantity: 256 }))),
		).toHaveLength(256);
		expect(paths(render(createElement(SpeedLines, { length: 5 })))).not.toEqual(
			paths(render(createElement(SpeedLines, { length: 2 }))),
		);
	});
	it("modulates thickness and opacity deterministically", () => {
		const ribbon = (amount: number, seed: number) =>
			modulatedRibbon([0, 0], [100, 0], 5, 1, 1, 0, amount, 16, seed);
		expect(ribbon(1, 12)).toBe(ribbon(1, 12));
		expect(ribbon(1, 12)).not.toBe(ribbon(0, 12));
		expect(ribbon(1, 12)).not.toBe(ribbon(1, 13));
		expect(modulationAt(0, 5, 0, 12)).toBe(1);
		expect(modulationAt(0, 5, 1, 12)).toBeLessThan(1);
	});
	it.each<AccentStreakVariant>([
		"brush",
		"dry-brush",
		"lightning",
		"cracks",
		"fracture",
		"splash",
		"burst",
		"ink",
		"comet",
		"slashes",
		"splatter",
		"underline",
	])(
		"%s has finite deterministic geometry and stretches at any length",
		(variant) => {
			const settings = {
				width: 1200,
				thickness: 100,
				quantity: 4,
				variant,
				seed: 12,
				roughness: 0.8,
				branching: 2,
				splatter: 0.3,
			};
			const geometry = accentGeometry(settings);
			expect(geometry).toEqual(accentGeometry(settings));
			expect(geometry.marks.length).toBeGreaterThan(0);
			expect(JSON.stringify(geometry)).not.toMatch(/NaN|Infinity/);
			expect(
				render(createElement(AccentStreak, { variant, length: 3, stretch: 2 })),
			).toContain("scale(6 1)");
		},
	);
	it("accent density still changes a manually configured quantity", () => {
		expect(
			paths(
				render(createElement(AccentStreak, { quantity: 4, density: "packed" })),
			),
		).not.toEqual(
			paths(
				render(createElement(AccentStreak, { quantity: 4, density: "sparse" })),
			),
		);
	});
});
