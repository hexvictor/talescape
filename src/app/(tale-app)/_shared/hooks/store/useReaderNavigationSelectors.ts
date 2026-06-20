"use client";

import { useTaleStoreShallow } from "../../contexts/TaleStoreContext";
import type { TaleReaderState } from "../../store/createTaleStore";
import type {
	CompiledReader,
	ReaderContentsPart,
	ReaderLocation,
	Tale,
} from "../../types";

const EMPTY_READER_CONTENTS: ReaderContentsPart[] = [];

type ReaderScrollApi = TaleReaderState["scroll"]["api"];

type ContentsNavigatorState = {
	branches: Tale["structure"]["branches"];
	compiled: CompiledReader | null;
	contents: ReaderContentsPart[];
	currentBlockId: string | null;
	currentBranchId: string | null;
	currentEntryId: string | null;
	open: boolean;
	paths: Tale["structure"]["paths"];
	selectedBranchIds: string[];
	scrollApi: ReaderScrollApi;
	toggleContents: TaleReaderState["ui"]["toggleContents"];
};

/**
 * Selects state required by the contents navigator.
 *
 * @returns Stable contents navigator state.
 *
 * @example
 * const { contents, open } = useContentsNavigatorState();
 */
export function useContentsNavigatorState(): ContentsNavigatorState {
	return useTaleStoreShallow((state) => ({
		branches: state.tale.data.structure.branches,
		compiled: state.reader.compiled,
		contents: state.reader.compiled?.contents ?? EMPTY_READER_CONTENTS,
		currentBlockId: state.navigation.current?.blockId ?? null,
		currentBranchId: state.navigation.current?.branchId ?? null,
		currentEntryId: state.navigation.current?.entryId ?? null,
		open: state.ui.contentsOpen,
		paths: state.tale.data.structure.paths,
		selectedBranchIds: state.navigation.selectedBranchIds,
		scrollApi: state.scroll.api,
		toggleContents: state.ui.toggleContents,
	}));
}

type EntryNavigatorState = {
	activityFadeDelaySeconds: number;
	compiled: CompiledReader | null;
	contents: ReaderContentsPart[];
	currentEntryId: string | null;
	currentPageId: string | null;
	currentPartId: string | null;
	navigationPinsVisible: boolean;
	navigationUsesSelectedPart: boolean;
	reduceInactiveUiOpacity: boolean;
	scrollApi: ReaderScrollApi;
};

/**
 * Selects state required by the entry navigator.
 *
 * @returns Stable entry navigator state.
 *
 * @example
 * const { contents, currentEntryId } = useEntryNavigatorState();
 */
export function useEntryNavigatorState(): EntryNavigatorState {
	return useTaleStoreShallow((state) => ({
		activityFadeDelaySeconds: state.ui.activityFadeDelaySeconds,
		compiled: state.reader.compiled,
		contents: state.reader.compiled?.contents ?? EMPTY_READER_CONTENTS,
		currentEntryId: state.navigation.current?.entryId ?? null,
		currentPageId: state.navigation.current?.pageId ?? null,
		currentPartId: state.navigation.current?.partId ?? null,
		navigationPinsVisible: state.ui.navigationPinsVisible,
		navigationUsesSelectedPart: state.ui.navigationUsesSelectedPart,
		reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
		scrollApi: state.scroll.api,
	}));
}

type PageNavigatorState = {
	activityFadeDelaySeconds: number;
	compiled: CompiledReader | null;
	location: ReaderLocation | null;
	navigationPinsVisible: boolean;
	reduceInactiveUiOpacity: boolean;
	scrollApi: ReaderScrollApi;
};

/**
 * Selects state required by the page navigator.
 *
 * @returns Stable page navigator state.
 *
 * @example
 * const { compiled, location } = usePageNavigatorState();
 */
export function usePageNavigatorState(): PageNavigatorState {
	return useTaleStoreShallow((state) => ({
		activityFadeDelaySeconds: state.ui.activityFadeDelaySeconds,
		compiled: state.reader.compiled,
		location: state.navigation.current,
		navigationPinsVisible: state.ui.navigationPinsVisible,
		reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
		scrollApi: state.scroll.api,
	}));
}

type ReaderHubState = {
	activePanel: TaleReaderState["hub"]["activePanel"];
	open: boolean;
	setActivePanel: TaleReaderState["hub"]["setActivePanel"];
	toggleOpen: TaleReaderState["hub"]["toggleOpen"];
};

/**
 * Selects state required by the reader hub shell.
 *
 * @returns Stable reader hub state.
 *
 * @example
 * const { activePanel, open } = useReaderHubState();
 */
export function useReaderHubState(): ReaderHubState {
	return useTaleStoreShallow((state) => ({
		activePanel: state.hub.activePanel,
		open: state.hub.open,
		setActivePanel: state.hub.setActivePanel,
		toggleOpen: state.hub.toggleOpen,
	}));
}

export type ReaderHubSettingsState = Pick<
	TaleReaderState["ui"],
	| "activityFadeDelaySeconds"
	| "debugVisible"
	| "navigationPinsVisible"
	| "navigationUsesSelectedPart"
	| "readerStatusVisible"
	| "reduceInactiveUiOpacity"
	| "setActivityFadeDelaySeconds"
	| "setDebugVisible"
	| "setNavigationPinsVisible"
	| "setNavigationUsesSelectedPart"
	| "setReaderStatusVisible"
	| "setReduceInactiveUiOpacity"
>;

/**
 * Selects the reader preferences displayed by the Reader Hub settings panel.
 *
 * @returns Stable flat settings values and update actions.
 *
 * @example
 * const { debugVisible, setDebugVisible } = useReaderHubSettingsState();
 */
export function useReaderHubSettingsState(): ReaderHubSettingsState {
	return useTaleStoreShallow((state) => ({
		activityFadeDelaySeconds: state.ui.activityFadeDelaySeconds,
		debugVisible: state.ui.debugVisible,
		navigationPinsVisible: state.ui.navigationPinsVisible,
		navigationUsesSelectedPart: state.ui.navigationUsesSelectedPart,
		readerStatusVisible: state.ui.readerStatusVisible,
		reduceInactiveUiOpacity: state.ui.reduceInactiveUiOpacity,
		setActivityFadeDelaySeconds: state.ui.setActivityFadeDelaySeconds,
		setDebugVisible: state.ui.setDebugVisible,
		setNavigationPinsVisible: state.ui.setNavigationPinsVisible,
		setNavigationUsesSelectedPart: state.ui.setNavigationUsesSelectedPart,
		setReaderStatusVisible: state.ui.setReaderStatusVisible,
		setReduceInactiveUiOpacity: state.ui.setReduceInactiveUiOpacity,
	}));
}
