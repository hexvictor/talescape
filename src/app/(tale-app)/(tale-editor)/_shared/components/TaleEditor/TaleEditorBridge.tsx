"use client";

import { useMemo, type PropsWithChildren } from "react";
import { TaleEditorBridgeProvider } from "~/app/(tale-app)/_shared/contexts/TaleEditorBridgeContext";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";

/**
 * Connects the editor store extension to shared viewport rendering components.
 *
 * @param props - Bridge props.
 * @param props.children - Editor workspace and shared renderer.
 * @returns Shared editor bridge provider.
 *
 * @example
 * <TaleEditorBridge><TaleEditorWorkspace /></TaleEditorBridge>
 */
export function TaleEditorBridge({
	children,
}: PropsWithChildren): React.JSX.Element {
	const editor = useTaleEditorStoreShallow((state) => state.editor);
	const value = useMemo(
		() => ({
			enabled: true,
			highlightedBranchId: editor.highlightedBranchId,
			hoveredBlockId: editor.hoveredBlockId,
			inspectorControlsOpen: editor.inspectorControlsOpen,
			openInspector: editor.openInspector,
			openSecondaryInspector: editor.openSecondaryInspector,
			selectedBlockId: editor.selectedBlockId,
			selectedBranchId: editor.selectedBranchId,
			toggleInspectorControls: editor.toggleInspectorControls,
		}),
		[editor],
	);

	return (
		<TaleEditorBridgeProvider value={value}>
			{children}
		</TaleEditorBridgeProvider>
	);
}
