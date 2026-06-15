"use client";

import { useReaderStore } from "../contexts/ReaderStoreContext";
import type { ReaderViewportLayout } from "../types";

/**
 * Tracks the responsive presentation mode used by the Reader Hub.
 *
 * @returns Current Reader Hub layout mode.
 *
 * @example
 * const layout = useReaderHubLayout();
 */
export function useReaderHubLayout(): ReaderViewportLayout {
	return useReaderStore((state) => state.ui.layout);
}
