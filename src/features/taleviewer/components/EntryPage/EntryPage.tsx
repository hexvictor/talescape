import type { BookEntry } from "~/lib/data";
import { entryComponents } from "../entriesTypes/entryComponents";
import React from "react";
import { ChapterEntry } from "../entriesTypes/ChapterEntry";

type EntryPageProps = {
	entry: BookEntry;
};

export function EntryPageComponent({ entry }: EntryPageProps) {
	const EntryComponent = entryComponents[entry.type] || ChapterEntry;
	return <EntryComponent entry={entry} />;
}

const EntryPage = React.memo(EntryPageComponent);
export default EntryPage;
