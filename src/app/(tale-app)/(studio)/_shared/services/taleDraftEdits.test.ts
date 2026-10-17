import { describe, expect, it } from "vitest";
import { getSceneProgressionFrameIds } from "~/app/(tale-app)/_shared/services/taleLookups";
import type { Tale } from "~/app/(tale-app)/_shared/types";
import {
	addDraftElement,
	addDraftFrame,
	addDraftGroup,
	addDraftScene,
	editElement,
	removeDraftBranch,
	removeDraftElement,
} from "./taleDraftEdits";

describe("unsaved scene structure", () => {
	it("retains newly created frames and groups before database IDs exist", () => {
		const empty = { animations: [] };
		const tale = {
			id: 1,
			counts: { frames: 0, keyframes: 0, scenes: 1 },
			order: {
				sceneIds: ["1"],
				branchIds: ["1"],
				frameIds: [],
				keyframeIds: [],
			},
			indexMap: {
				branchesById: { "1": { id: "1", counts: {} } },
				framesById: {},
				elementsById: {},
				keyframesById: {},
				scenesById: {
					"1": {
						id: "1",
						branchId: "1",
						order: 0,
						frameIds: [],
						elementIds: [],
						keyframeIds: [],
						reading: { animations: { ambient: empty, active: empty } },
						transition: {
							flow: { type: "stack" },
							animations: {
								intro: empty,
								outro: empty,
								previousVisible: empty,
							},
						},
					},
				},
			},
		} as unknown as Tale;
		const withScene = addDraftScene(tale, "1");
		const sceneId = withScene.order.sceneIds.at(-1);
		if (!sceneId) throw new Error("Missing draft scene");
		expect(Number(sceneId)).toBeLessThan(0);
		expect(withScene.indexMap.scenesById[sceneId]?.frameIds).toHaveLength(0);
		expect(withScene.indexMap.scenesById[sceneId]?.position.isLast).toBe(true);
		expect(withScene.indexMap.scenesById["1"]?.position.isFirst).toBe(true);
		const withFrame = addDraftFrame(withScene, sceneId);
		const frameIds = withFrame.indexMap.scenesById[sceneId]?.frameIds ?? [];
		expect(frameIds).toHaveLength(1);
		for (const id of frameIds)
			expect(withFrame.indexMap.framesById[id]).toBeDefined();
		const frameId = frameIds[0];
		if (!frameId) throw new Error("Missing draft frame");
		const withGroup = addDraftGroup(withFrame, sceneId, frameId);
		const groupedScene = withGroup.indexMap.scenesById[sceneId];
		if (!groupedScene) throw new Error("Missing grouped draft scene");
		expect(getSceneProgressionFrameIds(withGroup, groupedScene)).toEqual([
			frameId,
		]);
		expect(withGroup.indexMap.framesById[frameId]?.children).toHaveLength(1);
	});
});

describe("branch removal", () => {
	it("removes descendant branches and their scene-owned structure", () => {
		const tale = createBranchRemovalFixture();
		const next = removeDraftBranch(tale, "child");

		expect(next.order.branchIds).toEqual(["root"]);
		expect(next.order.sceneIds).toEqual(["root-scene"]);
		expect(next.order.frameIds).toEqual(["root-frame"]);
		expect(next.order.keyframeIds).toEqual(["root-keyframe"]);
		expect(next.order.elementIds).toEqual(["root-element"]);
		expect(next.order.pathIds).toEqual([]);
		expect(next.indexMap.branchesById.child).toBeUndefined();
		expect(next.indexMap.branchesById.grandchild).toBeUndefined();
		expect(next.indexMap.scenesById["child-scene"]).toBeUndefined();
		expect(next.indexMap.scenesById["grandchild-scene"]).toBeUndefined();
		expect(next.indexMap.framesById["child-frame"]).toBeUndefined();
		expect(next.indexMap.elementsById["grandchild-element"]).toBeUndefined();
	});
});

