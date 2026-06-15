"use client";

import { ReaderStoreProvider } from "../../contexts/ReaderStoreContext";
import { usePersistReaderProgress } from "../../hooks/usePersistReaderProgress";
import { readProgress } from "../../services/readerProgressStorage";
import type { ReaderMode, SavedReaderProgress, Tale } from "../../types";
import { ReaderViewport } from "../ReaderShell/ReaderViewport/ReaderViewport";

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
export function TaleReader({
	mode = "read",
	progress,
	tale,
}: TaleReaderProps): React.JSX.Element {
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
 * Persists reader progress from inside the active reader store provider.
 *
 * @returns Null because this component owns only persistence effects.
 *
 * @example
 * <ReaderProgressPersistence />
 */
function ReaderProgressPersistence(): null {
	usePersistReaderProgress();
	return null;
}
