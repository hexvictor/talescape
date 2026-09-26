import type {
	ResolvedTaleBranch,
	ResolvedTaleEntry,
	ResolvedTalePage,
	ResolvedTalePart,
	ResolvedTalePath,
	TaleBranch,
	TaleEntry,
	TalePage,
	TalePart,
	TalePath,
	TaleScene,
	TaleKeyframe,
} from "../../types";
import { adjacentIds, first, groupIdsBy, indexPosition, last } from "./shared";

/**
 * Formats branches and their incoming/outgoing path metadata.
 *
 * @param branches - Ordered raw branches.
 * @param paths - Raw tale paths.
 * @param sceneIdsByBranch - Scene ids grouped by branch.
 * @returns Resolved branches.
 */
export function resolveBranches(
	branches: TaleBranch[],
	paths: TalePath[],
	sceneIdsByBranch: Record<string, string[]>,
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
		const sceneIds = sceneIdsByBranch[branch.id] ?? [];
		const links = adjacentIds(branchIds, branch.id);
		return {
			...branch,
			sceneIds,
			bounds: { firstSceneId: first(sceneIds), lastSceneId: last(sceneIds) },
			counts: { scenes: sceneIds.length },
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
 * @param scenes - Raw tale scenes.
 * @param pages - Raw tale pages.
 * @returns Resolved entries.
 */
export function resolveEntries(
	entries: TaleEntry[],
	scenes: TaleScene[],
	pages: TalePage[],
	keyframes: TaleKeyframe[] = [],
): ResolvedTaleEntry[] {
	const entryIds = entries.map((entry) => entry.id);
	const pageById = new Map(pages.map((page) => [page.id, page]));
	const sceneIdsByEntry = groupUniqueSceneIds(keyframes, (step) =>
		step.pageId ? pageById.get(step.pageId)?.entryId : undefined,
	);
	for (const scene of scenes) {
		if (!scene.entryId) continue;
		sceneIdsByEntry[scene.entryId] ??= [];
		if (!sceneIdsByEntry[scene.entryId]?.includes(scene.id)) {
			sceneIdsByEntry[scene.entryId]?.push(scene.id);
		}
	}
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
		const sceneIds = sceneIdsByEntry[entry.id] ?? [];
		const pageIds = pageIdsByEntry[entry.id] ?? [];
		return {
			...entry,
			sceneIds,
			bounds: {
				firstSceneId: first(sceneIds),
				firstPageId: first(pageIds),
				lastSceneId: last(sceneIds),
				lastPageId: last(pageIds),
			},
			chapter: {
				isChapter: entry.type === "chapter",
				localNumber: localChapterNumberById.get(entry.id) ?? null,
				number: chapterNumberById.get(entry.id) ?? null,
			},
			pageIds,
			counts: { scenes: sceneIds.length, pages: pageIds.length },
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
 * @param scenes - Raw tale scenes.
 * @returns Resolved pages.
 */
export function resolvePages(
	pages: TalePage[],
	_entries: TaleEntry[],
	scenes: TaleScene[],
	keyframes: TaleKeyframe[] = [],
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
	const sceneIdsByPage = groupIdsBy(
		scenes,
		(item) => item.pageId,
		(item) => item.id,
	);
	for (const step of keyframes) {
		if (!step.pageId) continue;
		sceneIdsByPage[step.pageId] ??= [];
		if (!sceneIdsByPage[step.pageId]?.includes(step.sceneId)) {
			sceneIdsByPage[step.pageId]?.push(step.sceneId);
		}
	}
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
		const sceneIds = sceneIdsByPage[page.id] ?? page.sceneIds;
		return {
			...page,
			sceneIds,
			bounds: { firstSceneId: first(sceneIds), lastSceneId: last(sceneIds) },
			counts: { scenes: sceneIds.length },
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
 * @param scenes - Raw tale scenes.
 * @returns Resolved parts.
 */
export function resolveParts(
	parts: TalePart[],
	entries: TaleEntry[],
	pages: TalePage[],
	scenes: TaleScene[],
	keyframes: TaleKeyframe[] = [],
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
	const sceneIdsByPart = groupIdsBy(
		scenes,
		(item) => item.partId,
		(item) => item.id,
	);
	const pageById = new Map(pages.map((page) => [page.id, page]));
	for (const step of keyframes) {
		const partId = step.pageId ? pageById.get(step.pageId)?.partId : undefined;
		if (!partId) continue;
		sceneIdsByPart[partId] ??= [];
		if (!sceneIdsByPart[partId]?.includes(step.sceneId)) {
			sceneIdsByPart[partId]?.push(step.sceneId);
		}
	}
	return parts.map((part, index) => {
		const links = adjacentIds(partIds, part.id);
		const entryIds = entryIdsByPart[part.id] ?? [];
		const pageIds = pageIdsByPart[part.id] ?? [];
		const sceneIds = sceneIdsByPart[part.id] ?? [];
		return {
			...part,
			sceneIds,
			bounds: {
				firstSceneId: first(sceneIds),
				firstEntryId: first(entryIds),
				firstPageId: first(pageIds),
				lastSceneId: last(sceneIds),
				lastEntryId: last(entryIds),
				lastPageId: last(pageIds),
			},
			entryIds,
			pageIds,
			counts: {
				scenes: sceneIds.length,
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

function groupUniqueSceneIds(
	keyframes: TaleKeyframe[],
	getGroupId: (step: TaleKeyframe) => string | undefined,
): Record<string, string[]> {
	const groups: Record<string, string[]> = {};
	for (const step of keyframes) {
		const groupId = getGroupId(step);
		if (!groupId) continue;
		groups[groupId] ??= [];
		if (!groups[groupId]?.includes(step.sceneId))
			groups[groupId]?.push(step.sceneId);
	}
	return groups;
}
