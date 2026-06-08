"use client";

import { useReaderStore } from "../contexts/ReaderStoreContext";
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
	const anchor = useReaderStore((state) => state.navigation.currentAnchor);
	const location = useReaderStore((state) => state.navigation.current);

	return {
		block: anchor?.block ?? null,
		branch: anchor?.branch ?? null,
		entry: anchor?.entry ?? null,
		location,
		page: anchor?.page ?? null,
		part: anchor?.part ?? null,
	};
}
