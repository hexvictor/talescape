"use client";

import { TaleAppProvider } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { TaleReaderProvider } from "~/app/(tale-app)/_shared/contexts/TaleReaderStoreContext";
import { readProgress } from "~/app/(tale-app)/_shared/services/readerProgressStorage";
import type { TaleStudioWorkspace as TaleStudioWorkspaceName } from "~/app/(tale-app)/_shared/stores/createTaleAppStore";
import type { SavedReaderProgress, Tale } from "~/app/(tale-app)/_shared/types";
import { TaleStudioProvider } from "../../contexts/TaleStudioProvider";
import { TaleStudioWorkspace } from "../TaleStudioWorkspace/TaleStudioWorkspace";

type TaleStudioProps = {
	progress: SavedReaderProgress | null;
	tale: Tale;
	workspace: TaleStudioWorkspaceName;
};

/**
 * Renders Tale Studio in the workspace selected by the current URL.
 *
 * @param props - Tale Studio props.
 * @param props.progress - Current user's saved progress, or null when unavailable.
 * @param props.tale - Fully formatted editable tale.
 * @param props.workspace - Editor or preview workspace selected by the route.
 * @returns Tale Studio composition.
 *
 * @example
 * <TaleStudio tale={tale} progress={progress} workspace="editor" />
 */
export function TaleStudio({
	progress,
	tale,
	workspace,
}: TaleStudioProps): React.JSX.Element {
	return (
		<TaleAppProvider application="editor" tale={tale} workspace={workspace}>
			<TaleReaderProvider progress={progress ?? readProgress(tale)} tale={tale}>
				<TaleStudioProvider>
					<TaleStudioWorkspace />
				</TaleStudioProvider>
			</TaleReaderProvider>
		</TaleAppProvider>
	);
}
