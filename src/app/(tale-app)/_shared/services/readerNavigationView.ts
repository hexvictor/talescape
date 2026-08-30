import type {
	CompiledReader,
	ReaderContentsEntry,
	ReaderContentsPage,
	ReaderContentsPart,
	Tale,
	TaleEntry,
	TalePage,
} from "../types";
import { getReaderPageLabel } from "./readerPageLabels";

export type ReaderNavigationPage = {
	blockIds: string[];
	entryId: string;
	firstBlockId: string;
	hasChoiceBlock: boolean;
	id: string;
	isFirstInPart: boolean;
	isLastInPart: boolean;
	isPaginated: boolean;
	label: string;
	number: number | null;
	partId: string;
	partNumber: number;
	partTitle: string;
	title: string;
	type: TalePage["type"];
};

export type ReaderNavigationPartSpan = {
	endPageId: string;
	endsPart: boolean;
	partId: string;
	partNumber: number;
	partTitle: string;
	pageCount: number;
	startPageId: string;
	startsPart: boolean;
};

export type ReaderNavigationEntry = {
	blockCount: number;
	chapterNumber: number | null;
	firstBlockId: string;
	hasChoiceBlock: boolean;
	id: string;
	pages: ReaderNavigationPage[];
	pageCount: number;
	partSpans: ReaderNavigationPartSpan[];
	title: string;
	type: TaleEntry["type"];
};

export type ReaderNavigationPart = {
	blockCount: number;
	entries: ReaderNavigationEntry[];
	firstBlockId: string;
	id: string;
	pageCount: number;
	title: string;
};

export type ReaderNavigationView = {
	contents: ReaderNavigationPart[];
	entries: ReaderNavigationEntry[];
	pages: ReaderNavigationPage[];
};

type ReaderNavigationSource = Pick<
	CompiledReader,
	"contents" | "entries" | "pages"
>;

export function createReaderNavigationView(
	compiled: ReaderNavigationSource,
	tale: Tale,
): ReaderNavigationView {
	const visiblePartIds = new Set([
		...compiled.contents.map((part) => part.id),
		...compiled.pages.flatMap((page) => {
			const partId = tale.indexMap.pagesById[page.id]?.partId;
			return partId ? [partId] : [];
		}),
	]);
	const partNumberById = Object.fromEntries(
		tale.order.partIds
			.filter((partId) => visiblePartIds.has(partId))
			.map((partId, index) => [partId, index + 1]),
	);
	const pages = compiled.pages.flatMap((page) => {
		const view = createPageView(page, tale, partNumberById);
		return view ? [view] : [];
	});
	const pagesById = Object.fromEntries(pages.map((page) => [page.id, page]));
	const entries = compiled.entries.flatMap((entry) => {
		const view = createEntryView(entry, tale, pagesById, partNumberById);
		return view ? [view] : [];
	});
	const entriesById = Object.fromEntries(
		entries.map((entry) => [entry.id, entry]),
	);
	const contents = compiled.contents.flatMap((part) => {
		const view = createPartView(part, tale, entriesById);
		return view ? [view] : [];
	});

	return { contents, entries, pages };
}

function createPageView(
	page: ReaderContentsPage,
	tale: Tale,
	partNumberById: Record<string, number>,
): ReaderNavigationPage | null {
	const talePage = tale.indexMap.pagesById[page.id];
	if (!talePage) return null;
	const part = tale.indexMap.partsById[talePage.partId];
	const firstBlockId = page.blockIds[0];
	if (!part || !firstBlockId) return null;

	return {
		blockIds: page.blockIds,
		entryId: talePage.entryId,
		firstBlockId,
		hasChoiceBlock: page.hasChoiceBlock,
		id: page.id,
		isFirstInPart: talePage.position.isFirstInPart,
		isLastInPart: talePage.position.isLastInPart,
		isPaginated: talePage.isPaginated,
		label: getReaderPageLabel(talePage, page.number),
		number: page.number,
		partId: talePage.partId,
		partNumber: partNumberById[talePage.partId] ?? 1,
		partTitle: part.title,
		title: talePage.title ?? getReaderPageLabel(talePage, page.number),
		type: talePage.type,
	};
}

function createEntryView(
	entry: ReaderContentsEntry,
	tale: Tale,
	pagesById: Record<string, ReaderNavigationPage>,
	partNumberById: Record<string, number>,
): ReaderNavigationEntry | null {
	const taleEntry = tale.indexMap.entriesById[entry.id];
	const firstBlockId = entry.blockIds[0];
	if (!taleEntry || !firstBlockId) return null;

	return {
		blockCount: entry.blockIds.length,
		chapterNumber: entry.chapterNumber,
		firstBlockId,
		hasChoiceBlock: entry.hasChoiceBlock,
		id: entry.id,
		pages: entry.pageIds.flatMap((id) => {
			const page = pagesById[id];
			return page ? [page] : [];
		}),
		pageCount: entry.pageIds.filter((id) => pagesById[id]?.isPaginated).length,
		partSpans: entry.partSpans.flatMap((span) => {
			const part = tale.indexMap.partsById[span.partId];
			const startPage = tale.indexMap.pagesById[span.startPageId];
			const endPage = tale.indexMap.pagesById[span.endPageId];
			if (!part || !startPage || !endPage) return [];
			return [
				{
					...span,
					endsPart: endPage.position.isLastInPart,
					partNumber: partNumberById[span.partId] ?? 1,
					partTitle: part.title,
					pageCount: entry.pageIds.filter((pageId) => {
						const page = pagesById[pageId];
						return page?.partId === span.partId && page.isPaginated;
					}).length,
					startsPart: startPage.position.isFirstInPart,
				},
			];
		}),
		title: taleEntry.title,
		type: taleEntry.type,
	};
}

function createPartView(
	part: ReaderContentsPart,
	tale: Tale,
	entriesById: Record<string, ReaderNavigationEntry>,
): ReaderNavigationPart | null {
	const talePart = tale.indexMap.partsById[part.id];
	const entries = part.entryIds.flatMap((id) => {
		const entry = entriesById[id];
		return entry ? [entry] : [];
	});
	const firstBlockId = entries[0]?.firstBlockId;
	if (!talePart || !firstBlockId) return null;

	return {
		blockCount: entries.reduce((count, entry) => count + entry.blockCount, 0),
		entries,
		firstBlockId,
		id: part.id,
		pageCount: entries.reduce((count, entry) => count + entry.pageCount, 0),
		title: talePart.title,
	};
}
