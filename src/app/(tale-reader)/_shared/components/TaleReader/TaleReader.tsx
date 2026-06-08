"use client";

import type { ReaderMode, SavedReaderProgress, Tale } from "../../types";
import { ReaderRuntime } from "../ReaderCore/ReaderRuntime";

type TaleReaderProps = {
	mode?: ReaderMode;
	progress: SavedReaderProgress | null;
	tale: Tale;
};

/**
 * Selects the read or edit composition for a database-loaded tale.
 *
 * @param props - Production tale reader props.
 * @param props.mode - Route-selected reader mode.
 * @param props.progress - Current user's saved progress, or null for guests.
 * @param props.tale - Fully formatted tale returned by the database layer.
 * @returns Read-only or editor reader composition.
 *
 * @example
 * <TaleReader mode="edit" tale={tale} progress={progress} />
 */
export function TaleReader({ mode = "read", progress, tale }: TaleReaderProps) {
	return <ReaderRuntime mode={mode} progress={progress} tale={tale} />;
}
