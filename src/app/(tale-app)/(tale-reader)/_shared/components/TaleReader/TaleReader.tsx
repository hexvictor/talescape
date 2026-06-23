"use client";

import { ReaderProgressPersistence } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderProgressPersistence";
import { ReaderViewport } from "~/app/(tale-app)/_shared/components/ReaderShell/ReaderViewport/ReaderViewport";
import { TaleAppStoreProvider } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { TaleReaderStoreProvider } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { readProgress } from "~/app/(tale-app)/_shared/services/readerProgressStorage";
import type { SavedReaderProgress, Tale } from "~/app/(tale-app)/_shared/types";

type TaleReaderProps = {
	progress: SavedReaderProgress | null;
	tale: Tale;
};

/**
 * Renders the read-only tale experience with its isolated reader store.
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
		<TaleAppStoreProvider application="reader" tale={tale}>
			<TaleReaderStoreProvider
				progress={progress ?? readProgress(tale)}
				tale={tale}
			>
				<ReaderProgressPersistence />
				<ReaderViewport />
			</TaleReaderStoreProvider>
		</TaleAppStoreProvider>
	);
}
