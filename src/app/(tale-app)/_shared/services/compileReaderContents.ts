import type {
	Anchor,
	ReaderContentsEntry,
	ReaderContentsEntryPartSpan,
	ReaderContentsPage,
	ReaderContentsPart,
	ResolvedTaleEntry,
	Tale,
} from "../types";
import { getTaleEntries, getTaleParts } from "./taleLookups";

export type CompiledReaderContents = {
	contents: ReaderContentsPart[];
	entries: ReaderContentsEntry[];
	entryIndexById: Record<string, number>;
	pageIndexById: Record<string, number>;
	pages: ReaderContentsPage[];
};

/**
 * Compiles the nested contents model consumed by reader navigation.
 *
 * @param tale - Formatted tale structure.
 * @param anchors - Active anchors for the selected branch route.
 * @returns Parts, entries, and blocks in reader order.
 *
 * @example
 * const contents = compileReaderContents(tale, anchors);
 */
export function compileReaderContents(
	tale: Tale,
	anchors: Anchor[],
): CompiledReaderContents {
	const anchorsByEntryId = new Map<string, Anchor[]>();
	const pageNumberById = new Map<string, number>();
	let pageNumber = 0;
	for (const anchor of anchors) {
		const page = tale.indexMap.pagesById[anchor.pageId];
		if (page?.isPaginated && !pageNumberById.has(page.id)) {
			pageNumber += 1;
			pageNumberById.set(page.id, pageNumber);
		}
	}
	for (const anchor of anchors) {
		const entryAnchors = anchorsByEntryId.get(anchor.entryId);
		if (entryAnchors) {
			entryAnchors.push(anchor);
		} else {
			anchorsByEntryId.set(anchor.entryId, [anchor]);
		}
	}

	const entriesByPartId = new Map<string, ResolvedTaleEntry[]>();
	for (const entry of getTaleEntries(tale)) {
		const partEntries = entriesByPartId.get(entry.partId);
		if (partEntries) {
			partEntries.push(entry);
		} else {
			entriesByPartId.set(entry.partId, [entry]);
		}
	}

	let chapterNumber = 0;
	const pages: ReaderContentsPage[] = [];
	const allEntries: ReaderContentsEntry[] = [];
	const contents = getTaleParts(tale).flatMap((part) => {
		const partEntries = (entriesByPartId.get(part.id) ?? []).flatMap(
			(entry) => {
				const entryAnchors = anchorsByEntryId.get(entry.id) ?? [];
				if (entryAnchors.length === 0) return [];
				const derivedChapterNumber =
					entry.type === "chapter" ? ++chapterNumber : null;
				const entryPages = compileEntryPages(
					tale,
					entry.id,
					entryAnchors,
					pageNumberById,
				);
				pages.push(...entryPages);
				const compiledEntry: ReaderContentsEntry = {
					blockIds: entryAnchors.map((anchor) => anchor.blockId),
					chapterNumber: derivedChapterNumber,
					hasChoiceBlock: entryAnchors.some(
						(anchor) => tale.indexMap.blocksById[anchor.blockId]?.isChoiceBlock,
					),
					id: entry.id,
					partSpans: compileEntryPartSpans(tale, entryPages),
					pageIds: entryPages.map((page) => page.id),
				};
				allEntries.push(compiledEntry);
				return [compiledEntry];
			},
		);
		if (partEntries.length === 0) return [];
		return [
			{
				entryIds: partEntries.map((entry) => entry.id),
				id: part.id,
			},
		];
	});

	return {
		contents,
		entries: allEntries,
		entryIndexById: Object.fromEntries(
			allEntries.map((entry, index) => [entry.id, index]),
		),
		pageIndexById: Object.fromEntries(
			pages.map((page, index) => [page.id, index]),
		),
		pages,
	};
}

/**
 * Compiles distinct route-visible pages for one entry.
 *
 * @param entryId - Parent entry identifier.
 * @param anchors - Visible anchors belonging to the entry.
 * @param pageNumberById - Derived paginated page numbers.
 * @returns Distinct pages in current reader order.
 */
function compileEntryPages(
	tale: Tale,
	entryId: string,
	anchors: Anchor[],
	pageNumberById: Map<string, number>,
): ReaderContentsPage[] {
	const anchorsByPageId = new Map<string, Anchor[]>();
	for (const anchor of anchors) {
		const pageAnchors = anchorsByPageId.get(anchor.pageId);
		if (pageAnchors) pageAnchors.push(anchor);
		else anchorsByPageId.set(anchor.pageId, [anchor]);
	}

	return [...anchorsByPageId.values()].map((pageAnchors) => {
		const firstAnchor = pageAnchors[0];
		if (!firstAnchor) {
			throw new Error(`Entry ${entryId} contains an empty compiled page.`);
		}
		const page = tale.indexMap.pagesById[firstAnchor.pageId];
		if (!page) {
			throw new Error(
				`Entry ${entryId} references missing page ${firstAnchor.pageId}.`,
			);
		}
		return {
			blockIds: pageAnchors.map((anchor) => anchor.blockId),
			hasChoiceBlock: pageAnchors.some(
				(anchor) => tale.indexMap.blocksById[anchor.blockId]?.isChoiceBlock,
			),
			id: page.id,
			number: pageNumberById.get(page.id) ?? null,
		};
	});
}

function compileEntryPartSpans(
	tale: Tale,
	pages: ReaderContentsPage[],
): ReaderContentsEntryPartSpan[] {
	const spans: ReaderContentsEntryPartSpan[] = [];

	for (const page of pages) {
		const talePage = tale.indexMap.pagesById[page.id];
		if (!talePage) continue;
		const currentSpan = spans.at(-1);
		if (currentSpan && currentSpan.partId === talePage.partId) {
			currentSpan.endPageId = page.id;
			currentSpan.pageCount += 1;
			continue;
		}

		spans.push({
			endPageId: page.id,
			partId: talePage.partId,
			pageCount: 1,
			startPageId: page.id,
		});
	}

	return spans;
}
