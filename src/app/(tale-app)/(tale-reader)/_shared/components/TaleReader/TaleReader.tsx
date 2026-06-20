"use client";

import { ReaderViewport } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderViewport/ReaderViewport";
import { TaleStoreProvider } from "~/app/(tale-app)/_shared/contexts/TaleStoreContext";
import { usePersistReaderProgress } from "~/app/(tale-app)/_shared/hooks/usePersistReaderProgress";
import { readProgress } from "~/app/(tale-app)/_shared/services/readerProgressStorage";
import type { SavedReaderProgress, Tale } from "~/app/(tale-app)/_shared/types";

type TaleReaderProps = {
	progress: SavedReaderProgress | null;
	tale: Tale;
};

/**
 * Renders the read-only tale experience with its isolated runtime store.
 *
 * @param props - Tale reader props.
 * @param props.progress - Current user's saved progress, or null for guests.
 * @param props.tale - Fully formatted tale returned by the database layer.
 * @returns Read-only tale reader composition.
 *
 * @example
 * <TaleReader tale={tale} progress={progress} />
 */
export function TaleReader({
	progress,
	tale,
}: TaleReaderProps): React.JSX.Element {
	return (
		<TaleStoreProvider
			mode="read"
			progress={progress ?? readProgress(tale)}
			tale={tale}
		>
			<ReaderProgressPersistence />
			<ReaderViewport />
		</TaleStoreProvider>
	);
}

/**
 * Persists reader progress from inside the active runtime store provider.
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