describe("scene-owned elements", () => {
	it("creates a clipped background without changing frame contents, and removes it", () => {
		const tale = createBranchRemovalFixture();
		for (const element of Object.values(tale.indexMap.elementsById))
			element.placement = { mode: "normal" };
		for (const frame of Object.values(tale.indexMap.framesById))
			frame.children = [];
		for (const keyframe of Object.values(tale.indexMap.keyframesById))
			keyframe.actions = [];
		const next = addDraftElement(tale, "root-scene", null, {
			type: "image",
			label: "Background",
			src: "/background.png",
		});
		const id = next.order.elementIds.at(-1);
		if (!id) throw new Error("Missing scene element");
		const element = next.indexMap.elementsById[id];
		if (!element) throw new Error("Missing scene element");
		expect(element.frameId).toBeNull();
		expect(element.sceneId).toBe("root-scene");
		expect(element.placement).toMatchObject({
			mode: "absolute",
			overflow: "clip",
			zIndex: -1,
		});
		expect(element.style).toMatchObject({ width: "100%", height: "100%" });
		expect(next.indexMap.scenesById["root-scene"]?.clippedElementIds).toContain(
			id,
		);
		expect(next.indexMap.framesById["root-frame"]).toBe(
			tale.indexMap.framesById["root-frame"],
		);
		const edited = editElement(next, id, (item) => ({
			...item,
			placement: {
				...item.placement,
				parallax: {
					enabled: true,
					source: "both",
					scrollX: 0.2,
					scrollY: 0.3,
					mouseX: 10,
					mouseY: 15,
					scale: 1.2,
				},
			},
		}));
		expect(edited.indexMap.elementsById[id]?.placement.parallax?.scrollY).toBe(
			0.3,
		);
		const removed = removeDraftElement(edited, id);
		expect(removed.indexMap.elementsById[id]).toBeUndefined();
		expect(removed.indexMap.scenesById["root-scene"]?.elementIds).not.toContain(
			id,
		);
	});
});

function createBranchRemovalFixture(): Tale {
	const empty = { animations: [] };
	const scene = (id: string, branchId: string, order: number) => ({
		id,
		branchId,
		order,
		frameIds: [`${branchId}-frame`],
		elementIds: [`${branchId}-element`],
		keyframeIds: [`${branchId}-keyframe`],
		reading: { animations: { ambient: empty, active: empty } },
		transition: {
			flow: { type: "stack" },
			animations: { intro: empty, outro: empty, previousVisible: empty },
		},
	});
	return {
		id: 1,
		bounds: { rootBranchId: "root" },
		counts: {
			branches: 3,
			elements: 3,
			frames: 3,
			keyframes: 3,
			paths: 2,
			scenes: 3,
		},
		order: {
			branchIds: ["root", "child", "grandchild"],
			elementIds: ["root-element", "child-element", "grandchild-element"],
			frameIds: ["root-frame", "child-frame", "grandchild-frame"],
			keyframeIds: ["root-keyframe", "child-keyframe", "grandchild-keyframe"],
			pathIds: ["root-child", "child-grandchild"],
			sceneIds: ["root-scene", "child-scene", "grandchild-scene"],
		},
		indexMap: {
			branchesById: {
				root: branch("root", null, ["root-scene"]),
				child: branch("child", "root", ["child-scene"]),
				grandchild: branch("grandchild", "child", ["grandchild-scene"]),
			},
			elementsById: {
				"root-element": { id: "root-element", sceneId: "root-scene" },
				"child-element": { id: "child-element", sceneId: "child-scene" },
				"grandchild-element": {
					id: "grandchild-element",
					sceneId: "grandchild-scene",
				},
			},
			framesById: {
				"root-frame": { id: "root-frame" },
				"child-frame": { id: "child-frame" },
				"grandchild-frame": { id: "grandchild-frame" },
			},
			keyframesById: {
				"root-keyframe": { id: "root-keyframe", sceneId: "root-scene" },
				"child-keyframe": { id: "child-keyframe", sceneId: "child-scene" },
				"grandchild-keyframe": {
					id: "grandchild-keyframe",
					sceneId: "grandchild-scene",
				},
			},
			pathsById: {
				"root-child": path("root", "child", "root-scene", "child-scene"),
				"child-grandchild": path(
					"child",
					"grandchild",
					"child-scene",
					"grandchild-scene",
				),
			},
			scenesById: {
				"root-scene": scene("root-scene", "root", 0),
				"child-scene": scene("child-scene", "child", 1),
				"grandchild-scene": scene("grandchild-scene", "grandchild", 2),
			},
		},
	} as unknown as Tale;
}

function branch(id: string, parentBranchId: string | null, sceneIds: string[]) {
	return {
		id,
		parentBranchId,
		sceneIds,
		order: 0,
		path: id,
		title: id,
	};
}

function path(
	fromBranchId: string,
	toBranchId: string,
	fromSceneId: string,
	toSceneId: string,
) {
	return {
		description: "",
		fromBranchId,
		fromKeyframeId: null,
		fromSceneId,
		id: `${fromBranchId}-${toBranchId}`,
		label: "",
		order: 0,
		toBranchId,
		toKeyframeId: null,
		toSceneId,
		type: "linear",
	};
}
