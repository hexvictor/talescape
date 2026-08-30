import { describe, expect, it } from "vitest";
import type { Tale, TimelineSegment } from "../types";
import {
	DEFAULT_TALE_PLAYBACK_CONFIG,
	normalizeTalePlaybackConfig,
	resolveAutoplayBoundaryPauseSeconds,
	resolveAutoplaySegmentSpeed,
} from "./readerPlaybackSettings";

describe("reader playback settings", () => {
	it("keeps autoplay unavailable for older tales while allowing reader input", () => {
		expect(normalizeTalePlaybackConfig(undefined)).toEqual(
			DEFAULT_TALE_PLAYBACK_CONFIG,
		);
	});

	it("normalizes authored autoplay and interaction permissions", () => {
		expect(
			normalizeTalePlaybackConfig({
				autoplay: {
					enabled: true,
					speed: 84,
					stopOn: { dragging: false, keyboard: true, scrolling: false },
				},
				interactions: {
					dragging: false,
					keyboard: false,
					scrolling: true,
				},
			}),
		).toEqual({
			autoplay: {
				enabled: true,
				speed: 84,
				stopOn: { dragging: false, keyboard: true, scrolling: false },
			},
			interactions: {
				dragging: false,
				keyboard: false,
				scrolling: true,
			},
		});
	});

	it("restores the default speed when imported data is invalid", () => {
		expect(
			normalizeTalePlaybackConfig({ autoplay: { enabled: true, speed: 0 } })
				.autoplay.speed,
		).toBe(1);
		expect(
			normalizeTalePlaybackConfig({
				autoplay: { enabled: true, speed: "fast" },
			}).autoplay.speed,
		).toBe(52);
	});

	it("uses destination entry timing and block boundary pauses", () => {
		const tale = {
			indexMap: {
				blocksById: {
					first: {
						autoplay: {
							enabled: true,
							enteringSpeed: null,
							leavingSpeed: 40,
							pauseAfterEnteringSeconds: null,
							pauseBeforeLeavingSeconds: 1.5,
							readingSpeed: 20,
						},
					},
					second: {
						autoplay: {
							enabled: true,
							enteringSpeed: 70,
							leavingSpeed: null,
							pauseAfterEnteringSeconds: 2,
							pauseBeforeLeavingSeconds: null,
							readingSpeed: 30,
						},
					},
				},
			},
		} as unknown as Tale;
		const reading: TimelineSegment = {
			blockId: "first",
			end: 100,
			index: 0,
			length: 100,
			start: 0,
			type: "reading",
		};
		const transition: TimelineSegment = {
			end: 200,
			fromBlockId: "first",
			index: 1,
			length: 100,
			start: 100,
			toBlockId: "second",
			type: "transition",
		};
		const secondReading: TimelineSegment = {
			blockId: "second",
			end: 300,
			index: 2,
			length: 100,
			start: 200,
			type: "reading",
		};

		expect(resolveAutoplaySegmentSpeed(tale, reading, 52)).toBe(20);
		expect(resolveAutoplaySegmentSpeed(tale, transition, 52)).toBe(70);
		expect(resolveAutoplayBoundaryPauseSeconds(tale, reading, transition)).toBe(
			1.5,
		);
		expect(
			resolveAutoplayBoundaryPauseSeconds(tale, transition, secondReading),
		).toBe(2);
	});
});
