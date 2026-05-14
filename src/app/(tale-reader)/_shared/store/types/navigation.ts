import type { Block } from "~/server/db/data/tale-reader/types/blocks";
import type { Entry } from "~/server/db/data/tale-reader/types/entries";
import type { Page } from "~/server/db/data/tale-reader/types/pages";
import type { Part } from "~/server/db/data/tale-reader/types/parts";
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
	entry: Entry;
	part: Part;
	block: Block;
	section: Section;
};
