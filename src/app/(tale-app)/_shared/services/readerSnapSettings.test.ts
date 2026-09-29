import { describe, expect, it } from "vitest";
import {
	normalizeSceneSnapConfig,
	resolveSceneSnapBehavior,
} from "./readerSnapSettings";

describe("reader snap settings", () => {
	it("uses one authored behavior for both entry directions", () => {
		const config = normalizeSceneSnapConfig({
			mode: "scroll-snap",
			settings: { durationSeconds: 0.4 },
			strategy: "shared",
		});

		expect(resolveSceneSnapBehavior(config, "forward")).toEqual({
			mode: "scroll-snap",
			settings: { durationSeconds: 0.4 },
		});
		expect(resolveSceneSnapBehavior(config, "backward")).toEqual({
			mode: "scroll-snap",
			settings: { durationSeconds: 0.4 },
		});
	});

	it("resolves forward and backward entry behaviors independently", () => {
		const config = normalizeSceneSnapConfig({
			backward: {
				mode: "snap",
				settings: { durationSeconds: 0.6 },
			},
			forward: {
				mode: "scroll-snap",
				settings: { delayMs: 180 },
			},
			mode: "snap-off",
			strategy: "separate",
		});

		expect(resolveSceneSnapBehavior(config, "forward")).toEqual({
			mode: "scroll-snap",
			settings: { delayMs: 180 },
		});
		expect(resolveSceneSnapBehavior(config, "backward")).toEqual({
			mode: "snap",
			settings: { durationSeconds: 0.6 },
		});
	});

	it("migrates legacy one-direction settings without changing their meaning", () => {
		const forwardOnly = normalizeSceneSnapConfig({
			direction: "fromPrevious",
			mode: "snap",
		});
		const backwardOnly = normalizeSceneSnapConfig({
			direction: "fromNext",
			mode: "scroll-snap",
		});

		expect(resolveSceneSnapBehavior(forwardOnly, "forward").mode).toBe("snap");
		expect(resolveSceneSnapBehavior(forwardOnly, "backward").mode).toBe(
			"snap-off",
		);
		expect(resolveSceneSnapBehavior(backwardOnly, "forward").mode).toBe(
			"snap-off",
		);
		expect(resolveSceneSnapBehavior(backwardOnly, "backward").mode).toBe(
			"scroll-snap",
		);
	});
});
