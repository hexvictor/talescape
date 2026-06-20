"use client";

import { TaleStoreProvider } from "~/app/(tale-app)/_shared/contexts/TaleStoreContext";
import { readProgress } from "~/app/(tale-app)/_shared/services/readerProgressStorage";
import type { SavedReaderProgress, Tale } from "~/app/(tale-app)/_shared/types";
import { createTaleEditorStoreExtension } from "../../store/taleEditorStore";
import { TaleEditorWorkspace } from "../TaleEditorWorkspace";
import { TaleEditorBridge } from "./TaleEditorBridge";

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
		<TaleStoreProvider
			createExtension={createTaleEditorStoreExtension}
			mode="edit"
			progress={progress ?? readProgress(tale)}
			tale={tale}
		>
			<TaleEditorBridge>
				<TaleEditorWorkspace />
			</TaleEditorBridge>
		</TaleStoreProvider>
	);
}
