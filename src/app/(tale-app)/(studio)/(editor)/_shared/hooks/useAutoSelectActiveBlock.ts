"use client";

import { useEffect } from "react";

/**
 * Selects the active preview block after navigation has settled for a short delay.
 *
 * @param options - Auto-selection configuration.
 * @param options.activeBlockId - Current reader preview block id.
 * @param options.enabled - Whether automatic selection is enabled.
 * @param options.onSelectBlock - Receives the block id to inspect.
 * @returns Nothing.
 *
 * @example
 * useAutoSelectActiveBlock({ activeBlockId, enabled, onSelectBlock });
 */
export function useAutoSelectActiveBlock({
	activeBlockId,
	enabled,
	onSelectBlock,
}: {
	activeBlockId: string | null;
	enabled: boolean;
	onSelectBlock: (blockId: string) => void;
}): void {
	useEffect(() => {
		if (!enabled || !activeBlockId) return;
		const timeout = window.setTimeout(() => {
			onSelectBlock(activeBlockId);
		}, 260);
		return () => window.clearTimeout(timeout);
	}, [activeBlockId, enabled, onSelectBlock]);
}
