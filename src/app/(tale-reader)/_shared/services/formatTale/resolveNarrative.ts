import type {
	ResolvedTaleBranch,
	ResolvedTaleEntry,
	ResolvedTalePage,
	ResolvedTalePart,
	ResolvedTalePath,
	TaleBlock,
	TaleBranch,
	TaleEntry,
	TalePage,
	TalePart,
	TalePath,
} from "../../types";
import { adjacentIds, first, groupIdsBy, indexPosition, last } from "./shared";

/**
 * Formats branches and their incoming/outgoing path metadata.
 *
 * @param branches - Ordered raw branches.
 * @param paths - Raw tale paths.
 * @param blockIdsByBranch - Block ids grouped by branch.
 * @returns Resolved branches.
 */
export function resolveBranches(
	branches: TaleBranch[],
	paths: TalePath[],
	blockIdsByBranch: Record<string, string[]>,
): ResolvedTaleBranch[] {
	const branchIds = branches.map((branch) => branch.id);
	const outgoingByBranch = groupIdsBy(
		paths,
		(path) => path.fromBranchId,
		(path) => path.id,
	);
	const incomingByBranch = groupIdsBy(
		paths,
		(path) => path.toBranchId,
		(path) => path.id,
	);
	return branches.map((branch, index) => {
		const outgoingPathIds = outgoingByBranch[branch.id] ?? [];
		const incomingPathIds = incomingByBranch[branch.id] ?? [];
		const blockIds = blockIdsByBranch[branch.id] ?? [];
		const links = adjacentIds(branchIds, branch.id);
		return {
			...branch,
			blockIds,
			children: { blockIds },
			bounds: { firstBlockId: first(blockIds), lastBlockId: last(blockIds) },
			counts: { blocks: blockIds.length },
			links: {
				incomingPathIds,
				nextBranchId: links.next,
				outgoingPathIds,
				previousBranchId: links.previous,
			},
			position: {
				...indexPosition(index, branches.length),
				hasIncomingPaths: incomingPathIds.length > 0,
				hasOutgoingPaths: outgoingPathIds.length > 0,
				isChoiceBranch: branch.parentBranchId !== null,
				isRootBranch: branch.parentBranchId === null,
				isTerminalBranch: outgoingPathIds.length === 0,
			},
		};
	});
}

/**
 * Formats entries and their page/block relationships.
 *
 * @param entries - Ordered raw entries.
 * @param blocks - Raw tale blocks.
 * @param pages - Raw tale pages.
 * @returns Resolved entries.
 */
export function resolveEntries(
	entries: TaleEntry[],
	blocks: TaleBlock[],
	pages: TalePage[],
): ResolvedTaleEntry[] {
	const entryIds = entries.map((entry) => entry.id);
	const blockIdsByEntry = groupIdsBy(
		blocks,
		(item) => item.entryId,
		(item) => item.id,
	);
	const pageIdsByEntry = groupIdsBy(
		pages,
		(item) => item.entryId,
		(item) => item.id,
	);
	const entriesByPart = groupIdsBy(
		entries,
		(item) => item.partId,
		(item) => item.id,
	);
	const numberedEntries = entries.filter(
		(entry) => entry.isNumbered && entry.type === "chapter",
	);
	const chapterNumberById = new Map(
		numberedEntries.map((entry, index) => [entry.id, index + 1]),
	);
	const localChapterNumberById = new Map<string, number>();
	for (const partEntryIds of Object.values(entriesByPart)) {
		let localNumber = 0;
		for (const entryId of partEntryIds) {
			const entry = entries.find((item) => item.id === entryId);
			if (!entry?.isNumbered || entry.type !== "chapter") continue;
			localNumber += 1;
			localChapterNumberById.set(entryId, localNumber);
		}
	}
	return entries.map((entry, index) => {
		const globalLinks = adjacentIds(entryIds, entry.id);
		const partLinks = adjacentIds(entriesByPart[entry.partId] ?? [], entry.id);
		const blockIds = blockIdsByEntry[entry.id] ?? [];
		const pageIds = pageIdsByEntry[entry.id] ?? [];
		return {
			...entry,
			bounds: {
				firstBlockId: first(blockIds),
				firstPageId: first(pageIds),
				lastBlockId: last(blockIds),
				lastPageId: last(pageIds),
			},
			chapter: {
				isChapter: entry.type === "chapter",
				localNumber: localChapterNumberById.get(entry.id) ?? null,
				number: chapterNumberById.get(entry.id) ?? null,
			},
			children: { blockIds, pageIds },
			counts: { blocks: blockIds.length, pages: pageIds.length },
			links: {
				nextEntryId: globalLinks.next,
				nextEntryIdInPart: partLinks.next,
				previousEntryId: globalLinks.previous,
				previousEntryIdInPart: partLinks.previous,
			},
			position: {
				...indexPosition(index, entries.length),
				entryNumber: index + 1,
				isFirstInPart: partLinks.index === 0,
				isLastInPart:
					partLinks.index === (entriesByPart[entry.partId]?.length ?? 0) - 1,
			},
		};
	});
}

