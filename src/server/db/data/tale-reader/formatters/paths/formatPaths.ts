import type { TaleBranch } from "../../types/branches";
import type { TalePath } from "../../types/paths";
import { type FlatTaleRecord, siblingId } from "../tale/formatTaleContext";

export function formatPaths(
	flat: FlatTaleRecord,
	branchesById: Record<number, TaleBranch>,
): TalePath[] {
	const pathIds = flat.paths.map((path) => path.id);

	return flat.paths.map((path) => ({
		...path,
		links: {
			previousPathId: siblingId(pathIds, path.id, -1),
			nextPathId: siblingId(pathIds, path.id, 1),
		},
		fromBranch: branchesById[path.fromBranchId] ?? null,
		toBranch: branchesById[path.toBranchId] ?? null,
	}));
}
