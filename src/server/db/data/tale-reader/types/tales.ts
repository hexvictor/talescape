import type { ReaderProgressSchema, TaleSchema } from "~/server/db/schema";
import type { Book } from "~/server/db/schema/library/books";
import type { PublicUserInfo } from "../../users/queries";
import type { TaleBlock } from "./blocks";
import type { TaleBranch } from "./branches";
import type { TaleEntry } from "./entries";
import type { TaleFragment } from "./fragments";
import type { TalePage } from "./pages";
import type { TalePart } from "./parts";
import type { TalePath } from "./paths";
import type { TaleSection } from "./sections";

export type TaleIndexMap = {
	branchesById: Record<number, TaleBranch>;
	pathsById: Record<number, TalePath>;
	partsById: Record<number, TalePart>;
	entriesById: Record<number, TaleEntry>;
	pagesById: Record<number, TalePage>;
	sectionsById: Record<number, TaleSection>;
	blocksById: Record<number, TaleBlock>;
	fragmentsById: Record<number, TaleFragment>;
};

export type TaleContent = {
	structure: TaleCollections;
	order: TaleOrder;
	counts: TaleCounts;
	bounds: TaleBounds;
	indexMap: TaleIndexMap;
};

export type TaleCollections = {
	branches: TaleBranch[];
	paths: TalePath[];
	parts: TalePart[];
	entries: TaleEntry[];
	pages: TalePage[];
	numberedPages: TalePage[];
	sections: TaleSection[];
	blocks: TaleBlock[];
	fragments: TaleFragment[];
};

export type TaleOrder = {
	branchIds: number[];
	pathIds: number[];
	partIds: number[];
	entryIds: number[];
	pageIds: number[];
	numberedPageIds: number[];
	sectionIds: number[];
	blockIds: number[];
	fragmentIds: number[];
};

export type TaleCounts = {
	branches: number;
	paths: number;
	parts: number;
	entries: number;
	pages: number;
	sections: number;
	blocks: number;
	fragments: number;
};

export type TaleBounds = {
	firstBranchId: number | null;
	lastBranchId: number | null;
	firstPartId: number | null;
	lastPartId: number | null;
	firstEntryId: number | null;
	lastEntryId: number | null;
	firstPageId: number | null;
	lastPageId: number | null;
	firstSectionId: number | null;
	lastSectionId: number | null;
	firstBlockId: number | null;
	lastBlockId: number | null;
	firstFragmentId: number | null;
	lastFragmentId: number | null;
};

export type Tale = TaleSchema & {
	book: Book | null;
	creator: PublicUserInfo | null;
	content: TaleContent;
};

export type TaleData = { tale: Tale; progress: ReaderProgressSchema | null };
export type TaleStructure = TaleContent;

export type { TaleBlock as Block } from "./blocks";
export type { TaleBranch as Branch } from "./branches";
export type { TaleEntry as Entry } from "./entries";
export type { TaleFragment as Fragment } from "./fragments";
export type { TalePage as Page } from "./pages";
export type { TalePart as Part } from "./parts";
export type { TalePath as Path } from "./paths";
export type { TaleSection as Section } from "./sections";
