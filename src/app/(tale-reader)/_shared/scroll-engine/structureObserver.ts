"use client";

import type { RefObject } from "react";

type Args = {
	wrapperRef: RefObject<HTMLElement | null>;
	onResize: () => void;
};

/**
 * Watches the DOM elements that can change the scroll map.
 *
 * Pinned sections and their tracks determine ScrollTrigger distances, so the
 * engine observes those nodes after each layout pass and asks for a rebuild
 * when their measured size changes.
 */
export function createReaderStructureObserver({ wrapperRef, onResize }: Args) {
	let resizeObserver: ResizeObserver | null =
		typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;

	/**
	 * Rebinds the resize observer to the currently mounted reader structure.
	 *
	 * Branch choices can replace sections, so the observer must be rebound after
	 * the DOM settles instead of assuming the first set of nodes is permanent.
	 */
	const observeStructureElements = () => {
		resizeObserver?.disconnect();

		const observedElements =
			wrapperRef.current?.querySelectorAll<HTMLElement>(
				".pinned-section, .scroll-track",
			) ?? [];

		for (const element of observedElements) {
			resizeObserver?.observe(element);
		}
	};

	/**
	 * Stops resize observation during unmount so old DOM nodes cannot request
	 * layout work after the reader has been destroyed.
	 */
	const cleanup = () => {
		resizeObserver?.disconnect();
		resizeObserver = null;
	};

	return {
		observeStructureElements,
		cleanup,
	};
}
