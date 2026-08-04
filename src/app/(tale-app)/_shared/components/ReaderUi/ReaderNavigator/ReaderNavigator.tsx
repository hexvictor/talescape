import { useTaleReaderStore } from "../../../contexts/TaleReaderStoreContext";
import { EntryNavigator } from "./EntryNavigator/EntryNavigator";
import { PageNavigator } from "./PageNavigator/PageNavigator";

/**
 * Owns the visibility boundary for reader navigation features.
 *
 * @returns Navigation overlays when enabled by the current visibility mode.
 *
 * @example
 * <ReaderNavigator />
 */
export function ReaderNavigator(): React.JSX.Element | null {
	const visible = useTaleReaderStore(
		(state) =>
			state.ui.visibilityMode === "all" ||
			state.ui.visibilityMode === "navigation",
	);
	if (!visible) return null;
	return (
		<>
			<EntryNavigator />
			<PageNavigator />
		</>
	);
}
