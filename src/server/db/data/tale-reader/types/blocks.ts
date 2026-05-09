import type { BlockSchema } from "~/server/db/schema";
import type { TaleBranch } from "./branches";
import type { TaleEntry } from "./entries";
import type { TalePage } from "./pages";
import type { TalePart } from "./parts";
import type { TaleSection } from "./sections";
import type { StructurePosition } from "./shared";

export type TaleBlock = BlockSchema & {
	partId: number;
	entryId: number;
	sectionId: number;
	branchId: number;
	pageId: number | null;
	children: {
		fragmentIds: number[];
	};
	links: {
		previousBlockIdInBranch: number | null;
		nextBlockIdInBranch: number | null;
		previousBlockIdInSection: number | null;
		nextBlockIdInSection: number | null;
		previousBlockIdInEntry: number | null;
		nextBlockIdInEntry: number | null;
		previousBlockIdInPart: number | null;
		nextBlockIdInPart: number | null;
	};
	position: StructurePosition & {
		entryIndex: number;
		partIndex: number;
		sectionIndex: number;
		branchIndex: number;
		isPageBlock: boolean;
		isFirstInBranch: boolean;
		isLastInBranch: boolean;
		isFirstInEntry: boolean;
		isLastInEntry: boolean;
		isFirstInPart: boolean;
		isLastInPart: boolean;
		isFirstInSection: boolean;
		isLastInSection: boolean;
	};
	page: TalePage | null;
	branch: TaleBranch;
	entry: TaleEntry;
	part: TalePart;
	section: TaleSection;
};

export type Block = TaleBlock;
