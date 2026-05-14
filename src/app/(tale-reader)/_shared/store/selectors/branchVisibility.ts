import type { Branch } from "~/server/db/data/tale-reader/types/branches";
import type { TaleContent } from "~/server/db/data/tale-reader/types/tales";
import type { ReaderProgressSchema } from "~/server/db/schema";
import type { TaleReaderState } from "../createReaderStore";
import type { Navigation } from "../types/navigation";

export function selectVisibleBranches(state: TaleReaderState) {
	const { content } = state.tale.data;
	const visibleBranchIds = getVisibleBranchIds({
		content,
		progress: state.progress.data,
		navigation: state.navigation.current,
	});

	return content.structure.branches.filter((branch) =>
		visibleBranchIds.has(branch.id),
	);
}

function getVisibleBranchIds({
	content,
	progress,
	navigation,
}: {
	content: TaleContent;
	progress: ReaderProgressSchema;
	navigation: Navigation | null;
}) {
	const visibleBranchIds = new Set<number>();
	const currentBranchId = getCurrentBranchId(content, progress, navigation);

	const visiblePathIds = new Set(progress.activePathIds ?? []);
	const rootBranches = content.structure.branches.filter(
		(branch) => branch.position.isRootBranch,
	);

	for (const branch of rootBranches) {
		addVisibleBranchRoute(content, branch, visiblePathIds, visibleBranchIds);
	}

	if (currentBranchId != null) {
		visibleBranchIds.add(currentBranchId);
	}

	return visibleBranchIds;
}

function addVisibleBranchRoute(
	content: TaleContent,
	branch: Branch,
	visiblePathIds: Set<number>,
	visibleBranchIds: Set<number>,
) {
	if (visibleBranchIds.has(branch.id)) return;

	visibleBranchIds.add(branch.id);

	const autoPathIds = getAutoVisiblePathIds(branch, visiblePathIds);

	for (const pathId of autoPathIds) {
		const path = content.indexMap.pathsById[pathId];
		const nextBranch =
			path != null ? content.indexMap.branchesById[path.toBranchId] : null;

		if (nextBranch) {
			addVisibleBranchRoute(
				content,
				nextBranch,
				visiblePathIds,
				visibleBranchIds,
			);
		}
	}
}

function getAutoVisiblePathIds(branch: Branch, visiblePathIds: Set<number>) {
	if (branch.links.outgoingPathIds.length === 1) {
		return branch.links.outgoingPathIds;
	}

	return branch.links.outgoingPathIds.filter((pathId) =>
		visiblePathIds.has(pathId),
	);
}

function getCurrentBranchId(
	content: TaleContent,
	progress: ReaderProgressSchema,
	navigation: Navigation | null,
) {
	if (navigation) return navigation.block.branchId;

	return progress.lastBlockId != null
		? (content.indexMap.blocksById[progress.lastBlockId]?.branchId ?? null)
		: null;
}
