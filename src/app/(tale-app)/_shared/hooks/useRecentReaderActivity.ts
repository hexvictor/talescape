"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Keeps a reader control visually active briefly after its tracked value changes.
 *
 * @param value - Navigation value whose changes should reveal the control.
 * @param durationMs - Time before the control returns to its idle appearance.
 * @returns Whether the tracked control should currently appear active.
 *
 * @example
 * const recentlyActive = useRecentReaderActivity(currentPageId);
 */
export function useRecentReaderActivity(
	value: string | null,
	durationMs = 2800,
): boolean {
	const [active, setActive] = useState(true);
	const previousValueRef = useRef(value);

	useEffect(() => {
		previousValueRef.current = value;
		setActive(true);
		const timer = window.setTimeout(() => setActive(false), durationMs);
		return () => window.clearTimeout(timer);
	}, [durationMs, value]);

	return active;
}
