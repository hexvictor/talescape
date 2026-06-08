import type {
	EntityBounds,
	RawTaleRecord,
	SavedReaderProgress,
	StructurePosition,
	Tale,
	TaleBlock,
	TaleBranch,
	TaleContent,
	TaleEntry,
	TaleFragment,
	TaleIndexMap,
	TalePage,
	TalePart,
	TalePath,
} from "~/app/(tale-reader)/_shared/types";

export type {
	RawTaleRecord,
	SavedReaderProgress,
	EntityBounds,
	StructurePosition,
	Tale,
	TaleBlock,
	TaleBranch,
	TaleContent,
	TaleEntry,
	TaleFragment,
	TaleIndexMap,
	TalePage,
	TalePart,
	TalePath,
};

export type TaleData = { progress: SavedReaderProgress | null; tale: Tale };
export type TaleStructure = TaleContent;

export type Block = TaleBlock;
export type Branch = TaleBranch;
export type Entry = TaleEntry;
export type Fragment = TaleFragment;
export type Page = TalePage;
export type Part = TalePart;
export type Path = TalePath;
