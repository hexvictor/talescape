import type { PublicUserInfo } from "~/server/db/data/users/queries";
import type { TaleRecord } from "../../queries/tales/getTale";
import type { Tale, TaleContent, TaleIndexMap } from "../../types/tales";
import { formatBlocks } from "../blocks/formatBlocks";
import { formatBranches } from "../branches/formatBranches";
import { formatEntries } from "../entries/formatEntries";
import { formatFragments } from "../fragments/formatFragments";
import { formatPages } from "../pages/formatPages";
import { formatParts } from "../parts/formatParts";
import { formatPaths } from "../paths/formatPaths";
import { formatSections } from "../sections/formatSections";
import {
	type FlatTaleRecord,
	createDerivedTaleIndexes,
	flattenTaleRecord,
	mapById,
	valuesFromIds,
} from "./formatTaleContext";

export function formatTaleStructure(rawTale: TaleRecord): Tale {
	const flat = flattenTaleRecord(rawTale);
	const derived = createDerivedTaleIndexes(flat);
	const indexMap = createTaleIndexMap(flat, derived);
	const content = createTaleContent(flat, indexMap);

	const { creatorById, branches, parts, ...tale } = rawTale;

	return {
		...tale,
		creator: formatCreator(creatorById),
		content,
	};
}

function createTaleIndexMap(
	flat: FlatTaleRecord,
	derived: ReturnType<typeof createDerivedTaleIndexes>,
): TaleIndexMap {
	const branches = formatBranches(flat, derived);
	const parts = formatParts(flat, derived);
	const entries = formatEntries(flat, derived);
	const pages = formatPages(flat, derived);
	const sections = formatSections(flat, derived);
	const fragments = formatFragments(flat, derived);

	const branchesById = mapById(branches);
	const partsById = mapById(parts);
	const entriesById = mapById(entries);
	const pagesById = mapById(pages);
	const sectionsById = mapById(sections);
	const fragmentsById = mapById(fragments);

	const paths = formatPaths(flat, branchesById);
	const pathsById = mapById(paths);
	const blocks = formatBlocks(flat, {
		branchesById,
		partsById,
		entriesById,
		pagesById,
		sectionsById,
		derived,
	});
	const blocksById = mapById(blocks);

	return {
		branchesById,
		pathsById,
		partsById,
		entriesById,
		pagesById,
		sectionsById,
		blocksById,
		fragmentsById,
	};
}

function createTaleContent(
	flat: FlatTaleRecord,
	indexMap: TaleIndexMap,
): TaleContent {
	const order = {
		branchIds: flat.branches.map((branch) => branch.id),
		pathIds: flat.paths.map((path) => path.id),
		partIds: flat.parts.map((part) => part.id),
		entryIds: flat.entries.map((entry) => entry.id),
		pageIds: flat.pages.map((page) => page.id),
		numberedPageIds: flat.pages
			.filter((page) => page.isPaginated)
			.map((page) => page.id),
		sectionIds: flat.sections.map((section) => section.id),
		blockIds: flat.blocks.map((block) => block.id),
		fragmentIds: flat.fragments.map((fragment) => fragment.id),
	};

	return {
		structure: {
			branches: valuesFromIds(order.branchIds, indexMap.branchesById),
			paths: valuesFromIds(order.pathIds, indexMap.pathsById),
			parts: valuesFromIds(order.partIds, indexMap.partsById),
			entries: valuesFromIds(order.entryIds, indexMap.entriesById),
			pages: valuesFromIds(order.pageIds, indexMap.pagesById),
			numberedPages: valuesFromIds(order.numberedPageIds, indexMap.pagesById),
			sections: valuesFromIds(order.sectionIds, indexMap.sectionsById),
			blocks: valuesFromIds(order.blockIds, indexMap.blocksById),
			fragments: valuesFromIds(order.fragmentIds, indexMap.fragmentsById),
		},
		order,
		counts: {
			branches: order.branchIds.length,
			paths: order.pathIds.length,
			parts: order.partIds.length,
			entries: order.entryIds.length,
			pages: order.pageIds.length,
			sections: order.sectionIds.length,
			blocks: order.blockIds.length,
			fragments: order.fragmentIds.length,
		},
		bounds: {
			firstBranchId: order.branchIds[0] ?? null,
			lastBranchId: order.branchIds.at(-1) ?? null,
			firstPartId: order.partIds[0] ?? null,
			lastPartId: order.partIds.at(-1) ?? null,
			firstEntryId: order.entryIds[0] ?? null,
			lastEntryId: order.entryIds.at(-1) ?? null,
			firstPageId: order.pageIds[0] ?? null,
			lastPageId: order.pageIds.at(-1) ?? null,
			firstSectionId: order.sectionIds[0] ?? null,
			lastSectionId: order.sectionIds.at(-1) ?? null,
			firstBlockId: order.blockIds[0] ?? null,
			lastBlockId: order.blockIds.at(-1) ?? null,
			firstFragmentId: order.fragmentIds[0] ?? null,
			lastFragmentId: order.fragmentIds.at(-1) ?? null,
		},
		indexMap,
	};
}

function formatCreator(
	creator: TaleRecord["creatorById"],
): PublicUserInfo | null {
	if (!creator) return null;

	return {
		id: creator.id,
		username: creator.username,
		fullName: creator.fullName,
		firstName: creator.firstName,
		lastName: creator.lastName,
		imageUrl: creator.imageUrl,
	};
}
