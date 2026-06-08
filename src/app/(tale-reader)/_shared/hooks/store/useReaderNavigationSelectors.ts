"use client";

import { useReaderStoreShallow } from "../../contexts/ReaderStoreContext";
import type { TaleReaderState } from "../../store/createReaderStore";
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
	contents: ReaderContentsPart[];
	currentBlockId: string | null;
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
	return useReaderStoreShallow((state) => ({
		branches: state.tale.data.structure.branches,
		contents: state.reader.compiled?.contents ?? EMPTY_READER_CONTENTS,
		currentBlockId: state.navigation.current?.blockId ?? null,
		currentEntryId: state.navigation.current?.entryId ?? null,
		open: state.ui.contentsOpen,
		paths: state.tale.data.structure.paths,
		selectedBranchIds: state.navigation.selectedBranchIds,
		scrollApi: state.scroll.api,
		toggleContents: state.ui.toggleContents,
	}));
}

type EntryNavigatorState = {
	compiled: CompiledReader | null;
	contents: ReaderContentsPart[];
	currentEntryId: string | null;
	currentPageId: string | null;
	currentPartId: string | null;
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
	return useReaderStoreShallow((state) => ({
		compiled: state.reader.compiled,
		contents: state.reader.compiled?.contents ?? EMPTY_READER_CONTENTS,
		currentEntryId: state.navigation.current?.entryId ?? null,
		currentPageId: state.navigation.current?.pageId ?? null,
		currentPartId: state.navigation.current?.partId ?? null,
		scrollApi: state.scroll.api,
	}));
}

type PageNavigatorState = {
	compiled: CompiledReader | null;
	location: ReaderLocation | null;
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
	return useReaderStoreShallow((state) => ({
		compiled: state.reader.compiled,
		location: state.navigation.current,
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
	return useReaderStoreShallow((state) => ({
		activePanel: state.hub.activePanel,
		open: state.hub.open,
		setActivePanel: state.hub.setActivePanel,
		toggleOpen: state.hub.toggleOpen,
	}));
}
