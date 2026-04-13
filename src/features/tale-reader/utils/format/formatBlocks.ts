import type {
	BlockMeta,
	EmbeddedBlock,
	EmbeddedSection,
	EntryMeta,
	EntryWithRange,
	PageMeta,
	PartMeta,
	PartWithRange,
	SectionMeta,
} from "~/features/tale-reader/types/taleStructure";
import type { IdListMap } from "~/types/utils";
import { formatEntriesByBlockIds } from "./formatEntries";
import { formatPartsByBlockIds } from "./formatParts";
import { mapByKey } from "~/lib/utils/array";
import type { PageSchema } from "~/server/db/schema";

export function formatBlocksByPageId(
	blocks: EmbeddedBlock[],
): Record<string, number> {
	return Object.fromEntries(blocks.map((block) => [block.pageId, block.id]));
}

export function formatBlocksBySectionId(
	blocks: EmbeddedBlock[],
	sections: EmbeddedSection[],
): IdListMap {
	return Object.fromEntries(
		sections.map((section) => [
			section.id,
			blocks
				.filter((block) => block.sectionId === section.id)
				.map((block) => block.id),
		]),
	);
}

export function formatBlocksById(
	blocks: EmbeddedBlock[],
	fragmentsByBlockId: IdListMap,
	sectionsById: Record<string, SectionMeta>,
	partsById: Record<string, PartMeta>,
	entriesById: Record<string, EntryMeta>,
	pagesById: Record<string, PageMeta>,
	parts: PartWithRange[],
	entries: EntryWithRange[],
	pages: PageSchema[],
): Record<string, BlockMeta> {
	const firstPage = pages[0];
	const entryIdByBlockId = formatEntriesByBlockIds(entries, blocks);
	const partIdByBlockId = formatPartsByBlockIds(parts, blocks);

	const entryIndexMap: Record<string, number> = {};
	const partIndexMap: Record<string, number> = {};

	let pageId: number | null = firstPage ? firstPage.id : null;

	return mapByKey(
		blocks.map((block, i) => {
			const currentPageId = block.pageId ?? pageId;
			const page = currentPageId
				? (pagesById[currentPageId || ""] ?? null)
				: null;

			const section = sectionsById[block.sectionId];
			if (!section)
				throw new Error(`No section found for block ID: ${block.id}`);

			const hasPage = block.pageId !== null;
			if (hasPage) pageId = block.pageId;

			const entryId = entryIdByBlockId[block.id];
			if (!entryId)
				throw new Error(`No entryId found for block ID: ${block.id}`);
			const entry = entriesById[entryId];
			if (!entry) throw new Error(`No entry found for block ID: ${block.id}`);

			const partId = partIdByBlockId[block.id];
			if (!partId) throw new Error(`No partId found for block ID: ${block.id}`);
			const part = partsById[partId];
			if (!part) throw new Error(`No part found for block ID: ${block.id}`);

			const fragmentIds = fragmentsByBlockId[block.id];
			if (!fragmentIds)
				throw new Error(`No fragmentIds found for block ID: ${block.id}`);

			// Calculate indices
			const entryIndex = entryIndexMap[entryId] ?? 0;
			const partIndex = partIndexMap[partId] ?? 0;

			// Increment maps
			entryIndexMap[entryId] = entryIndex + 1;
			partIndexMap[partId] = partIndex + 1;

			const globalIndex = i;
			const isFirst = i === 0;
			const isLast = i === blocks.length - 1;
			const anchorId = pageId === null ? null : block.id;

			const isFirstInEntry = entry.firstBlockId === block.id;
			const isLastInEntry = entry.lastBlockId === block.id;
			const isFirstInPart = part.firstBlockId === block.id;
			const isLastInPart = part.lastBlockId === block.id;
			const isFirstInSection = section.firstBlockId === block.id;
			const isLastInSection = section.lastBlockId === block.id;

			const isPageBlock = block.pageId !== null;

			return {
				...block,
				pageId,
				partId,
				entryId,
				globalIndex,
				fragmentIds,
				isPageBlock,
				anchorId,
				isFirst,
				isLast,
				isFirstInEntry,
				isLastInEntry,
				isFirstInPart,
				isLastInPart,
				isFirstInSection,
				isLastInSection,
				entryIndex,
				partIndex,
				page,
				entry,
				part,
				section,
			};
		}),
		"id",
	);
}
