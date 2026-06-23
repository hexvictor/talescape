"use client";

import { useEffect, useRef } from "react";
import {
	useTaleReaderStore,
	useTaleReaderStoreInstance,
} from "../contexts/TaleReaderStoreContext";

const resizeDebounceMs = 180;

type ViewportSizeOptions = {
	maximumRightInsetPx?: number;
	rightInsetRatio?: number;
	root?: HTMLElement | null;
};

/**
 * Tracks the usable reader viewport after accounting for persistent side UI and
 * persists the derived viewport and layout in the reader store.
 *
 * @param options - Optional right-side inset constraints.
 * @returns The debounced usable viewport dimensions.
 *
 * @example
 * const viewport = useViewportSize({ maximumRightInsetPx: 448, rightInsetRatio: 0.42 });
 */
export function useViewportSize(options: ViewportSizeOptions = {}) {
	const setViewportSize = useTaleReaderStore((state) => state.ui.setViewportSize);
	const size = useTaleReaderStore((state) => state.ui.viewport);
	const store = useTaleReaderStoreInstance();
	const timerRef = useRef<number | null>(null);
	const maximumRightInsetPx = options.maximumRightInsetPx ?? 0;
	const rightInsetRatio = options.rightInsetRatio ?? 0;
	const root = options.root ?? null;

	useEffect(() => {
		const update = () => {
			const sourceWidth = root?.clientWidth ?? window.innerWidth;
			const sourceHeight = root?.clientHeight ?? window.innerHeight;
			const rightInset = Math.min(
				maximumRightInsetPx,
				sourceWidth * rightInsetRatio,
			);
			const nextViewport = {
				height: sourceHeight,
				width: Math.max(1, sourceWidth - rightInset),
			};
			const current = store.getState().ui;
			if (
				current.viewport.width === nextViewport.width &&
				current.viewport.height === nextViewport.height
			) {
				return;
			}
			setViewportSize(nextViewport);
		};
		const debouncedUpdate = () => {
			window.clearTimeout(timerRef.current ?? undefined);
			timerRef.current = window.setTimeout(update, resizeDebounceMs);
		};

		update();
		const observer =
			root && "ResizeObserver" in window
				? new ResizeObserver(debouncedUpdate)
				: null;
		if (root && observer) observer.observe(root);
		window.addEventListener("resize", debouncedUpdate);
		return () => {
			observer?.disconnect();
			window.removeEventListener("resize", debouncedUpdate);
			window.clearTimeout(timerRef.current ?? undefined);
		};
	}, [maximumRightInsetPx, rightInsetRatio, root, setViewportSize, store]);

	return size;
}
