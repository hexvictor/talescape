"use client";

import { useContentsNavigatorState } from "../../../hooks/store/useReaderNavigationSelectors";
import { useChooseReaderPath } from "../../../hooks/useChooseReaderPath";
import {
	ContentsTree,
	RoutesPanel,
} from "../ContentsNavigator/ContentsNavigatorPanels";

/**
 * Renders route-aware contents inside the Reader Hub.
 *
 * @returns Reader contents panel.
 *
 * @example
 * <ReaderHubContents />
 */
export function ReaderHubContents(): React.JSX.Element {
	const { contents, currentBlockId, currentEntryId, scrollApi } =
		useContentsNavigatorState();

	const travelToBlock = (blockId: string): void => {
		scrollApi?.capturePosition();
		scrollApi?.scrollToBlock(blockId, { motion: "travel" });
	};

	return (
		<div
			data-reader-component="ReaderHubContents"
			data-reader-role="contents-panel"
		>
			<ContentsTree
				contents={contents}
				currentBlockId={currentBlockId}
				currentEntryId={currentEntryId}
				onNavigate={travelToBlock}
			/>
		</div>
	);
}

/**
 * Renders branch and path controls inside the Reader Hub.
 *
 * @returns Reader routes panel.
 *
 * @example
 * <ReaderHubRoutes />
 */
export function ReaderHubRoutes(): React.JSX.Element {
	const { branches, paths, selectedBranchIds } = useContentsNavigatorState();
	const choosePath = useChooseReaderPath();

	return (
		<div
			data-reader-component="ReaderHubRoutes"
			data-reader-role="routes-panel"
		>
			<RoutesPanel
				branches={branches}
				onChoosePath={choosePath}
				paths={paths}
				selectedBranchIds={selectedBranchIds}
			/>
		</div>
	);
}
