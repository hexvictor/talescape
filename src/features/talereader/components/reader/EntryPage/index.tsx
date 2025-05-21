import type { BookEntry } from "~/lib/data";
import React from "react";
import { ChapterEntry, entryComponents } from "../../entries";

type EntryPageProps = {
	entry: BookEntry;
};

export function EntryPageComponent({ entry }: EntryPageProps) {
	const EntryComponent = entryComponents[entry.type] || ChapterEntry;
	return <EntryComponent entry={entry} />;
}

const EntryPage = React.memo(EntryPageComponent);
export default EntryPage;
