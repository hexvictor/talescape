import type { BookEntry } from "~/lib/data";
import React from "react";
import EntryPage from "../EntryPage";

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
