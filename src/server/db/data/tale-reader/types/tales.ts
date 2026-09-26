import type {
	EntityBounds,
	RawTaleRecord,
	SavedReaderProgress,
	StructurePosition,
	Tale,
	TaleBranch,
	TaleContent,
	TaleElement,
	TaleEntry,
	TaleIndexMap,
	TalePage,
	TalePart,
	TalePath,
	TaleScene,
} from "~/app/(tale-app)/_shared/types";

export type {
	RawTaleRecord,
	SavedReaderProgress,
	EntityBounds,
	StructurePosition,
	Tale,
	TaleScene,
	TaleBranch,
	TaleContent,
	TaleEntry,
	TaleElement,
	TaleIndexMap,
	TalePage,
	TalePart,
	TalePath,
};

export type TaleData = { progress: SavedReaderProgress | null; tale: Tale };
export type TaleStructure = TaleContent;

export type Scene = TaleScene;
export type Branch = TaleBranch;
export type Entry = TaleEntry;
export type Fragment = TaleElement;
export type Page = TalePage;
export type Part = TalePart;
export type Path = TalePath;
