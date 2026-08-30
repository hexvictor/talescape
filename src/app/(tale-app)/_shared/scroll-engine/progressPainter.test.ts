import { describe, expect, it } from "vitest";
import type { CompiledReader, TimelineSegment } from "../types";
import { createProgressPainter } from "./progressPainter";

function createProgressElement(): HTMLElement {
	return {
		dataset: {},
		isConnected: true,
		style: { transform: "" },
		textContent: "",
	} as unknown as HTMLElement;
}

function createProgressRoot(
	elements: Record<string, HTMLElement>,
): HTMLElement {
	return {
		querySelector: (selector: string) => elements[selector] ?? null,
	} as unknown as HTMLElement;
}

describe("createProgressPainter", () => {
	it("paints transition progress separately from page progress", () => {
		const storyFill = createProgressElement();
		const storyLabel = createProgressElement();
		const innerFill = createProgressElement();
		const innerLabel = createProgressElement();
		const transitionFill = createProgressElement();
		const root = createProgressRoot({
			"[data-reader-inner-progress-fill='true']": innerFill,
			"[data-reader-inner-progress='true']": innerLabel,
			"[data-reader-story-progress-fill='true']": storyFill,
			"[data-reader-story-progress='true']": storyLabel,
			"[data-reader-transition-progress-fill='true']": transitionFill,
		});
		const compiled = { totalScroll: 100 } as CompiledReader;
		const transition: TimelineSegment = {
			end: 50,
			fromBlockId: "block-1",
			index: 1,
			length: 20,
			start: 30,
			toBlockId: "block-2",
			type: "transition",
		};

		const paint = createProgressPainter(root, compiled);
		paint(40, transition, 0.5);

		expect(storyFill.style.transform).toBe("scaleX(0.4)");
		expect(innerFill.style.transform).toBe("scaleX(0)");
		expect(transitionFill.style.transform).toBe("scaleX(0.5)");
		expect(innerLabel.textContent).toBe("Transition 10 / 20");

		paint(
			75,
			{
				blockId: "block-2",
				end: 100,
				index: 2,
				length: 50,
				start: 50,
				type: "reading",
			},
			0.5,
		);

		expect(innerFill.style.transform).toBe("scaleX(0.5)");
		expect(transitionFill.style.transform).toBe("scaleX(0)");
		expect(innerLabel.textContent).toBe("Page 25 / 50");
	});

	it("marks enter and leave pause progress with separate phases", () => {
		const innerFill = createProgressElement();
		const root = createProgressRoot({
			"[data-reader-inner-progress-fill='true']": innerFill,
			"[data-reader-inner-progress='true']": createProgressElement(),
		});
		const compiled = { totalScroll: 100 } as CompiledReader;
		const paint = createProgressPainter(root, compiled);

		paint(
			10,
			{
				blockId: "block-1",
				end: 20,
				index: 0,
				length: 20,
				pauseType: "start",
				start: 0,
				type: "pause",
			},
			0.5,
		);
		expect(innerFill.dataset.readerProgressPhase).toBe("enter-pause");

		paint(
			90,
			{
				blockId: "block-1",
				end: 100,
				index: 2,
				length: 20,
				pauseType: "end",
				start: 80,
				type: "pause",
			},
			0.5,
		);
		expect(innerFill.dataset.readerProgressPhase).toBe("leave-pause");
	});
});
