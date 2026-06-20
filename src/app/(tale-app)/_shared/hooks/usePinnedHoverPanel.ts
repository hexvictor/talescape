"use client";

import { useState } from "react";

type PinnedHoverPanel = {
	collapse: () => void;
	expanded: boolean;
	hovered: boolean;
	pinned: boolean;
	setHovered: (hovered: boolean) => void;
	togglePinned: () => void;
};

/**
 * Controls an overlay that stays open while pinned or while the pointer is inside it.
 *
 * @param initiallyPinned - Whether the overlay starts pinned open.
 * @returns Pin, hover, and visibility controls for an overlay.
 *
 * @example
 * const panel = usePinnedHoverPanel(true);
 */
export function usePinnedHoverPanel(
	initiallyPinned: boolean,
): PinnedHoverPanel {
	const [hovered, setHovered] = useState(false);
	const [pinned, setPinned] = useState(initiallyPinned);

	return {
		collapse: () => {
			setHovered(false);
			setPinned(false);
		},
		expanded: pinned || hovered,
		hovered,
		pinned,
		setHovered,
		togglePinned: () => setPinned((current) => !current),
	};
}
