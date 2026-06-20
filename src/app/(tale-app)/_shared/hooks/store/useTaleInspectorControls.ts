"use client";

import { useTaleEditorBridge } from "../../contexts/TaleEditorBridgeContext";
import type { TaleEditorBridgeValue } from "../../contexts/TaleEditorBridgeContext";

type TaleInspectorControls = {
	inspectorControlsOpen: boolean;
	mode: "edit" | "read";
	openInspector: TaleEditorBridgeValue["openInspector"];
	openSecondaryInspector: TaleEditorBridgeValue["openSecondaryInspector"];
};

/**
 * Selects the common runtime state required by inline inspector controls.
 *
 * @returns Stable inspector control state for shared block and fragment renderers.
 *
 * @example
 * const { mode, openInspector } = useTaleInspectorControls();
 */
export function useTaleInspectorControls(): TaleInspectorControls {
	const editor = useTaleEditorBridge();
	return {
		inspectorControlsOpen: editor.inspectorControlsOpen,
		mode: editor.enabled ? "edit" : "read",
		openInspector: editor.openInspector,
		openSecondaryInspector: editor.openSecondaryInspector,
	};
}
