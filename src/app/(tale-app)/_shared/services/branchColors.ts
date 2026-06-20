import { branchColors } from "../constants";
import type { Tale } from "../types";

export function getBranchColor(tale: Tale, branchId: string) {
	const index = tale.structure.branches.findIndex(
		(branch) => branch.id === branchId,
	);
	return branchColors[Math.max(0, index) % branchColors.length] ?? "#fff8e8";
}
