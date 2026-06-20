"use client";

import { useEffect, useRef } from "react";
import {
	useTaleStore,
	useTaleStoreInstance,
} from "../contexts/TaleStoreContext";
import type { ReaderViewportLayout } from "../types";

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
	const setViewportMetrics = useTaleStore(
		(state) => state.ui.setViewportMetrics,
	);
	const size = useTaleStore((state) => state.ui.viewport);
	const store = useTaleStoreInstance();
	const timerRef = useRef<number | null>(null);
	const maximumRightInsetPx = options.maximumRightInsetPx ?? 0;
	const rightInsetRatio = options.rightInsetRatio ?? 0;
	const root = options.root ?? null;

	useEffect(() => {
		const resolveLayout = (
			width: number,
			height: number,
		): ReaderViewportLayout => {
			if (width >= 768) {
				return "desktop";
			}
			return height > width ? "mobile-portrait" : "mobile-landscape";
		};

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
			const nextLayout = resolveLayout(nextViewport.width, nextViewport.height);
			const current = store.getState().ui;
			if (
				current.layout === nextLayout &&
				current.viewport.width === nextViewport.width &&
				current.viewport.height === nextViewport.height
			) {
				return;
			}
			setViewportMetrics(nextViewport, nextLayout);
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
	}, [maximumRightInsetPx, rightInsetRatio, root, setViewportMetrics, store]);

	return size;
}
