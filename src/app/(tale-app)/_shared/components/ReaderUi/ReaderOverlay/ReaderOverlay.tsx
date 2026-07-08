import { ReaderNavigator } from "../ReaderNavigator/ReaderNavigator";
import { ReaderProgress } from "../ReaderProgress/ReaderProgress";
import { ReaderScrollCue } from "../ReaderScrollCue/ReaderScrollCue";
import { ReaderUiVisibilityControl } from "../ReaderUiVisibilityControl/ReaderUiVisibilityControl";
import { TaleDebug } from "../TaleDebug/TaleDebug";
import { ReaderMobileQuickActions } from "./ReaderMobileQuickActions";

/**
 * Composes reader overlays according to the selected visibility preset.
 *
 * @returns Reader navigation, status, and debug overlays.
 *
 * @example
 * <ReaderOverlay />
 */
export function ReaderOverlay(): React.JSX.Element | null {
	return (
		<div
			data-reader-component="ReaderOverlay"
			data-reader-role="reader-overlay"
			className="pointer-events-none absolute inset-0 z-50"
		>
			<ReaderProgress />
			<ReaderMobileQuickActions />
			<ReaderNavigator />
			<ReaderScrollCue />
			<TaleDebug />
			<ReaderUiVisibilityControl />
		</div>
	);
}
