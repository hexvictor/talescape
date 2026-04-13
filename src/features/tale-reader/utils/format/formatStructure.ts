import type {
	AnchorBinding,
	BlockMeta,
	FormattedTale,
	RawTaleData,
	SectionMeta,
} from "~/features/tale-reader/types/taleStructure";
import { sortByIndex, sortByParentAndIndex } from "~/lib/utils/sort";
import {
	formatBlocksById,
	formatBlocksByPageId,
	formatBlocksBySectionId,
} from "./formatBlocks";
import {
	formatChapterNumbersByEntryId,
	formatEntriesById,
	formatEntriesByPartId,
	formatLocalChapterNumbersByPartId,
} from "./formatEntries";
import {
	formatFragmentsByBlockId,
	formatFragmentsById,
} from "./formatFragments";
import {
	formatPageByBlockId,
	formatPagesByEntryId,
	formatPagesById,
	formatPagesByPartId,
} from "./formatPages";
import { formatPartsById } from "./formatParts";
import { formatSectionsById } from "./formatSections";

export function formatTaleStructure(data: RawTaleData): FormattedTale {
	const { tale, parts, entries, pages, sections, blocks, fragments } = data;

	const partsSorted = sortByIndex(parts);
	const sectionsSorted = sortByIndex(sections);

	const entriesSorted = sortByParentAndIndex(
		entries,
		partsSorted,
		(entry) => entry.partId,
		(entry) => entry.index,
		(part) => part.id,
	);

	const pagesSorted = sortByParentAndIndex(
		pages,
		entriesSorted,
		(page) => page.entryId,
		(page) => page.index,
		(entry) => entry.id,
	);

	const blocksSorted = sortByParentAndIndex(
		blocks,
		sectionsSorted,
		(block) => block.sectionId,
		(block) => block.index,
		(section) => section.id,
	);

	const fragmentsSorted = sortByParentAndIndex(
		fragments,
		blocksSorted,
		(fragment) => fragment.blockId,
		(fragment) => fragment.index,
		(block) => block.id,
	);

	const chapters = entriesSorted.filter((e) => e.type === "chapter");

	const blocksByPageId = formatBlocksByPageId(blocksSorted);
	const pageByBlockId = formatPageByBlockId(pagesSorted, blocksSorted);
	const pagesByEntryId = formatPagesByEntryId(pagesSorted, entriesSorted);
	const entriesByPartId = formatEntriesByPartId(entriesSorted, partsSorted);
	const pagesByPartId = formatPagesByPartId(pagesSorted, partsSorted);
	const chapterNumbersByEntryId = formatChapterNumbersByEntryId(chapters);
	const localChaptersByPartId = formatLocalChapterNumbersByPartId(
		chapters,
		partsSorted,
	);
	const fragmentsByBlockId = formatFragmentsByBlockId(
		blocksSorted,
		fragmentsSorted,
	);
	const blocksBySectionId = formatBlocksBySectionId(
		blocksSorted,
		sectionsSorted,
	);

	const pageCount = pagesSorted.length;
	const numberedPages = pagesSorted.filter((p) => p.isPaginated);
	const numberedPageIds = numberedPages.map((p) => p.id);
	const pageIds = pagesSorted.map((p) => p.id);
	const entryIds = entriesSorted.map((e) => e.id);
	const blockIds = blocksSorted.map((b) => b.id);
	const partIds = partsSorted.map((p) => p.id);
	const sectionIds = sectionsSorted.map((s) => s.id);

	const pagesById = formatPagesById(
		pagesSorted,
		numberedPageIds,
		blocksByPageId,
		pagesByEntryId,
		pagesByPartId,
	);
	const entriesById = formatEntriesById(
		entriesSorted,
		pagesByEntryId,
		entriesByPartId,
		chapterNumbersByEntryId,
		localChaptersByPartId,
	);

	const fragmentsById = formatFragmentsById(
		fragmentsSorted,
		blocksSorted,
		fragmentsByBlockId,
	);
	const partsById = formatPartsById(
		partsSorted,
		entriesByPartId,
		pagesByEntryId,
	);
	const sectionsById = formatSectionsById(
		sectionsSorted,
		blocksBySectionId,
		pageByBlockId,
	);

	const blocksById = formatBlocksById(
		blocksSorted,
		fragmentsByBlockId,
		sectionsById,
		partsById,
		entriesById,
		pagesById,
		partsSorted,
		entriesSorted,
		pagesSorted,
	);

	const blocksArray = Object.values(blocksById);
	const pagesArray = Object.values(pagesById);
	const entriesArray = Object.values(entriesById);
	const partsArray = Object.values(partsById);
	const sectionsArray = Object.values(sectionsById);
	const fragmentsArray = Object.values(fragmentsById);

	const anchorIds = formatAnchors(sectionIds, sectionsById, blocksById);

	return {
		...tale,
		structure: {
			blockCount: blockIds.length,
			pageCount,
			anchorIds,
			pageIds,
			pages: pagesArray,
			numberedPageIds,
			numberedPages,
			entryIds,
			entries: entriesArray,
			firstBlock: blockIds[0] ?? null,
			lastBlock: blockIds[blockIds.length - 1] ?? null,
			blockIds,
			blocks: blocksArray,
			partIds,
			parts: partsArray,
			fragments: fragmentsArray,
			sectionIds,
			sections: sectionsArray,
			map: {},
			branches: {},
			indexMap: {
				entriesById,
				partsById,
				fragmentsById,
				sectionsById,
				blocksById,
				pagesById,
			},
		},
	};
}

function formatAnchors(
	sectionIds: number[],
	sectionsById: Record<string, SectionMeta>,
	blocksById: Record<string, BlockMeta>,
): AnchorBinding[] {
	return sectionIds.flatMap((sectionId) => {
		const section = sectionsById[sectionId];
		if (!section) return [];

		return section.blockIds
			.map((blockId) => blocksById[blockId])
			.filter((block): block is BlockMeta => !!block && block.anchorId !== null)
			.map((block) => ({
				// biome-ignore lint/style/noNonNullAssertion: block.anchorId is checked above
				anchorId: block.anchorId!,
				elementId: block.id,
				type: "block",
			})) as AnchorBinding[];
	});
}
