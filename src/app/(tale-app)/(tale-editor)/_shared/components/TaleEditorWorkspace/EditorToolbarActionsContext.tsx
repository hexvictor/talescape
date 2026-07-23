"use client";

import { createContext, useContext } from "react";

type EditorToolbarActionsContextValue = {
	dirtyStatus: string;
	openSettings: () => void;
	save: () => void;
	savePending: boolean;
};

const EditorToolbarActionsContext =
	createContext<EditorToolbarActionsContextValue | null>(null);

/**
 * Provides editor toolbar actions shared by reading and editing headers.
 *
 * @param props - Provider options.
 * @param props.children - Header subtree that can read toolbar actions.
 * @param props.value - Save, settings, and status actions for the active editor.
 * @returns Editor toolbar action provider.
 *
 * @example
 * <EditorToolbarActionsProvider value={actions}><EditorEditingToolbar /></EditorToolbarActionsProvider>
 */
export function EditorToolbarActionsProvider({
	children,
	value,
}: {
	children: React.ReactNode;
	value: EditorToolbarActionsContextValue;
}): React.JSX.Element {
	return (
		<EditorToolbarActionsContext.Provider value={value}>
			{children}
		</EditorToolbarActionsContext.Provider>
	);
}

/**
 * Reads save and settings actions for editor toolbar components.
 *
 * @returns Current editor toolbar actions.
 *
 * @example
 * const { save, savePending } = useEditorToolbarActions();
 */
export function useEditorToolbarActions(): EditorToolbarActionsContextValue {
	const value = useContext(EditorToolbarActionsContext);
	if (!value) {
		throw new Error(
			"useEditorToolbarActions must be used inside EditorToolbarActionsProvider.",
		);
	}
	return value;
}
