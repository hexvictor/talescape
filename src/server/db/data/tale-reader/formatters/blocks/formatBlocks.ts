import type { TaleBlock } from "../../types/blocks";
import type { TaleBranch } from "../../types/branches";
import type { TaleEntry } from "../../types/entries";
import type { TalePage } from "../../types/pages";
import type { TalePart } from "../../types/parts";
import type { TaleSection } from "../../types/sections";
import type {
	DerivedTaleIndexes,
	FlatTaleRecord,
} from "../tale/formatTaleContext";

export function formatBlocks(
	flat: FlatTaleRecord,
	args: {
		branchesById: Record<number, TaleBranch>;
		partsById: Record<number, TalePart>;
		entriesById: Record<number, TaleEntry>;
		pagesById: Record<number, TalePage>;
		sectionsById: Record<number, TaleSection>;
		derived: DerivedTaleIndexes;
	},
): TaleBlock[] {
	const entryIndexById = new Map<number, number>();
	const partIndexById = new Map<number, number>();
	const sectionIndexById = new Map<number, number>();
	const branchIndexById = new Map<number, number>();

	return flat.blocks.map((block, index) => {
		const {
			page: _rawPage,
			entry: _rawEntry,
			part: _rawPart,
			fragments: _rawFragments,
			...baseBlock
		} = block;
		const structuredPart = args.partsById[block.partId];
		const structuredEntry = args.entriesById[block.entryId];
		const structuredSection = args.sectionsById[block.sectionId];

		if (!structuredPart) throw new Error(`Missing part for block ${block.id}`);
		if (!structuredEntry)
			throw new Error(`Missing entry for block ${block.id}`);
		if (!structuredSection)
			throw new Error(`Missing section for block ${block.id}`);

		const structuredBranch = args.branchesById[structuredSection.branchId];
		if (!structuredBranch)
			throw new Error(`Missing branch for block ${block.id}`);

		const entryIndex = entryIndexById.get(block.entryId) ?? 0;
		const partIndex = partIndexById.get(block.partId) ?? 0;
		const sectionIndex = sectionIndexById.get(block.sectionId) ?? 0;
		const branchIndex = branchIndexById.get(structuredSection.branchId) ?? 0;

		entryIndexById.set(block.entryId, entryIndex + 1);
		partIndexById.set(block.partId, partIndex + 1);
		sectionIndexById.set(block.sectionId, sectionIndex + 1);
		branchIndexById.set(structuredSection.branchId, branchIndex + 1);

		const fragmentIds = args.derived.fragmentIdsByBlockId[block.id] ?? [];
		const branchBlockIds =
			args.derived.blockIdsByBranchId[structuredSection.branchId] ?? [];
		const sectionBlockIds =
			args.derived.blockIdsBySectionId[block.sectionId] ?? [];
		const entryBlockIds = args.derived.blockIdsByEntryId[block.entryId] ?? [];
		const partBlockIds = args.derived.blockIdsByPartId[block.partId] ?? [];
		const page =
			block.pageId != null ? (args.pagesById[block.pageId] ?? null) : null;

		return {
			...baseBlock,
			branchId: structuredSection.branchId,
			pageId: block.pageId,
			children: {
				fragmentIds,
			},
			links: {
				previousBlockIdInBranch: siblingId(branchBlockIds, block.id, -1),
				nextBlockIdInBranch: siblingId(branchBlockIds, block.id, 1),
				previousBlockIdInSection: siblingId(sectionBlockIds, block.id, -1),
				nextBlockIdInSection: siblingId(sectionBlockIds, block.id, 1),
				previousBlockIdInEntry: siblingId(entryBlockIds, block.id, -1),
				nextBlockIdInEntry: siblingId(entryBlockIds, block.id, 1),
				previousBlockIdInPart: siblingId(partBlockIds, block.id, -1),
				nextBlockIdInPart: siblingId(partBlockIds, block.id, 1),
			},
			position: {
				index,
				entryIndex,
				partIndex,
				sectionIndex,
				branchIndex,
				isPageBlock: block.pageId != null,
				isFirst: index === 0,
				isLast: index === flat.blocks.length - 1,
				isFirstInBranch: branchBlockIds[0] === block.id,
				isLastInBranch: branchBlockIds.at(-1) === block.id,
				isFirstInEntry: structuredEntry.bounds.firstBlockId === block.id,
				isLastInEntry: structuredEntry.bounds.lastBlockId === block.id,
				isFirstInPart: structuredPart.bounds.firstBlockId === block.id,
				isLastInPart: structuredPart.bounds.lastBlockId === block.id,
				isFirstInSection: structuredSection.bounds.firstBlockId === block.id,
				isLastInSection: structuredSection.bounds.lastBlockId === block.id,
			},
			page,
			branch: structuredBranch,
			entry: structuredEntry,
			part: structuredPart,
			section: structuredSection,
		};
	});
}

function siblingId(ids: number[], currentId: number, offset: -1 | 1) {
	const index = ids.indexOf(currentId);
	if (index < 0) return null;

	return ids[index + offset] ?? null;
}
