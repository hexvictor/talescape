import type { Tale, TalePath } from "../types";

export function getNextSelectedBranchIds(
	tale: Tale,
	branchIds: string[],
	path: TalePath,
) {
	const rootBranchId = tale.bounds.rootBranchId;
	if (path.type === "return") {
		if (path.toBranchId === rootBranchId) return [];

		const targetIndex = branchIds.indexOf(path.toBranchId);
		if (targetIndex >= 0) return branchIds.slice(0, targetIndex + 1);

		const targetBranch = tale.indexMap.branchesById[path.toBranchId];
		if (!targetBranch) return branchIds;

		const parentIndex = targetBranch.parentBranchId
			? branchIds.indexOf(targetBranch.parentBranchId)
			: -1;
		const prefix = parentIndex >= 0 ? branchIds.slice(0, parentIndex + 1) : [];
		return [...prefix, path.toBranchId];
	}

	const sourceIndex = branchIds.indexOf(path.fromBranchId);
	const prefix =
		path.fromBranchId === rootBranchId
			? []
			: sourceIndex >= 0
				? branchIds.slice(0, sourceIndex + 1)
				: branchIds;

	if (path.toBranchId === rootBranchId) return [];
	if (prefix.at(-1) === path.toBranchId) return prefix;
	return [...prefix, path.toBranchId];
}
