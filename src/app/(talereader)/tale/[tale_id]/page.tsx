"use client";
import {
	BookEntries,
	EntryNavigator,
	PageNavigator,
	ReaderUiToggle,
	TaleProgress,
} from "~/features/talereader/components/reader";
import { useScrollNavigation } from "~/hooks/useScrollNavigation";
import { bookEntries } from "~/lib/data";

function StoryView() {
	const { scrollToEntry, scrollToPage } = useScrollNavigation();

	return (
		<div className="relative flex h-[2000px] flex-col">
			<TaleProgress />
			<EntryNavigator
				entries={bookEntries}
				scrollToEntryAction={scrollToEntry}
			/>
			<PageNavigator
				scrollToPageAction={scrollToPage}
				scrollToEntryAction={scrollToEntry}
			/>
			<ReaderUiToggle />
			{/* Entries and Pages */}
			<BookEntries bookEntries={bookEntries} />
		</div>
	);
}

export default StoryView;
