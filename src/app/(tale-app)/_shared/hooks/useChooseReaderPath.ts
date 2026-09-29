"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTaleAppStore } from "../contexts/TaleAppStoreContext";
import {
	useTaleReaderStoreInstance,
	useTaleReaderStoreShallow,
} from "../contexts/TaleReaderStoreContext";
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
	const store = useTaleReaderStoreInstance();
	const tale = useTaleAppStore((document) => document.document.tale);
	const state = useTaleReaderStoreShallow((readerState) => ({
		savePosition: readerState.progress.savePosition,
		saveSelectedBranchIds: readerState.progress.setSelectedBranchIds,
		scrollApi: readerState.scroll.api,
		selectedBranchIds: readerState.navigation.selectedBranchIds,
		setScrollCue: readerState.scroll.setCue,
		setPendingRestoreSceneId: readerState.scroll.setPendingRestoreSceneId,
		setPendingRestoreKeyframeId: readerState.scroll.setPendingRestoreKeyframeId,
		setSelectedBranchIds: readerState.navigation.setSelectedBranchIds,
	}));

	useEffect(
		() => () => window.clearTimeout(cueTimerRef.current ?? undefined),
		[],
	);

	return useCallback(
		(path: TalePath): void => {
			state.scrollApi?.capturePosition();
			if (path.type === "teleport") {
				if (path.toKeyframeId) {
					state.scrollApi?.scrollToKeyframe(path.toKeyframeId, { motion: "travel" });
				} else {
					state.scrollApi?.scrollToScene(path.toSceneId, { motion: "travel" });
				}
				return;
			}
			const nextBranchIds = getNextSelectedBranchIds(
				tale,
				state.selectedBranchIds,
				path,
			);
			const source = tale.indexMap.scenesById[path.fromSceneId];
			const destination = tale.indexMap.scenesById[path.toSceneId];
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
				const travel = path.toKeyframeId
					? state.scrollApi?.scrollToKeyframe
					: state.scrollApi?.scrollToScene;
				travel?.(path.toKeyframeId ?? path.toSceneId, {
					motion: "travel",
					onComplete: () => {
						const current = store.getState();
						const destinationKeyframeId =
							path.toKeyframeId ??
							destination?.keyframeIds[0] ??
							`${path.toSceneId}:default-keyframe`;
						current.scroll.setPendingRestoreSceneId(path.toSceneId);
						current.progress.savePosition(path.toSceneId, destinationKeyframeId, 0);
						current.navigation.setSelectedBranchIds(nextBranchIds);
						current.progress.setSelectedBranchIds(nextBranchIds);
					},
				});
				return;
			}
			// The selected route can remove the currently visible destination scene.
			// Restore from the choice source so recompilation replaces only its future.
			state.setPendingRestoreSceneId(path.fromSceneId);
			state.setPendingRestoreKeyframeId(path.fromKeyframeId);
			state.setSelectedBranchIds(nextBranchIds);
			state.saveSelectedBranchIds(nextBranchIds);
		},
		[state, store, tale],
	);
}
