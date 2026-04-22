import type { EntrySchema } from "~/server/db/schema";

export type Entry = EntryWithRange & {
	pageIds: number[];
	firstPageId?: number | null;
	lastPageId?: number | null;
	partId: number;
	isChapter: boolean;
	chapterNumber: number | null;
	entryNumber: number;
	localChapterNumber: number | null;
	globalIndex: number;
	pageCount: number | null;
	isFirstEntry: boolean;
	isLastEntry: boolean;
	isFirstInPart: boolean;
	isLastInPart: boolean;
};

export type EntryRange = {
	firstBlockId: number | null;
	lastBlockId: number | null;
};

export type EntryWithRange = EntrySchema & EntryRange;