/**
 * Formats pages and their narrative position metadata.
 *
 * @param pages - Raw tale pages.
 * @param entries - Raw tale entries.
 * @param blocks - Raw tale blocks.
 * @returns Resolved pages.
 */
export function resolvePages(
	pages: TalePage[],
	_entries: TaleEntry[],
	blocks: TaleBlock[],
): ResolvedTalePage[] {
	const pageIds = pages.map((page) => page.id);
	const pagesByEntry = groupIdsBy(
		pages,
		(item) => item.entryId,
		(item) => item.id,
	);
	const pagesByPart = groupIdsBy(
		pages,
		(item) => item.partId,
		(item) => item.id,
	);
	const blockIdsByPage = groupIdsBy(
		blocks,
		(item) => item.pageId,
		(item) => item.id,
	);
	const pageNumberById = new Map<string, number>();
	let pageNumber = 0;
	for (const page of pages) {
		if (!page.isPaginated) continue;
		pageNumber += 1;
		pageNumberById.set(page.id, pageNumber);
	}
	return pages.map((page, index) => {
		const globalLinks = adjacentIds(pageIds, page.id);
		const entryLinks = adjacentIds(pagesByEntry[page.entryId] ?? [], page.id);
		const partLinks = adjacentIds(pagesByPart[page.partId] ?? [], page.id);
		const blockIds = blockIdsByPage[page.id] ?? page.blockIds;
		return {
			...page,
			blockIds,
			bounds: { firstBlockId: first(blockIds), lastBlockId: last(blockIds) },
			children: { blockIds },
			counts: { blocks: blockIds.length },
			links: {
				nextPageId: globalLinks.next,
				nextPageIdInEntry: entryLinks.next,
				nextPageIdInPart: partLinks.next,
				previousPageId: globalLinks.previous,
				previousPageIdInEntry: entryLinks.previous,
				previousPageIdInPart: partLinks.previous,
			},
			position: {
				...indexPosition(index, pages.length),
				globalPageNumber: index + 1,
				isFirstInEntry: entryLinks.index === 0,
				isFirstInPart: partLinks.index === 0,
				isLastInEntry:
					entryLinks.index === (pagesByEntry[page.entryId]?.length ?? 0) - 1,
				isLastInPart:
					partLinks.index === (pagesByPart[page.partId]?.length ?? 0) - 1,
				pageNumber: pageNumberById.get(page.id) ?? null,
			},
		};
	});
}

/**
 * Formats parts and their child bounds.
 *
 * @param parts - Ordered raw parts.
 * @param entries - Raw tale entries.
 * @param pages - Raw tale pages.
 * @param blocks - Raw tale blocks.
 * @returns Resolved parts.
 */
export function resolveParts(
	parts: TalePart[],
	entries: TaleEntry[],
	pages: TalePage[],
	blocks: TaleBlock[],
): ResolvedTalePart[] {
	const partIds = parts.map((part) => part.id);
	const entryIdsByPart = groupIdsBy(
		entries,
		(item) => item.partId,
		(item) => item.id,
	);
	const pageIdsByPart = groupIdsBy(
		pages,
		(item) => item.partId,
		(item) => item.id,
	);
	const blockIdsByPart = groupIdsBy(
		blocks,
		(item) => item.partId,
		(item) => item.id,
	);
	return parts.map((part, index) => {
		const links = adjacentIds(partIds, part.id);
		const entryIds = entryIdsByPart[part.id] ?? [];
		const pageIds = pageIdsByPart[part.id] ?? [];
		const blockIds = blockIdsByPart[part.id] ?? [];
		return {
			...part,
			bounds: {
				firstBlockId: first(blockIds),
				firstEntryId: first(entryIds),
				firstPageId: first(pageIds),
				lastBlockId: last(blockIds),
				lastEntryId: last(entryIds),
				lastPageId: last(pageIds),
			},
			children: { blockIds, entryIds, pageIds },
			counts: {
				blocks: blockIds.length,
				entries: entryIds.length,
				pages: pageIds.length,
			},
			links: { nextPartId: links.next, previousPartId: links.previous },
			position: indexPosition(index, parts.length),
		};
	});
}

/**
 * Formats paths with adjacent path links.
 *
 * @param paths - Raw tale paths.
 * @returns Resolved paths.
 */
export function resolvePaths(paths: TalePath[]): ResolvedTalePath[] {
	const pathIds = paths.map((path) => path.id);
	return paths.map((path) => {
		const links = adjacentIds(pathIds, path.id);
		return {
			...path,
			links: { nextPathId: links.next, previousPathId: links.previous },
		};
	});
}
