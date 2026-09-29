import type { ReaderAnimationPlan } from "../services/readerAnimations";
import {
	areReaderDiagnosticsEnabled,
	logReaderDiagnostic,
} from "../services/readerDiagnostics";
import type { Anchor } from "../types";
import type { ReaderDomRegistry } from "./readerDomRegistry";

export type ReaderAnimationMonitor = {
	update: (
		activeAnchors: readonly Anchor[],
		reduced: boolean,
		reason: "fast-scroll" | "full",
	) => void;
};

/**
 * Applies inspectable animation-state flags and reports animation set changes.
 *
 * @param registry - Direct references to mounted reader DOM elements.
 * @param plan - Compiled animation ownership indexes.
 * @returns Cached monitor updated by the reader frame loop.
 *
 * @example
 * const monitor = createReaderAnimationMonitor(registry, animationPlan);
 * monitor.update(visibleAnchors, false, "full");
 */
export function createReaderAnimationMonitor(
	registry: ReaderDomRegistry,
	plan: ReaderAnimationPlan,
): ReaderAnimationMonitor {
	let previousKey = "";
	let previousRevision = -1;
	const allAnimatedElementIds = new Set(
		[...plan.animatedElementIdsBySceneId.values()].flat(),
	);
	const animatedOwnerSceneIds = new Set(
		[...plan.animatedSceneIds].concat(
			...[...plan.animatedElementIdsBySceneId.entries()].flatMap(
				([sceneId, elementIds]) => (elementIds.length > 0 ? [sceneId] : []),
			),
			...[...plan.animatedFrameIdsBySceneId.entries()].flatMap(
				([sceneId, frameIds]) => (frameIds.length > 0 ? [sceneId] : []),
			),
		),
	);

	return {
		update(activeAnchors, reduced, reason): void {
			const revision = registry.getRevision();
			const key = `${reduced}:${activeAnchors
				.map((anchor) => anchor.sceneId)
				.join(",")}`;
			if (key === previousKey && revision === previousRevision) return;
			previousKey = key;
			previousRevision = revision;

			const activeSceneIds = new Set(
				activeAnchors.map((anchor) => anchor.sceneId),
			);
			const animatedSceneIds = activeAnchors.flatMap((anchor) =>
				animatedOwnerSceneIds.has(anchor.sceneId) ? [anchor.sceneId] : [],
			);
			const animatedElementIds = activeAnchors.flatMap(
				(anchor) => plan.animatedElementIdsBySceneId.get(anchor.sceneId) ?? [],
			);
			const activeElementIds = new Set(animatedElementIds);

			for (const [sceneId, element] of registry.sceneElementById) {
				const isActive = activeSceneIds.has(sceneId);
				const hasAnimation = animatedOwnerSceneIds.has(sceneId);
				element.dataset.readerAnimationState = !isActive
					? "offscreen"
					: !hasAnimation
						? "none"
						: reduced
							? "reduced"
							: "playing";
			}
			for (const [elementId, element] of registry.elementById) {
				if (!allAnimatedElementIds.has(elementId)) {
					element.dataset.readerAnimationState = "none";
					continue;
				}
				element.dataset.readerAnimationState = !activeElementIds.has(elementId)
					? "offscreen"
					: reduced
						? "blocked-fast-scroll"
						: "playing";
			}

			if (!areReaderDiagnosticsEnabled()) return;
			logReaderDiagnostic(
				reduced
					? "animations reduced during fast scroll"
					: "active animations changed",
				{
					scenes: animatedSceneIds,
					blockAnimationsPlaying: reduced
						? []
						: animatedSceneIds.filter((sceneId) =>
								plan.animatedSceneIds.has(sceneId),
							),
					blockAnimationsReduced: reduced ? animatedSceneIds : [],
					fragments: animatedElementIds,
					fragmentsBlocked: reduced ? animatedElementIds : [],
					reason,
				},
			);
		},
	};
}
