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
	const allAnimatedFragmentIds = new Set(
		[...plan.animatedFragmentIdsByBlockId.values()].flat(),
	);
	const animatedOwnerBlockIds = new Set(
		[...plan.animatedBlockIds].concat(
			...[...plan.animatedFragmentIdsByBlockId.entries()].flatMap(
				([blockId, fragmentIds]) => (fragmentIds.length > 0 ? [blockId] : []),
			),
			...[...plan.animatedNodeIdsByBlockId.entries()].flatMap(
				([blockId, nodeIds]) => (nodeIds.length > 0 ? [blockId] : []),
			),
		),
	);

	return {
		update(activeAnchors, reduced, reason): void {
			const revision = registry.getRevision();
			const key = `${reduced}:${activeAnchors
				.map((anchor) => anchor.block.id)
				.join(",")}`;
			if (key === previousKey && revision === previousRevision) return;
			previousKey = key;
			previousRevision = revision;

			const activeBlockIds = new Set(
				activeAnchors.map((anchor) => anchor.block.id),
			);
			const animatedBlockIds = activeAnchors.flatMap((anchor) =>
				animatedOwnerBlockIds.has(anchor.block.id) ? [anchor.block.id] : [],
			);
			const animatedFragmentIds = activeAnchors.flatMap(
				(anchor) =>
					plan.animatedFragmentIdsByBlockId.get(anchor.block.id) ?? [],
			);
			const activeFragmentIds = new Set(animatedFragmentIds);

			for (const [blockId, element] of registry.blockElementById) {
				const isActive = activeBlockIds.has(blockId);
				const hasAnimation = animatedOwnerBlockIds.has(blockId);
				element.dataset.readerAnimationState = !isActive
					? "offscreen"
					: !hasAnimation
						? "none"
						: reduced
							? "reduced"
							: "playing";
			}
			for (const [fragmentId, element] of registry.fragmentElementById) {
				if (!allAnimatedFragmentIds.has(fragmentId)) {
					element.dataset.readerAnimationState = "none";
					continue;
				}
				element.dataset.readerAnimationState = !activeFragmentIds.has(
					fragmentId,
				)
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
					blocks: animatedBlockIds,
					blockAnimationsPlaying: reduced
						? []
						: animatedBlockIds.filter((blockId) =>
								plan.animatedBlockIds.has(blockId),
							),
					blockAnimationsReduced: reduced ? animatedBlockIds : [],
					fragments: animatedFragmentIds,
					fragmentsBlocked: reduced ? animatedFragmentIds : [],
					reason,
				},
			);
		},
	};
}
