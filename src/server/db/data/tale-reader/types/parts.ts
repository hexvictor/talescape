import type { PartSchema } from "~/server/db/schema";
import type { EntityBounds, StructurePosition } from "./shared";

export type TalePart = PartSchema & {
	children: {
		entryIds: number[];
		pageIds: number[];
		blockIds: number[];
	};
	links: {
		previousPartId: number | null;
		nextPartId: number | null;
	};
	bounds: EntityBounds & {
		firstEntryId: number | null;
		lastEntryId: number | null;
		firstPageId: number | null;
		lastPageId: number | null;
	};
	counts: {
		entries: number;
		pages: number;
		blocks: number;
	};
	position: StructurePosition;
};

export type Part = TalePart;
