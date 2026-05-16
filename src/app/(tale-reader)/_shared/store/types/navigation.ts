import type { Block } from "~/server/db/data/tale-reader/types/blocks";
import type { Entry } from "~/server/db/data/tale-reader/types/entries";
import type { Page } from "~/server/db/data/tale-reader/types/pages";
import type { Part } from "~/server/db/data/tale-reader/types/parts";
import type { Path } from "~/server/db/data/tale-reader/types/paths";
import type { Section } from "~/server/db/data/tale-reader/types/sections";

export type NavigationNodeType =
	| "block"
	| "page"
	| "section"
	| "entry"
	| "part";

export type NavigationNodeMap = {
	block: Block | undefined;
	entry: Entry | undefined;
	page: Page | undefined;
	part: Part | undefined;
	section: Section | undefined;
};

export type Navigation = {
	page: Page | null;
	effectivePage: Page | null;
	entry: Entry;
	part: Part;
	block: Block;
	section: Section;
};

export type NavigationEntityPosition = {
	index: number | null;
	isFirst: boolean;
	isLast: boolean;
	total: number;
};

export type NavigationPagePosition = NavigationEntityPosition & {
	allPages: NavigationEntityPosition;
	paginatedPages: NavigationEntityPosition;
};

export type NavigationBlockBoundaries = {
	isFirstInTale: boolean;
	isLastInTale: boolean;
	isFirstInBranch: boolean;
	isLastInBranch: boolean;
	isFirstInSection: boolean;
	isLastInSection: boolean;
	isFirstInPart: boolean;
	isLastInPart: boolean;
	isFirstInEntry: boolean;
	isLastInEntry: boolean;
};

export type NavigationPathContext = {
	direction: "incoming" | "outgoing";
	path: Path;
	fromBranch: {
		id: number;
		name: string;
		position: NavigationEntityPosition;
	};
	toBranch: {
		id: number;
		name: string;
		position: NavigationEntityPosition;
	};
};

export type NavigationContext = {
	block: NavigationEntityPosition;
	blockBoundaries: NavigationBlockBoundaries;
	branch: NavigationEntityPosition;
	section: NavigationEntityPosition;
	part: NavigationEntityPosition;
	entry: NavigationEntityPosition;
	page: NavigationPagePosition;
	paths: NavigationPathContext[];
};
