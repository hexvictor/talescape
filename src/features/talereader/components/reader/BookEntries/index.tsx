import { bookEntries, type BookEntry } from "~/lib/data";
import React from "react";
import EntryPage from "../EntryPage";

const BookEntriesComponent = () => {
	return (
		<>
			{bookEntries.map((entry) => (
				<EntryPage key={entry.id} entry={entry} />
			))}
		</>
	);
};

export default React.memo(BookEntriesComponent);
