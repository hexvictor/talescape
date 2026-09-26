"use client";

import { useEffect } from "react";

/**
 * Selects the active preview block after navigation has settled for a short delay.
 *
 * @param options - Auto-selection configuration.
 * @param options.activeSceneId - Current reader preview block id.
 * @param options.enabled - Whether automatic selection is enabled.
 * @param options.onSelectBlock - Receives the block id to inspect.
 * @returns Nothing.
 *
 * @example
 * useAutoSelectActiveScene({ activeSceneId, enabled, onSelectBlock });
 */
export function useAutoSelectActiveScene({
	activeSceneId,
	enabled,
	onSelectBlock,
}: {
	activeSceneId: string | null;
	enabled: boolean;
	onSelectBlock: (sceneId: string) => void;
}): void {
	useEffect(() => {
		if (!enabled || !activeSceneId) return;
		const timeout = window.setTimeout(() => {
			onSelectBlock(activeSceneId);
		}, 260);
		return () => window.clearTimeout(timeout);
	}, [activeSceneId, enabled, onSelectBlock]);
}
