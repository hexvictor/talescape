import type { NavigationContext } from "~/app/(tale-reader)/_shared/store/types/navigation";
import type { Block } from "~/server/db/data/tale-reader/types/blocks";

export type DebugTab = "navigation" | "scroll" | "progress" | "settings";

export type NavigationDebugTab =
	| "tale"
	| "block"
	| "branch"
	| "section"
	| "part"
	| "entry"
	| "page"
	| "path";

export type ScrollDebugTab = "scroll" | "reader";

export type ProgressDebugTab = "progress" | "paths";

export type ReaderDebugState = {
	hasRestoredInitialPosition: boolean;
	isInitialLoadComplete: boolean;
	isLayoutReady: boolean;
	isStructureMounted: boolean;
};

export type ProgressDebugState = {
	data: {
		activePathIds?: number[] | null;
		lastBlockId?: number | null;
		maxBlockIdReached?: number | null;
		maxReadProgress?: string | null;
		seenBlockIds?: number[] | null;
		seenBlockProgress?: string | null;
		seenPathIds?: number[] | null;
		updatedAt?: Date | string | null;
	} | null;
	isSaving: boolean;
	isTrackingPaused: boolean;
};

export type NavigationDebugData = {
	block: Block | null;
	branch: Block["branch"] | null;
	entry: Block["entry"] | null;
	effectivePage: Block["page"] | null;
	navigationContext: NavigationContext | null;
	page: Block["page"] | null;
	part: Block["part"] | null;
	section: Block["section"] | null;
	taleTitle: string;
};

export type SummaryDebugData = Omit<NavigationDebugData, "taleTitle">;
