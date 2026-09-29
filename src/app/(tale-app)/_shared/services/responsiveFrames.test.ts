import { describe, expect, it } from "vitest";
import type { TaleFrame, TaleScene } from "../types";
import {
	normalizeResponsiveSceneFrames,
	serializeResponsiveSceneFrames,
} from "./responsiveFrames";

const node: TaleFrame = {
	animations: {
		ambient: { animations: [] },
		intro: { animations: [] },
		outro: { animations: [] },
		active: { animations: [] },
	},
	children: [],
	id: "12",
	mode: "stack",
	parentFrameId: null,
};

describe("responsive frame normalization", () => {
	it("stores breakpoint frames in an index and denormalizes only for persistence", () => {
		const scene = {
			id: "4",
			responsiveOverrides: {
				mobile: { frames: [node], rootFrameId: "12" },
			},
		} as unknown as TaleScene;

		const normalized = normalizeResponsiveSceneFrames(scene);
		const override = normalized.scene.responsiveOverrides?.mobile;
		const frameId = "responsive:4:mobile:12";

		expect(override?.frameIds).toEqual([frameId]);
		expect(override?.rootFrameId).toBe(frameId);
		expect(override).not.toHaveProperty("frames");
		expect(normalized.frames[0]?.id).toBe(frameId);

		const persisted = serializeResponsiveSceneFrames(
			normalized.scene,
			Object.fromEntries(normalized.frames.map((item) => [item.id, item])),
		);
		expect(persisted.mobile?.frames?.[0]?.id).toBe("12");
		expect(persisted.mobile).not.toHaveProperty("frameIds");
		expect(persisted.mobile?.rootFrameId).toBe("12");
	});
});
