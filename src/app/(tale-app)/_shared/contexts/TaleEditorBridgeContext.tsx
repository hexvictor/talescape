"use client";

import { type PropsWithChildren, createContext, useContext } from "react";
import type { TaleInspectorTarget } from "../types";

export type TaleEditorBridgeValue = {
	enabled: boolean;
	highlightedBranchId: string | null;
	hoveredBlockId: string | null;
	inspectorControlsOpen: boolean;
	selectedBlockId: string | null;
	selectedBranchId: string | null;
	openInspector: (target: TaleInspectorTarget) => void;
	openSecondaryInspector: (target: TaleInspectorTarget) => void;
	toggleInspectorControls: () => void;
};

const defaultBridgeValue: TaleEditorBridgeValue = {
	enabled: false,
	highlightedBranchId: null,
	hoveredBlockId: null,
	inspectorControlsOpen: false,
	selectedBlockId: null,
	selectedBranchId: null,
	openInspector: () => undefined,
	openSecondaryInspector: () => undefined,
	toggleInspectorControls: () => undefined,
};

const TaleEditorBridgeContext =
	createContext<TaleEditorBridgeValue>(defaultBridgeValue);

/**
 * Makes editor-only controls available to shared tale-rendering components.
 *
 * @param props - Bridge provider props.
 * @param props.children - Shared renderer and editor components.
 * @param props.value - Current editor control state and actions.
 * @returns Editor bridge provider.
 *
 * @example
 * <TaleEditorBridgeProvider value={value}>{children}</TaleEditorBridgeProvider>
 */
export function TaleEditorBridgeProvider({
	children,
	value,
}: PropsWithChildren<{ value: TaleEditorBridgeValue }>): React.JSX.Element {
	return (
		<TaleEditorBridgeContext.Provider value={value}>
			{children}
		</TaleEditorBridgeContext.Provider>
	);
}

/**
 * Reads editor extension state from shared tale-rendering components.
 *
 * @returns Active editor bridge or inert read-mode defaults.
 *
 * @example
 * const { enabled, selectedBlockId } = useTaleEditorBridge();
 */
export function useTaleEditorBridge(): TaleEditorBridgeValue {
	return useContext(TaleEditorBridgeContext);
}
