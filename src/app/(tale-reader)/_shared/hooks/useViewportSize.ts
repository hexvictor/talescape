"use client";

import { useEffect, useRef, useState } from "react";
import { viewportFallback } from "../constants";

const resizeDebounceMs = 180;

type ViewportSizeOptions = {
	maximumRightInsetPx?: number;
	rightInsetRatio?: number;
};

/**
 * Tracks the usable reader viewport after accounting for persistent side UI.
 *
 * @param options - Optional right-side inset constraints.
 * @returns The debounced usable viewport dimensions.
 *
 * @example
 * const viewport = useViewportSize({ maximumRightInsetPx: 448, rightInsetRatio: 0.42 });
 */
export function useViewportSize(options: ViewportSizeOptions = {}) {
	const [size, setSize] = useState(viewportFallback);
	const timerRef = useRef<number | null>(null);
	const maximumRightInsetPx = options.maximumRightInsetPx ?? 0;
	const rightInsetRatio = options.rightInsetRatio ?? 0;

	useEffect(() => {
		const update = () => {
			const rightInset = Math.min(
				maximumRightInsetPx,
				window.innerWidth * rightInsetRatio,
			);
			setSize({
				height: window.innerHeight,
				width: Math.max(1, window.innerWidth - rightInset),
			});
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
	}, [maximumRightInsetPx, rightInsetRatio]);

	return size;
}
