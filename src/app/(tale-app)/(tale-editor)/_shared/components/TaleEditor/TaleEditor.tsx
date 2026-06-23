"use client";

import { TaleAppStoreProvider } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { TaleReaderStoreProvider } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { readProgress } from "~/app/(tale-app)/_shared/services/readerProgressStorage";
import type { SavedReaderProgress, Tale } from "~/app/(tale-app)/_shared/types";
import { TaleEditorStoreProvider } from "../../contexts/TaleEditorStoreContext";
import { TaleEditorWorkspace } from "../TaleEditorWorkspace";

type TaleEditorProps = {
	progress: SavedReaderProgress | null;
	tale: Tale;
};

/**
 * Renders the tale editor with its own edit-mode runtime composition.
 *
 * @param props - Tale editor props.
 * @param props.progress - Current user's saved progress, or null when unavailable.
 * @param props.tale - Fully formatted editable tale.
 * @returns Tale editor composition.
 *
 * @example
 * <TaleEditor tale={tale} progress={progress} />
 */
export function TaleEditor({
	progress,
	tale,
}: TaleEditorProps): React.JSX.Element {
	return (
		<TaleAppStoreProvider application="editor" tale={tale}>
			<TaleEditorStoreProvider>
				<TaleReaderStoreProvider
					progress={progress ?? readProgress(tale)}
					tale={tale}
				>
					<TaleEditorWorkspace />
				</TaleReaderStoreProvider>
			</TaleEditorStoreProvider>
		</TaleAppStoreProvider>
	);
}
