import { describe, expect, it } from "vitest";
import { createReaderSceneSeedConfig } from "./readerSceneSeedConfig";
import type { ReaderSceneBlueprint } from "./readerStoryBlueprint";

function scene(
	order: number,
	layout: ReaderSceneBlueprint["layout"] = "comic-grid",
): ReaderSceneBlueprint {
	return {
		branchName: "main",
		description: "Test Scene",
		isChoice: false,
		layout,
		order,
		pageOrders: [order],
		readingDirection: layout === "single-horizontal" ? "right" : "down",
		title: `Scene ${order + 1}`,
	};
}

describe("createReaderSceneSeedConfig", () => {
	it("keeps every Scene at least one viewport in each axis", () => {
		const comic = createReaderSceneSeedConfig(scene(2), "main");
		const horizontal = createReaderSceneSeedConfig(
			scene(1, "single-horizontal"),
			"main",
		);
		const vertical = createReaderSceneSeedConfig(
			scene(3, "single-vertical"),
			"main",
		);

		expect(comic.sizeConfig).toMatchObject({
			height: { unit: "viewport", value: 1 },
			width: { unit: "viewport", value: 1 },
		});
		expect(horizontal.sizeConfig).toMatchObject({
			height: { unit: "viewport", value: 1 },
			width: { unit: "viewport", value: 2.4 },
		});
		expect(vertical.transitionConfig.flow).toMatchObject({
			direction: "down",
			groupHorizontalAlignment: "start",
			placement: "groupEdge",
		});
		expect(vertical.sizeConfig).toMatchObject({
			height: { unit: "viewport", value: 3.2 },
			width: { unit: "viewport", value: 1 },
		});
	});

	it("provides distinct tablet and mobile panel overrides", () => {
		const config = createReaderSceneSeedConfig(scene(0), "main");

		expect(Object.keys(config.responsiveConfig)).toEqual([
			"mobile-landscape",
			"mobile-portrait",
			"tablet-landscape",
			"tablet-portrait",
		]);
		expect(config.responsiveConfig["mobile-portrait"]?.size).toMatchObject({
			height: 1,
			width: 1,
		});
		expect(config.responsiveConfig["mobile-landscape"]?.size).toMatchObject({
			height: 1,
			width: 1,
		});
	});
});
