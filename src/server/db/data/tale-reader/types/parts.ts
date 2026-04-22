import type { PartSchema } from "~/server/db/schema";

export type Part = PartWithRange & {
	entryIds: number[];
	firstEntryId?: number | null;
	lastEntryId?: number | null;
	entryCount: number;
	pageCount: number;
	isFirstPart: boolean;
	isLastPart: boolean;
};

export type PartRange = {
	firstBlockId: number | null;
	lastBlockId: number | null;
};

export type PartWithRange = PartSchema & PartRange;
