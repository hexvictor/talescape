"use client";
import { useEffect } from "react";
import { BookEntries } from "~/features/taleviewer/components/BookEntries";
import { EntryNavigator } from "~/features/taleviewer/components/EntryNavigator";
import { EntryPage } from "~/features/taleviewer/components/EntryPage";
import PageNavigator from "~/features/taleviewer/components/PageNavigator/PageNavigator";
import PageProgressBar from "~/features/taleviewer/components/PageProgressBar/PageProgressBar";
import { ScrollIndicator } from "~/features/taleviewer/components/ScrollIndicator";
import { UiToggleButton } from "~/features/taleviewer/components/UiToggleButton/UiToggleButton";
import { useScrollNavigation } from "~/hooks/useScrollNavigation";
import { useScrollToHash } from "~/hooks/useScrollToHash";
import { bookEntries } from "~/lib/data";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

function StoryView() {
	const { scrollToEntry, scrollToPage } = useScrollNavigation();

	return (
		<div className="relative flex h-[2000px] flex-col">
			<PageProgressBar />
			<EntryNavigator
				entries={bookEntries}
				scrollToEntryAction={scrollToEntry}
			/>
			<PageNavigator
				scrollToPageAction={scrollToPage}
				scrollToEntryAction={scrollToEntry}
			/>
			<UiToggleButton />
			{/* Entries and Pages */}
			<BookEntries bookEntries={bookEntries} />
		</div>
	);
}

export default StoryView;
