import * as motion from "motion/react-client";
import React from "react";
import { CoverPage } from "~/features/taleviewer/components/CoverPage";
import { EntryNavigator } from "~/features/taleviewer/components/EntryNavigator";
import PageNavigator from "~/features/taleviewer/components/PageNavigator/PageNavigator";
import PageProgressBar from "~/features/taleviewer/components/PageProgressBar/PageProgressBar";
import { ScrollIndicator } from "~/features/taleviewer/components/ScrollIndicator";
import { UiToggleButton } from "~/features/taleviewer/components/UiToggleButton/UiToggleButton";
import { bookEntries } from "~/lib/data";

function StoryView() {
	return (
		<div className="relative h-[2000px]">
			<PageProgressBar />
			<EntryNavigator entries={bookEntries} />
			<PageNavigator />
			<UiToggleButton />
			<CoverPage>
				div. Story
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className="bg-purple-500"
				>
					Story
				</motion.div>
				<ScrollIndicator />
			</CoverPage>
		</div>
	);
}

export default StoryView;
