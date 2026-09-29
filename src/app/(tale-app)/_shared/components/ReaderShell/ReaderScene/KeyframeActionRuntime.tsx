"use client";

import { useEffect } from "react";
import { useTaleAppStore } from "../../../contexts/TaleAppStoreContext";
import { useTaleReaderStore } from "../../../contexts/TaleReaderStoreContext";
import { resolveTaleBreakpoint } from "../../../services/resolveTaleBreakpoint";

export function KeyframeActionRuntime({
	root,
	sceneId,
}: { root: HTMLElement | null; sceneId: string }): null {
	const location = useTaleReaderStore((state) => state.navigation.current);
	const compiled = useTaleReaderStore((state) => state.reader.compiled);
	const base = useTaleAppStore((state) => state.document.tale);
	const breakpointId = useTaleAppStore((state) => state.runtime.breakpointId);
	useEffect(() => {
		if (!root) return;
		const tale = resolveTaleBreakpoint(base, breakpointId);
		const segment = location
			? compiled?.segments[location.segmentIndex]
			: undefined;
		const keyframe =
			segment && segment.type !== "transition" && segment.sceneId === sceneId
				? tale.indexMap.keyframesById[segment.keyframeId]
				: undefined;
		for (const media of root.querySelectorAll<HTMLMediaElement>(
			"audio,video",
		)) {
			const id = media.closest<HTMLElement>("[data-reader-element-id]")?.dataset
				.readerElementId;
			const action = keyframe?.actions.find(
				(item) => item.targetType === "element" && item.targetId === id,
			);
			if (action?.type === "play") {
				media.currentTime = 0;
				void media.play().catch(() => undefined);
			} else if (action?.type === "continue") {
				if (media.paused && !media.ended)
					void media.play().catch(() => undefined);
			} else {
				media.pause();
				if (action?.type === "stop" || !action || action.type === "inactive")
					media.currentTime = 0;
			}
		}
	}, [base, breakpointId, compiled, location, root, sceneId]);
	useEffect(
		() => () => {
			for (const media of root?.querySelectorAll<HTMLMediaElement>(
				"audio,video",
			) ?? [])
				media.pause();
		},
		[root],
	);
	return null;
}
