import { describe, expect, it } from "vitest";
import { createReaderBlockSeedConfig } from "./readerBlockSeedConfig";
import type { ReaderPageBlueprint } from "./readerStoryBlueprint";

function page(order: number): ReaderPageBlueprint {
	return {
		branchNames: ["main"],
		entryOrder: 0,
		isChoice: false,
		isPaginated: true,
		layout: order === 6 ? "horizontal" : "fullscreen",
		localOrder: order,
		order,
		readingDirection: order === 6 ? "right" : "down",
		title: `Panel ${order + 1}`,
		type: "chapter",
	};
}

describe("createReaderBlockSeedConfig", () => {
	it("places block seven below the combined half-height blocks five and six", () => {
		const fifth = createReaderBlockSeedConfig(page(4), "main");
		const sixth = createReaderBlockSeedConfig(page(5), "main");
		const seventh = createReaderBlockSeedConfig(page(6), "main");

		expect(fifth.sizeConfig).toMatchObject({
			height: { unit: "viewport", value: 0.5 },
			width: { unit: "viewport", value: 0.5 },
		});
		expect(sixth.transitionConfig.flow).toMatchObject({
			direction: "right",
			placement: "blockEdge",
		});
		expect(seventh.transitionConfig.flow).toMatchObject({
			direction: "down",
			groupHorizontalAlignment: "start",
			placement: "groupEdge",
		});
		expect(seventh.sizeMode).toBe("contentResponsive");
	});

	it("provides distinct tablet and mobile panel overrides", () => {
		const config = createReaderBlockSeedConfig(page(0), "main");

		expect(Object.keys(config.responsiveConfig)).toEqual([
			"mobile-landscape",
			"mobile-portrait",
			"tablet-landscape",
			"tablet-portrait",
		]);
		expect(config.responsiveConfig["mobile-portrait"]?.size).toMatchObject({
			height: 0.5,
			width: 1,
		});
		expect(config.responsiveConfig["mobile-landscape"]?.size).toMatchObject({
			height: 1,
			width: 0.5,
		});
	});
});
