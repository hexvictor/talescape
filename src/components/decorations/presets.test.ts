import { describe, expect, it } from "vitest";
import { decorationPresetItems, resolveDecorationItems } from "./presets";
import type { Decoration } from "./types";

describe("resolveDecorationItems", () => {
	it("returns custom items unchanged without a preset", () => {
		const items: Decoration[] = [
			{ color: "cyan", position: "top-right", type: "accent-streak" },
		];
		expect(resolveDecorationItems(undefined, items)).toEqual(items);
	});

	it("appends custom items after preset items", () => {
		const custom: Decoration = {
			color: "magenta",
			position: "bottom-left",
			type: "accent-streak",
			variant: "dry-brush",
		};
		const resolved = resolveDecorationItems("page-subtle", [custom]);
		expect(resolved).toHaveLength(
			decorationPresetItems["page-subtle"].length + 1,
		);
		expect(resolved.at(-1)).toEqual(custom);
	});

	it("does not mutate the preset definition", () => {
		const length = decorationPresetItems.panel.length;
		resolveDecorationItems("panel", [
			{ position: "center", type: "speed-lines", variant: "velocity" },
		]);
		expect(decorationPresetItems.panel).toHaveLength(length);
	});
});
