import type {
	Anchor,
	ReaderContentsEntry,
	ReaderContentsPage,
	ReaderContentsPart,
	Tale,
} from "../types";
import { getReaderPageLabel } from "./readerPageLabels";

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
	const globalBlockIndexById = new Map(
		anchors.map((anchor, index) => [anchor.block.id, index]),
	);
	const pageNumberById = new Map<string, number>();
	let pageNumber = 0;
	for (const anchor of anchors) {
		if (anchor.page.isPaginated && !pageNumberById.has(anchor.page.id)) {
			pageNumber += 1;
			pageNumberById.set(anchor.page.id, pageNumber);
		}
	}
	for (const anchor of anchors) {
		const entryAnchors = anchorsByEntryId.get(anchor.entry.id);
		if (entryAnchors) {
			entryAnchors.push(anchor);
		} else {
			anchorsByEntryId.set(anchor.entry.id, [anchor]);
		}
	}

	const entriesByPartId = new Map<string, typeof tale.structure.entries>();
	for (const entry of tale.structure.entries) {
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
	const contents = tale.structure.parts.flatMap((part) => {
		const partEntries = (entriesByPartId.get(part.id) ?? []).flatMap(
			(entry) => {
				const entryAnchors = anchorsByEntryId.get(entry.id) ?? [];
				if (entryAnchors.length === 0) return [];
				const derivedChapterNumber =
					entry.type === "chapter" ? ++chapterNumber : null;
				const entryPages = compileEntryPages(
					entry.id,
					entryAnchors,
					pageNumberById,
				);
				pages.push(...entryPages);
				const compiledEntry: ReaderContentsEntry = {
					blocks: entryAnchors.map((anchor, entryBlockIndex) => {
						const derivedPageNumber =
							pageNumberById.get(anchor.page.id) ?? null;
						return {
							blockId: anchor.block.id,
							entryBlockIndex,
							globalBlockIndex:
								globalBlockIndexById.get(anchor.block.id) ?? entryBlockIndex,
							isPaginated: anchor.page.isPaginated,
							pageId: anchor.page.id,
							pageLabel: getReaderPageLabel(anchor.page, derivedPageNumber),
							pageNumber: derivedPageNumber,
							pageType: anchor.page.type,
							title: anchor.block.title,
						};
					}),
					chapterNumber: derivedChapterNumber,
					firstBlockId: entryAnchors[0]?.block.id ?? "",
					hasChoiceBlock: entryAnchors.some(
						(anchor) => anchor.block.isChoiceBlock,
					),
					id: entry.id,
					pages: entryPages,
					title: entry.title,
					type: entry.type,
				};
				allEntries.push(compiledEntry);
				return [compiledEntry];
			},
		);
		if (partEntries.length === 0) return [];
		return [
			{
				blockCount: partEntries.reduce(
					(total, entry) => total + entry.blocks.length,
					0,
				),
				entries: partEntries,
				firstBlockId: partEntries[0]?.firstBlockId ?? "",
				id: part.id,
				pageCount: partEntries.reduce(
					(total, entry) => total + entry.pages.length,
					0,
				),
				title: part.title,
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
	entryId: string,
	anchors: Anchor[],
	pageNumberById: Map<string, number>,
): ReaderContentsPage[] {
	const anchorsByPageId = new Map<string, Anchor[]>();
	for (const anchor of anchors) {
		const pageAnchors = anchorsByPageId.get(anchor.page.id);
		if (pageAnchors) pageAnchors.push(anchor);
		else anchorsByPageId.set(anchor.page.id, [anchor]);
	}

	return [...anchorsByPageId.values()].map((pageAnchors) => {
		const firstAnchor = pageAnchors[0];
		if (!firstAnchor) {
			throw new Error(`Entry ${entryId} contains an empty compiled page.`);
		}
		const number = pageNumberById.get(firstAnchor.page.id) ?? null;
		return {
			blockIds: pageAnchors.map((anchor) => anchor.block.id),
			entryId,
			firstBlockId: firstAnchor.block.id,
			globalIndex: firstAnchor.page.position.globalPageNumber,
			hasChoiceBlock: pageAnchors.some((anchor) => anchor.block.isChoiceBlock),
			id: firstAnchor.page.id,
			isPaginated: firstAnchor.page.isPaginated,
			label: getReaderPageLabel(firstAnchor.page, number),
			number,
			title: firstAnchor.page.title ?? firstAnchor.block.title,
			type: firstAnchor.page.type,
		};
	});
}
