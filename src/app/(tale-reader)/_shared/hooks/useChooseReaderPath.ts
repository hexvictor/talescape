"use client";

import { useCallback, useEffect, useRef } from "react";
import {
	useReaderStoreInstance,
	useReaderStoreShallow,
} from "../contexts/ReaderStoreContext";
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
	const store = useReaderStoreInstance();
	const state = useReaderStoreShallow((readerState) => ({
		savePosition: readerState.progress.savePosition,
		saveSelectedBranchIds: readerState.progress.setSelectedBranchIds,
		scrollApi: readerState.scroll.api,
		selectedBranchIds: readerState.navigation.selectedBranchIds,
		setScrollCue: readerState.scroll.setCue,
		setPendingRestoreBlockId: readerState.scroll.setPendingRestoreBlockId,
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
			if (path.type === "teleport") {
				state.scrollApi?.scrollToBlock(path.toBlockId, { motion: "travel" });
				return;
			}
			const nextBranchIds = getNextSelectedBranchIds(
				state.tale,
				state.selectedBranchIds,
				path,
			);
			const source = state.tale.indexMap.blocksById[path.fromBlockId];
			const destination = state.tale.indexMap.blocksById[path.toBlockId];
			const direction =
				flowDirection(
					destination?.transition.flow ??
						source?.resolved.flow ?? { direction: "down", type: "linear" },
				) ?? "down";

			state.setScrollCue(direction);
			window.clearTimeout(cueTimerRef.current ?? undefined);
			cueTimerRef.current = window.setTimeout(
				() => state.setScrollCue(null),
				1500,
			);
			if (path.type === "return") {
				state.scrollApi?.scrollToBlock(path.toBlockId, {
					motion: "travel",
					onComplete: () => {
						const current = store.getState();
						current.scroll.setPendingRestoreBlockId(path.toBlockId);
						current.progress.savePosition(path.toBlockId, 0);
						current.navigation.setSelectedBranchIds(nextBranchIds);
						current.progress.setSelectedBranchIds(nextBranchIds);
					},
				});
				return;
			}
			state.setSelectedBranchIds(nextBranchIds);
			state.saveSelectedBranchIds(nextBranchIds);
		},
		[state, store],
	);
}
