"use client";
import { useEffect } from "react";
import { CoverPage } from "~/features/taleviewer/components/CoverPage";
import { EntryNavigator } from "~/features/taleviewer/components/EntryNavigator";
import { EntryPage } from "~/features/taleviewer/components/EntryPage";
import PageNavigator from "~/features/taleviewer/components/PageNavigator/PageNavigator";
import PageProgressBar from "~/features/taleviewer/components/PageProgressBar/PageProgressBar";
import { ScrollIndicator } from "~/features/taleviewer/components/ScrollIndicator";
import { UiToggleButton } from "~/features/taleviewer/components/UiToggleButton/UiToggleButton";
import { useScrollNavigation } from "~/hooks/useScrollNavigation";
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
			{/* <CoverPage>
				div. Story
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className="bg-purple-500"
				>
					Story
				</motion.div>
			</CoverPage> */}
			{/* Entries and Pages */}
			{bookEntries.map((entry) => (
				<EntryPage key={entry.id} entry={entry} />
			))}
		</div>
	);
}

export default StoryView;
