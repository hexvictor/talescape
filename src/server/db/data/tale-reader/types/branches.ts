import type { BranchSchema } from "~/server/db/schema";
import type { EntityBounds, StructurePosition } from "./shared";

export type TaleBranch = BranchSchema & {
	children: {
		sectionIds: number[];
		blockIds: number[];
	};
	links: {
		outgoingPathIds: number[];
		incomingPathIds: number[];
		previousBranchId: number | null;
		nextBranchId: number | null;
	};
	bounds: EntityBounds & {
		firstSectionId: number | null;
		lastSectionId: number | null;
	};
	counts: {
		sections: number;
		blocks: number;
	};
	position: StructurePosition & {
		isRootBranch: boolean;
		hasIncomingPaths: boolean;
		hasOutgoingPaths: boolean;
		isChoiceBranch: boolean;
		isTerminalBranch: boolean;
	};
};

export type Branch = TaleBranch;
