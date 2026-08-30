import { describe, expect, it } from "vitest";
import type { TaleBlock, TaleNode } from "../types";
import {
	normalizeResponsiveBlockNodes,
	serializeResponsiveBlockNodes,
} from "./responsiveNodes";

const node: TaleNode = {
	animations: {
		ambient: { animations: [] },
		entering: { animations: [] },
		leaving: { animations: [] },
		scrolling: { animations: [] },
	},
	children: [],
	id: "12",
	mode: "stack",
	parentNodeId: null,
};

describe("responsive node normalization", () => {
	it("stores breakpoint nodes in an index and denormalizes only for persistence", () => {
		const block = {
			id: "4",
			responsiveOverrides: {
				mobile: { nodes: [node], rootNodeId: "12" },
			},
		} as unknown as TaleBlock;

		const normalized = normalizeResponsiveBlockNodes(block);
		const override = normalized.block.responsiveOverrides?.mobile;
		const nodeId = "responsive:4:mobile:12";

		expect(override?.nodeIds).toEqual([nodeId]);
		expect(override?.rootNodeId).toBe(nodeId);
		expect(override).not.toHaveProperty("nodes");
		expect(normalized.nodes[0]?.id).toBe(nodeId);

		const persisted = serializeResponsiveBlockNodes(
			normalized.block,
			Object.fromEntries(normalized.nodes.map((item) => [item.id, item])),
		);
		expect(persisted.mobile?.nodes?.[0]?.id).toBe("12");
		expect(persisted.mobile).not.toHaveProperty("nodeIds");
		expect(persisted.mobile?.rootNodeId).toBe("12");
	});
});
