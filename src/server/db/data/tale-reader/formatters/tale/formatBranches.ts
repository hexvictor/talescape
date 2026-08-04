import type { TaleBranch } from "~/app/(tale-app)/_shared/types";

/**
 * Formats database branch rows into the reader branch model.
 *
 * @param rows - Branch rows returned from the tale query.
 * @returns Reader branches with formatter-derived readable paths.
 *
 * @example
 * const branches = formatBranches(record.branches);
 */
export function formatBranches(rows: unknown[]): TaleBranch[] {
	const branches = rows.map((row) => {
		const item = row as {
			description?: string | null;
			id: number;
			name?: string;
			parentBranchId?: number | null;
			order?: number;
			title?: string | null;
		};
		return {
			blockIds: [],
			description: item.description ?? undefined,
			id: String(item.id),
			order: item.order ?? 0,
			parentBranchId:
				item.parentBranchId == null ? null : String(item.parentBranchId),
			path: "",
			title: item.title ?? item.name ?? `Branch ${item.id}`,
		};
	});

	const byId = new Map(branches.map((branch) => [branch.id, branch]));
	return branches.map((branch) => ({
		...branch,
		path: deriveBranchPath(branch.id, byId),
	}));
}

/**
 * Derives a stable readable branch path from the parent branch chain.
 *
 * @param branchId - The branch id to resolve.
 * @param branchesById - Branches keyed by id.
 * @returns A slash-separated path built from branch titles, with cycle protection.
 *
 * @example
 * const path = deriveBranchPath("12", branchesById);
 */
function deriveBranchPath(
	branchId: string,
	branchesById: Map<string, TaleBranch>,
): string {
	const segments: string[] = [];
	const visited = new Set<string>();
	let current = branchesById.get(branchId);

	while (current && !visited.has(current.id)) {
		visited.add(current.id);
		segments.unshift(slugSegment(current.title));
		current = current.parentBranchId
			? branchesById.get(current.parentBranchId)
			: undefined;
	}

	return segments.length ? segments.join("/") : branchId;
}

/**
 * Converts a branch title into a readable path segment.
 *
 * @param value - The title to slugify.
 * @returns A lowercase URL-safe segment.
 *
 * @example
 * const segment = slugSegment("The Church of Saint Orwyn");
 */
function slugSegment(value: string): string {
	const segment = value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return segment || "branch";
}
