"use client";

import { useEffect, useRef, useState } from "react";
import { viewportFallback } from "../constants";

const resizeDebounceMs = 180;

export function useViewportSize() {
	const [size, setSize] = useState(viewportFallback);
	const timerRef = useRef<number | null>(null);

	useEffect(() => {
		const update = () =>
			setSize({ height: window.innerHeight, width: window.innerWidth });
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
	}, []);

	return size;
}
