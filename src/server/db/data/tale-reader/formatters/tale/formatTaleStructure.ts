import { sortByIndex, sortByParentAndIndex } from "~/lib/utils/sort";
import type {
	RawTaleData,
	TaleStructure,
} from "~/server/db/data/tale-reader/types/tales";
import type { Page } from "../../types/pages";
import {
	formatBlocksById,
	formatBlocksByPageId,
	formatBlocksBySectionId,
} from "../blocks/formatBlocks";
import {
	formatChapterNumbersByEntryId,
	formatEntriesById,
	formatEntriesByPartId,
	formatLocalChapterNumbersByPartId,
} from "../entries/formatEntries";
import {
	formatFragmentsByBlockId,
	formatFragmentsById,
} from "../fragments/formatFragments";
import {
	formatPageByBlockId,
	formatPagesByEntryId,
	formatPagesById,
	formatPagesByPartId,
} from "../pages/formatPages";
import { formatPartsById } from "../parts/formatParts";
import { formatSectionsById } from "../sections/formatSections";

export function formatTaleStructure(data: RawTaleData): TaleStructure {
	const { parts, entries, pages, sections, blocks, fragments } = data;

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
	) as Page[];

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

	return {
		blockCount: blockIds.length,
		pageCount,
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
		indexMap: {
			entriesById,
			partsById,
			fragmentsById,
			sectionsById,
			blocksById,
			pagesById,
		},
	};
}
