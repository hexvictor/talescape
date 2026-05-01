"use client";

import { ReaderStoreProvider } from "~/features/tale-reader/contexts/ReaderStoreContext";
import type { Tale } from "~/server/db/data/tale-reader/types/tales";
import type { ReaderProgressSchema } from "~/server/db/schema";
import ReaderHub from "../ReaderShell/ReaderHub";
import ReaderViewport from "../ReaderShell/ReaderViewport";
import { ContentsNavigator } from "../ReaderUi/ContentsNavigator";
import EntryNavigator from "../ReaderUi/EntryNavigator/EntryNavigator";
import ReaderProgress from "../ReaderUi/ReaderProgress";
import ReaderUiToggle from "../ReaderUi/ReaderUiToggle";
import TaleDebug from "../ReaderUi/TaleDebug";
import LoadingTale from "../TaleFeedback/LoadingTale";
import ReaderRebuildOverlay from "../TaleFeedback/ReaderRebuildOverlay";

type TaleReaderProps = {
	tale: Tale;
	progress: ReaderProgressSchema | null;
};

export default function TaleReader({ tale, progress }: TaleReaderProps) {
	return (
		<ReaderStoreProvider initialTale={tale} initialProgress={progress}>
			<LoadingTale>
				<div className="relative flex flex-col overflow-hidden">
					<div className="pointer-events-none fixed top-0 left-0 z-30 h-screen w-screen">
						<div className="pointer-events-none relative h-full w-full">
							<TaleDebug />
							<ContentsNavigator />
							<ReaderProgress />
							<EntryNavigator />
							<ReaderUiToggle />
						</div>
					</div>

					<ReaderViewport />
					<ReaderHub />
					<ReaderRebuildOverlay />
				</div>
			</LoadingTale>
		</ReaderStoreProvider>
	);
}
