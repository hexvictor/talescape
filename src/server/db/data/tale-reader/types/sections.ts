import type { SectionSchema } from "~/server/db/schema";
import type { EntityBounds, StructurePosition } from "./shared";

export type TaleSection = SectionSchema & {
	branchId: number;
	children: {
		blockIds: number[];
	};
	links: {
		previousSectionId: number | null;
		nextSectionId: number | null;
		previousSectionIdInBranch: number | null;
		nextSectionIdInBranch: number | null;
	};
	bounds: EntityBounds;
	counts: {
		blocks: number;
		pages: number;
	};
	position: StructurePosition & {
		isFirstInBranch: boolean;
		isLastInBranch: boolean;
	};
};

export type Section = TaleSection;
