import type { PageSchema } from "~/server/db/schema";
import type { StructurePosition } from "./shared";

export type TalePage = PageSchema & {
	children: {
		blockIds: number[];
	};
	links: {
		previousPageId: number | null;
		nextPageId: number | null;
		previousPageIdInEntry: number | null;
		nextPageIdInEntry: number | null;
		previousPageIdInPart: number | null;
		nextPageIdInPart: number | null;
	};
	bounds: {
		firstBlockId: number | null;
		lastBlockId: number | null;
	};
	counts: {
		blocks: number;
	};
	position: StructurePosition & {
		globalPageNumber: number;
		pageNumber: number | null;
		isFirstInEntry: boolean;
		isLastInEntry: boolean;
		isFirstInPart: boolean;
		isLastInPart: boolean;
	};
};

export type Page = TalePage;
