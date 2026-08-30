"use client";

import { useTaleAppStore } from "../contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "../contexts/TaleReaderStoreContext";
import type {
	ReaderLocation,
	ResolvedTaleBlock,
	TaleBranch,
	TaleEntry,
	TalePage,
	TalePart,
} from "../types";

type ReaderLocationContext = {
	block: ResolvedTaleBlock | null;
	branch: TaleBranch | null;
	entry: TaleEntry | null;
	location: ReaderLocation | null;
	page: TalePage | null;
	part: TalePart | null;
};

/**
 * Reads the current location entities already resolved by the scroll engine.
 *
 * @returns Current location plus block, branch, page, entry, and part.
 *
 * @example
 * const { block, page, entry } = useReaderLocationContext();
 */
export function useReaderLocationContext(): ReaderLocationContext {
	const anchor = useTaleReaderStore((state) => state.navigation.currentAnchor);
	const location = useTaleReaderStore((state) => state.navigation.current);
	const tale = useTaleAppStore((state) => state.document.tale);

	return {
		block: anchor ? (tale.indexMap.blocksById[anchor.blockId] ?? null) : null,
		branch: anchor
			? (tale.indexMap.branchesById[anchor.branchId] ?? null)
			: null,
		entry: anchor ? (tale.indexMap.entriesById[anchor.entryId] ?? null) : null,
		location,
		page: anchor ? (tale.indexMap.pagesById[anchor.pageId] ?? null) : null,
		part: anchor ? (tale.indexMap.partsById[anchor.partId] ?? null) : null,
	};
}
