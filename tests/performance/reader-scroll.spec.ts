import { expect, test } from "@playwright/test";

type ReaderPerformanceSample = {
	longTasks: number[];
	maxFrameGapMs: number;
	maxMountedBlocks: number;
	offscreenAnimations: number;
};

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		const performanceState = {
			frameGaps: [] as number[],
			longTasks: [] as number[],
			previousFrame: 0,
		};
		Object.assign(window, { __readerPerformanceState: performanceState });

		const sampleFrame = (time: number): void => {
			if (performanceState.previousFrame > 0) {
				performanceState.frameGaps.push(time - performanceState.previousFrame);
			}
			performanceState.previousFrame = time;
			window.requestAnimationFrame(sampleFrame);
		};
		window.requestAnimationFrame(sampleFrame);

		if (
			"PerformanceObserver" in window &&
			PerformanceObserver.supportedEntryTypes.includes("longtask")
		) {
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					performanceState.longTasks.push(entry.duration);
				}
			}).observe({ entryTypes: ["longtask"] });
		}
	});
});

test("reader scroll keeps rendering and animation work bounded", async ({
	page,
}, testInfo) => {
	await page.goto("/official/branched");
	await page
		.locator("[data-reader-component='ReaderViewport']")
		.waitFor({ state: "visible" });

	let maxMountedBlocks = 0;
	for (let index = 0; index < 24; index++) {
		await page.mouse.wheel(0, 720);
		await page.waitForTimeout(80);
		maxMountedBlocks = Math.max(
			maxMountedBlocks,
			await page.locator("[data-reader-block-id]").count(),
		);
	}

	const sample = await page.evaluate((maxMounted): ReaderPerformanceSample => {
		const state = (
			window as Window & {
				__readerPerformanceState?: {
					frameGaps: number[];
					longTasks: number[];
				};
			}
		).__readerPerformanceState;
		const offscreenAnimations = document.querySelectorAll(
			"[data-reader-animation-state='playing'][data-reader-viewport-state='nearby']",
		).length;
		return {
			longTasks: state?.longTasks ?? [],
			maxFrameGapMs: Math.max(...(state?.frameGaps ?? [0])),
			maxMountedBlocks: maxMounted,
			offscreenAnimations,
		};
	}, maxMountedBlocks);

	await testInfo.attach("reader-performance.json", {
		body: JSON.stringify(sample, null, 2),
		contentType: "application/json",
	});
	expect(sample.offscreenAnimations).toBe(0);
	expect(sample.maxMountedBlocks).toBeLessThanOrEqual(16);
	expect(sample.maxFrameGapMs).toBeLessThan(250);
});
