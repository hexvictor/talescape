"use client";

import { useReaderOverlayState } from "../../../hooks/store/useReaderRuntimeSelectors";
import { ReaderEditorOverlay } from "../../ReaderEdit/ReaderEditorOverlay";
import { EntryNavigator } from "../../ReaderUi/EntryNavigator/EntryNavigator";
import { PageNavigator } from "../../ReaderUi/PageNavigator/PageNavigator";
import { ReaderProgress } from "../../ReaderUi/ReaderProgress/ReaderProgress";
import { ReaderScrollCue } from "../../ReaderUi/ReaderScrollCue/ReaderScrollCue";
import { ReaderUiVisibilityControl } from "../../ReaderUi/ReaderUiVisibilityControl/ReaderUiVisibilityControl";
import { TaleDebug } from "../../ReaderUi/TaleDebug/TaleDebug";

/**
 * Composes reader overlays according to the selected visibility preset.
 *
 * @returns Reader navigation, status, debug, and editor overlays.
 *
 * @example
 * <ReaderOverlayUi />
 */
export function ReaderOverlayUi(): React.JSX.Element {
	const { scrollCue, setVisibilityMode, toggleReaderUi, visibilityMode } =
		useReaderOverlayState();
	const showNavigation =
		visibilityMode === "all" || visibilityMode === "navigation";
	const showProgress = visibilityMode !== "hidden";
	const showTools = visibilityMode === "all";

	return (
		<div
			data-reader-component="ReaderOverlayUi"
			data-reader-role="reader-overlay"
			className="pointer-events-none absolute inset-0 z-50"
		>
			<ReaderProgress visible={showProgress} />
			{showNavigation ? (
				<>
					<EntryNavigator />
					<PageNavigator />
				</>
			) : null}
			{showProgress ? (
				scrollCue ? (
					<ReaderScrollCue direction={scrollCue} />
				) : null
			) : null}
			{showTools ? (
				<>
					<TaleDebug />
					<ReaderEditorOverlay />
				</>
			) : null}
			<ReaderUiVisibilityControl
				mode={visibilityMode}
				onChange={setVisibilityMode}
				onToggle={toggleReaderUi}
			/>
		</div>
	);
}
