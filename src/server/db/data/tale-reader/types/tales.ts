import type { PublicUserInfo } from "~/server/db/data/users/queries";
import type {
	PageSchema,
	TaleProgressSchema,
	TaleSchema,
} from "~/server/db/schema";
import type { Block, EmbeddedBlock } from "./blocks";
import type { Entry, EntryWithRange } from "./entries";
import type { EmbeddedFragment, Fragment } from "./fragments";
import type {
	BlocksById,
	EntrysById,
	FragmentsById,
	PagesById,
	PartsById,
	SectionsById,
} from "./indexMap";
import type { Page } from "./pages";
import type { Part, PartWithRange } from "./parts";
import type { EmbeddedSection, Section } from "./sections";

export type TaleNode = Block | Entry | Page | Part | Section;

export type TaleStructure = {
	blockCount: number;
	pageCount: number;
	firstBlock: number | null;
	lastBlock: number | null;
	pageIds: number[];
	numberedPageIds: number[];
	partIds: number[];
	blockIds: number[];
	entryIds: number[];
	sectionIds: number[];
	parts: Part[];
	entries: Entry[];
	pages: Page[];
	numberedPages: Page[];
	sections: Section[];
	blocks: Block[];
	fragments: Fragment[];
	indexMap: {
		entriesById: EntrysById;
		partsById: PartsById;
		fragmentsById: FragmentsById;
		sectionsById: SectionsById;
		blocksById: BlocksById;
		pagesById: PagesById;
	};
};

export type Tale = TaleSchema & {
	creator: PublicUserInfo | null;
	structure: TaleStructure;
};

export type TaleData = { tale: Tale; progress: TaleProgressSchema | null };

export type RawTaleData = {
	parts: PartWithRange[];
	entries: EntryWithRange[];
	pages: PageSchema[];
	sections: EmbeddedSection[];
	blocks: EmbeddedBlock[];
	fragments: EmbeddedFragment[];
};
