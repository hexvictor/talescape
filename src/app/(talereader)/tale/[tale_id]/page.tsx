"use client";
import {
	BookEntries,
	ContentsNavigator,
	EntryNavigator,
	PageNavigator,
	ReaderUiToggle,
	TaleProgress,
} from "~/features/talereader/components/reader";
import { TaleReaderProvider } from "~/features/talereader/contexts/TaleReaderContext";
import { useScrollNavigation } from "~/hooks/useScrollNavigation";
import { bookEntries } from "~/lib/data";

function StoryView() {
	return (
		<TaleReaderProvider>
			<div className="relative flex h-[2000px] flex-col">
				<ContentsNavigator />
				<TaleProgress />
				<EntryNavigator />
				<PageNavigator />
				<ReaderUiToggle />
				<BookEntries />
			</div>
		</TaleReaderProvider>
	);
}

export default StoryView;
