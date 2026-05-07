import type { TaleSection } from "../../types/sections";
import type {
	DerivedTaleIndexes,
	FlatTaleRecord,
} from "../tale/formatTaleContext";
import { siblingId } from "../tale/formatTaleContext";

export function formatSections(
	flat: FlatTaleRecord,
	derived: DerivedTaleIndexes,
): TaleSection[] {
	const sectionIds = flat.sections.map((section) => section.id);

	return flat.sections.map((section, index) => {
		const { blocks, ...baseSection } = section;
		const blockIds = derived.blockIdsBySectionId[section.id] ?? [];
		const branchSectionIds =
			derived.sectionIdsByBranchId[section.branchId] ?? [];
		const pageIds = new Set(
			blockIds
				.map((blockId) => derived.blockById[blockId]?.pageId)
				.filter((pageId): pageId is number => pageId != null),
		);

		return {
			...baseSection,
			children: {
				blockIds,
			},
			links: {
				previousSectionId: siblingId(sectionIds, section.id, -1),
				nextSectionId: siblingId(sectionIds, section.id, 1),
				previousSectionIdInBranch: siblingId(branchSectionIds, section.id, -1),
				nextSectionIdInBranch: siblingId(branchSectionIds, section.id, 1),
			},
			bounds: {
				firstBlockId: blockIds[0] ?? null,
				lastBlockId: blockIds.at(-1) ?? null,
			},
			counts: {
				blocks: blockIds.length,
				pages: pageIds.size,
			},
			position: {
				index,
				isFirst: index === 0,
				isLast: index === flat.sections.length - 1,
				isFirstInBranch: branchSectionIds[0] === section.id,
				isLastInBranch: branchSectionIds.at(-1) === section.id,
			},
		};
	});
}
