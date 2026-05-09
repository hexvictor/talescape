import type { TaleBranch } from "../../types/branches";
import type {
	DerivedTaleIndexes,
	FlatTaleRecord,
} from "../tale/formatTaleContext";
import { siblingId } from "../tale/formatTaleContext";

export function formatBranches(
	flat: FlatTaleRecord,
	derived: DerivedTaleIndexes,
): TaleBranch[] {
	const branchIds = flat.branches.map((branch) => branch.id);

	return flat.branches.map((branch, index) => {
		const { sections, incomingPaths, outgoingPaths, ...baseBranch } = branch;
		const sectionIds = derived.sectionIdsByBranchId[branch.id] ?? [];
		const blockIds = derived.blockIdsByBranchId[branch.id] ?? [];
		const incomingPathIds = derived.incomingPathIdsByBranchId[branch.id] ?? [];
		const outgoingPathIds = derived.outgoingPathIdsByBranchId[branch.id] ?? [];

		return {
			...baseBranch,
			children: {
				sectionIds,
				blockIds,
			},
			links: {
				outgoingPathIds,
				incomingPathIds,
				previousBranchId: siblingId(branchIds, branch.id, -1),
				nextBranchId: siblingId(branchIds, branch.id, 1),
			},
			bounds: {
				firstSectionId: sectionIds[0] ?? null,
				lastSectionId: sectionIds.at(-1) ?? null,
				firstBlockId: blockIds[0] ?? null,
				lastBlockId: blockIds.at(-1) ?? null,
			},
			counts: {
				sections: sectionIds.length,
				blocks: blockIds.length,
			},
			position: {
				index,
				isFirst: index === 0,
				isLast: index === flat.branches.length - 1,
				isRootBranch: incomingPathIds.length === 0,
				hasIncomingPaths: incomingPathIds.length > 0,
				hasOutgoingPaths: outgoingPathIds.length > 0,
				isChoiceBranch: outgoingPathIds.length > 1,
				isTerminalBranch: outgoingPathIds.length === 0,
			},
		};
	});
}
