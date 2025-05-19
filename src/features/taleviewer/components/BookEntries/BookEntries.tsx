import type { BookEntry } from "~/lib/data";
import { EntryPage } from "../EntryPage";
import React from "react";

interface BookEntriesProps {
	bookEntries: BookEntry[];
}

const BookEntriesComponent = ({ bookEntries }: BookEntriesProps) => {
	return (
		<>
			{bookEntries.map((entry) => (
				<EntryPage key={entry.id} entry={entry} />
			))}
		</>
	);
};

export default React.memo(BookEntriesComponent);
