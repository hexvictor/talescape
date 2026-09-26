import { describe, expect, it } from "vitest";
import type { ResolvedTaleBranch } from "~/app/(tale-app)/_shared/types";
import { getHiddenDescendantBranchIds } from "./taleEditorBranchGraphLayout";

describe("getHiddenDescendantBranchIds", () => {
	it("accepts restored array values from workspace persistence", () => {
		const branches = [
			branch({ id: "root", parentBranchId: null }),
			branch({ id: "child", parentBranchId: "root" }),
			branch({ id: "grandchild", parentBranchId: "child" }),
		];

		const hidden = getHiddenDescendantBranchIds(branches, [
			"root",
		] as unknown as Set<string>);

		expect([...hidden].sort()).toEqual(["child", "grandchild"]);
	});
});

function branch({
	id,
	parentBranchId,
}: {
	id: string;
	parentBranchId: string | null;
}): ResolvedTaleBranch {
	return {
		id,
		parentBranchId,
		order: 0,
		position: { index: 0, isFirst: false, isLast: false, total: 3 },
	} as unknown as ResolvedTaleBranch;
}
