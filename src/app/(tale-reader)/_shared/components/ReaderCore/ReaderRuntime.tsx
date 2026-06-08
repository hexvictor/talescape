"use client";

import { ReaderStoreProvider } from "../../contexts/ReaderStoreContext";
import { usePersistReaderProgress } from "../../hooks/usePersistReaderProgress";
import { readProgress } from "../../services/readerProgressStorage";
import type { ReaderMode, SavedReaderProgress, Tale } from "../../types";
import { ReaderViewport } from "../ReaderShell/ReaderViewport/ReaderViewport";

type ReaderRuntimeProps = {
	mode: ReaderMode;
	progress: SavedReaderProgress | null;
	tale: Tale;
};

/**
 * Composes the shared engine runtime used by reading and editing views.
 *
 * @param props - Runtime props.
 * @param props.mode - Active read or edit mode.
 * @param props.progress - Persisted reader progress, when available.
 * @param props.tale - Formatted tale consumed by the engine.
 * @returns Reader store, persistence side effect, and viewport.
 *
 * @example
 * <ReaderRuntime mode="read" tale={tale} progress={progress} />
 */
export function ReaderRuntime({ mode, progress, tale }: ReaderRuntimeProps) {
	return (
		<ReaderStoreProvider
			mode={mode}
			progress={progress ?? readProgress(tale)}
			tale={tale}
		>
			<ReaderProgressPersistence />
			<ReaderViewport />
		</ReaderStoreProvider>
	);
}

/**
 * Wires reader progress persistence inside the active store provider.
 *
 * @returns Null because the component owns only persistence effects.
 *
 * @example
 * <ReaderProgressPersistence />
 */
function ReaderProgressPersistence() {
	usePersistReaderProgress();
	return null;
}
