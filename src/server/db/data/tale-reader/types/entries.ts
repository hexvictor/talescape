import type { EntrySchema } from "~/server/db/schema";
import type { EntityBounds, StructurePosition } from "./shared";

export type TaleEntry = EntrySchema & {
	children: {
		pageIds: number[];
		blockIds: number[];
	};
	links: {
		previousEntryId: number | null;
		nextEntryId: number | null;
		previousEntryIdInPart: number | null;
		nextEntryIdInPart: number | null;
	};
	bounds: EntityBounds & {
		firstPageId: number | null;
		lastPageId: number | null;
	};
	counts: {
		pages: number;
		blocks: number;
	};
	position: StructurePosition & {
		entryNumber: number;
		isFirstInPart: boolean;
		isLastInPart: boolean;
	};
	chapter: {
		isChapter: boolean;
		number: number | null;
		localNumber: number | null;
	};
};

export type Entry = TaleEntry;
