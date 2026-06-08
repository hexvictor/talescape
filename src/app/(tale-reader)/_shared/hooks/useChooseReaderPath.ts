"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReaderStoreShallow } from "../contexts/ReaderStoreContext";
import { getNextSelectedBranchIds } from "../services/navigation";
import { flowDirection } from "../services/readerGeometry";
import type { TalePath } from "../types";

/**
 * Selects a route without moving the reader camera to the route destination.
 *
 * @returns A callback that applies a selected path and displays its scroll cue.
 *
 * @example
 * const choosePath = useChooseReaderPath();
 */
export function useChooseReaderPath(): (path: TalePath) => void {
	const cueTimerRef = useRef<number | null>(null);
	const state = useReaderStoreShallow((readerState) => ({
		saveSelectedBranchIds: readerState.progress.setSelectedBranchIds,
		scrollApi: readerState.scroll.api,
		selectedBranchIds: readerState.navigation.selectedBranchIds,
		setScrollCue: readerState.scroll.setCue,
		setSelectedBranchIds: readerState.navigation.setSelectedBranchIds,
		tale: readerState.tale.data,
	}));

	useEffect(
		() => () => window.clearTimeout(cueTimerRef.current ?? undefined),
		[],
	);

	return useCallback(
		(path: TalePath): void => {
			state.scrollApi?.capturePosition();
			const nextBranchIds = getNextSelectedBranchIds(
				state.tale,
				state.selectedBranchIds,
				path,
			);
			const source = state.tale.indexMap.blocksById[path.fromBlockId];
			const direction = source
				? (flowDirection(source.resolved.flow) ?? "down")
				: "down";

			state.setScrollCue(direction);
			window.clearTimeout(cueTimerRef.current ?? undefined);
			cueTimerRef.current = window.setTimeout(
				() => state.setScrollCue(null),
				1500,
			);
			state.setSelectedBranchIds(nextBranchIds);
			state.saveSelectedBranchIds(nextBranchIds);
			if (path.type === "return") {
				state.scrollApi?.scrollToBlock(path.toBlockId);
			}
		},
		[state],
	);
}
