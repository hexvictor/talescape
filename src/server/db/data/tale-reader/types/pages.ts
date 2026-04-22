import type { PageSchema } from "~/server/db/schema";

export type Page = PageSchema & {
	globalPageNumber: number;
	pageNumber: number | null;
	globalIndex: number;
	isFirst: boolean;
	isLast: boolean;
	isFirstInEntry: boolean;
	isLastInEntry: boolean;
	isFirstInPart: boolean;
	isLastInPart: boolean;
	blockId: number;
};
