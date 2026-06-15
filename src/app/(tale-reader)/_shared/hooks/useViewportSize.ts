"use client";

import { useEffect, useRef } from "react";
import {
	useReaderStore,
	useReaderStoreInstance,
} from "../contexts/ReaderStoreContext";
import type { ReaderViewportLayout } from "../types";

const resizeDebounceMs = 180;

type ViewportSizeOptions = {
	maximumRightInsetPx?: number;
	rightInsetRatio?: number;
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
	const setViewportMetrics = useReaderStore(
		(state) => state.ui.setViewportMetrics,
	);
	const size = useReaderStore((state) => state.ui.viewport);
	const store = useReaderStoreInstance();
	const timerRef = useRef<number | null>(null);
	const maximumRightInsetPx = options.maximumRightInsetPx ?? 0;
	const rightInsetRatio = options.rightInsetRatio ?? 0;

	useEffect(() => {
		const resolveLayout = (): ReaderViewportLayout => {
			if (window.innerWidth >= 768) {
				return "desktop";
			}
			return window.innerHeight > window.innerWidth
				? "mobile-portrait"
				: "mobile-landscape";
		};

		const update = () => {
			const rightInset = Math.min(
				maximumRightInsetPx,
				window.innerWidth * rightInsetRatio,
			);
			const nextViewport = {
				height: window.innerHeight,
				width: Math.max(1, window.innerWidth - rightInset),
			};
			const nextLayout = resolveLayout();
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
		window.addEventListener("resize", debouncedUpdate);
		return () => {
			window.removeEventListener("resize", debouncedUpdate);
			window.clearTimeout(timerRef.current ?? undefined);
		};
	}, [maximumRightInsetPx, rightInsetRatio, setViewportMetrics, store]);

	return size;
}
