import { describe, expect, it } from "vitest";
import {
	normalizeBlockSnapConfig,
	resolveBlockSnapBehavior,
} from "./readerSnapSettings";

describe("reader snap settings", () => {
	it("uses one authored behavior for both entry directions", () => {
		const config = normalizeBlockSnapConfig({
			mode: "scroll-snap",
			settings: { durationSeconds: 0.4 },
			strategy: "shared",
		});

		expect(resolveBlockSnapBehavior(config, "forward")).toEqual({
			mode: "scroll-snap",
			settings: { durationSeconds: 0.4 },
		});
		expect(resolveBlockSnapBehavior(config, "backward")).toEqual({
			mode: "scroll-snap",
			settings: { durationSeconds: 0.4 },
		});
	});

	it("resolves forward and backward entry behaviors independently", () => {
		const config = normalizeBlockSnapConfig({
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

		expect(resolveBlockSnapBehavior(config, "forward")).toEqual({
			mode: "scroll-snap",
			settings: { delayMs: 180 },
		});
		expect(resolveBlockSnapBehavior(config, "backward")).toEqual({
			mode: "snap",
			settings: { durationSeconds: 0.6 },
		});
	});

	it("migrates legacy one-direction settings without changing their meaning", () => {
		const forwardOnly = normalizeBlockSnapConfig({
			direction: "fromPrevious",
			mode: "snap",
		});
		const backwardOnly = normalizeBlockSnapConfig({
			direction: "fromNext",
			mode: "scroll-snap",
		});

		expect(resolveBlockSnapBehavior(forwardOnly, "forward").mode).toBe("snap");
		expect(resolveBlockSnapBehavior(forwardOnly, "backward").mode).toBe(
			"snap-off",
		);
		expect(resolveBlockSnapBehavior(backwardOnly, "forward").mode).toBe(
			"snap-off",
		);
		expect(resolveBlockSnapBehavior(backwardOnly, "backward").mode).toBe(
			"scroll-snap",
		);
	});
});
