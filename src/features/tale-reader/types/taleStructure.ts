import type { PublicUserInfo } from "~/server/db/queries/users";
import type {
  BlockSchema,
  EntrySchema,
  FragmentSchema,
  PageSchema,
  PartSchema,
  SectionSchema,
  TaleProgressSchema,
  TaleSchema,
} from "~/server/db/schema";

export type FragmentMeta = EmbeddedFragment & {
  isFirstFragment: boolean;
  isLastFragment: boolean;
  sectionId: number;
  globalIndex: number;
};

export type BlockMeta = EmbeddedBlock & {
  partId: number;
  entryId: number;
  globalIndex: number;
  entryIndex: number;
  partIndex: number;
  fragmentIds: number[];
  anchorId: number | null;
  isPageBlock: boolean;
  isFirst: boolean;
  isLast: boolean;
  isFirstInEntry: boolean;
  isLastInEntry: boolean;
  isFirstInPart: boolean;
  isLastInPart: boolean;
  isFirstInSection: boolean;
  isLastInSection: boolean;
  page: PageMeta | null;
  entry: EntryMeta;
  part: PartMeta;
  section: SectionMeta;
};

export type PageMeta = PageSchema & {
  blockId: number;
  globalPageNumber: number;
  pageNumber: number | null;
  globalIndex: number;
  isFirst: boolean;
  isLast: boolean;
  isFirstInEntry: boolean;
  isLastInEntry: boolean;
  isFirstInPart: boolean;
  isLastInPart: boolean;
};

export type EntryMeta = EntryWithRange & {
  pageIds: number[];
  firstPageId?: number;
  lastPageId?: number;
  isChapter: boolean;
  chapterNumber?: number;
  entryNumber: number;
  localChapterNumber?: number;
  globalIndex: number;
  pageCount?: number;
  isFirstEntry: boolean;
  isLastEntry: boolean;
  isFirstInPart: boolean;
  isLastInPart: boolean;
};

export type PartMeta = PartWithRange & {
  entryIds: number[];
  firstEntryId?: number;
  lastEntryId?: number;
  entryCount: number;
  pageCount: number;
  isFirstPart: boolean;
  isLastPart: boolean;
};

export type SectionMeta = EmbeddedSection & {
  blockIds: number[];
  firstBlockId: number | null;
  lastBlockId: number | null;
  blockCount: number;
  pageCount: number;
  isFirstSection: boolean;
  isLastSection: boolean;
};

export type EntryRangeExtra = {
  firstBlockId: number | null;
  lastBlockId: number | null;
};

export type PartRangeExtra = {
  firstBlockId: number | null;
  lastBlockId: number | null;
};

export type FragmentEmbedExtra = {
  blockId: number;
  index: number;
};

export type BlockEmbedExtra = {
  sectionId: number;
  isSnap: boolean;
  pageId: number | null;
  index: number;
};

export type SectionEmbedExtra = {
  index: number;
  isSnap: boolean;

};

export type EntryWithRange = EntrySchema & EntryRangeExtra;

export type PartWithRange = PartSchema & PartRangeExtra;

export type EmbeddedFragment = FragmentSchema & FragmentEmbedExtra;

export type EmbeddedBlock = BlockSchema & BlockEmbedExtra;

export type EmbeddedSection = SectionSchema & SectionEmbedExtra;

export type EntrysById = Record<string, EntryMeta>;
export type PartsById = Record<string, PartMeta>;
export type FragmentsById = Record<string, FragmentMeta>;
export type SectionsById = Record<string, SectionMeta>;
export type BlocksById = Record<string, BlockMeta>;
export type PagesById = Record<string, PageMeta>;

export type AnchorBinding =
  | { anchorId: number; elementId: number; type: "block" }
  | { anchorId: number; elementId: number; type: "section" };

export type TargetMeta =
  | BlockMeta
  | EntryMeta
  | PageMeta
  | PartMeta
  | SectionMeta;

export type TaleStructure = {
  blockCount: number;
  pageCount: number;
  firstBlock: number | null;
  lastBlock: number | null;
  pageIds: number[];
  numberedPageIds: number[];
  partIds: number[];
  anchorIds: AnchorBinding[];
  blockIds: number[];
  entryIds: number[];
  sectionIds: number[];
  parts: PartMeta[];
  entries: EntryMeta[];
  pages: PageSchema[];
  numberedPages: PageSchema[];
  sections: SectionMeta[];
  blocks: BlockMeta[];
  fragments: FragmentMeta[];
  map: Record<string, unknown>;
  branches: Record<string, unknown>;
  indexMap: {
    entriesById: EntrysById;
    partsById: PartsById;
    fragmentsById: FragmentsById;
    sectionsById: SectionsById;
    blocksById: BlocksById;
    pagesById: PagesById;
  };
};

export type FormattedTale = TaleSchema & {
  structure: TaleStructure;
};

export type Tale = FormattedTale & {
  creator: PublicUserInfo | null;
};

export type TaleData = { tale: Tale; progress: TaleProgressSchema | null };

export type NavigationTargetType =
  | "block"
  | "page"
  | "section"
  | "entry"
  | "part";

export type NavigationOptions = {
  type: NavigationTargetType;
  progress: boolean;
  navigate: boolean;
  scrollIntoView: boolean;
  bypassAnchorValidation: boolean;
};

export type NavigationTargetMap = {
  block: BlockMeta | undefined;
  entry: EntryMeta | undefined;
  page: PageMeta | undefined;
  part: PartMeta | undefined;
  section: SectionMeta | undefined;
};

export type RawTaleData = {
  tale: TaleSchema;
  parts: PartWithRange[];
  entries: EntryWithRange[];
  pages: PageSchema[];
  sections: EmbeddedSection[];
  blocks: EmbeddedBlock[];
  fragments: EmbeddedFragment[];
};
