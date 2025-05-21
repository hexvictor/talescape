import type { BookEntry, EntryType } from "~/lib/data";
import CoverEntry from "./CoverEntry";
import type { FC } from "react";
import ChapterEntry from "./ChapterEntry";

type EntryComponent = FC<{ entry: BookEntry }>;

const entryComponents: Record<EntryType, EntryComponent> = {
	cover: CoverEntry,
	prologue: ChapterEntry,
	epilogue: ChapterEntry,
	chapter: ChapterEntry,
	timeline: ChapterEntry,
	codex: ChapterEntry,
	flashback: ChapterEntry,
	quote: ChapterEntry,
	dream: ChapterEntry,
	letter: ChapterEntry,
	interlude: ChapterEntry,
	map: ChapterEntry,
	table_of_contents: ChapterEntry,
	vocabulary: ChapterEntry,
	appendix: ChapterEntry,
	poem: ChapterEntry,
	note: ChapterEntry,
	unknown: ChapterEntry,
};
export default entryComponents;
