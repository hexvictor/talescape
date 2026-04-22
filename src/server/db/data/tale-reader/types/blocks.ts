import type { BlockSchema } from "~/server/db/schema";
import type { Entry } from "./entries";
import type { Page } from "./pages";
import type { Part } from "./parts";
import type { Section } from "./sections";

export type Block = EmbeddedBlock & {
	partId: number;
	entryId: number;
	globalIndex: number;
	entryIndex: number;
	partIndex: number;
	fragmentIds: number[];
	isPageBlock: boolean;
	isFirst: boolean;
	isLast: boolean;
	isFirstInEntry: boolean;
	isLastInEntry: boolean;
	isFirstInPart: boolean;
	isLastInPart: boolean;
	isFirstInSection: boolean;
	isLastInSection: boolean;
	page: Page | null;
	entry: Entry;
	part: Part;
	section: Section;
};

export type BlockEmbed = {
	sectionId: number;
	isSnap: boolean;
	pageId: number | null;
	index: number;
};

export type EmbeddedBlock = BlockSchema & BlockEmbed;
