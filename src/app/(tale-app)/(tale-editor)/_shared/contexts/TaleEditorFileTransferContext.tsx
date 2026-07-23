"use client";

import {
	type PropsWithChildren,
	createContext,
	useContext,
	useRef,
} from "react";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import {
	createTaleJsonExport,
	getTaleJsonExportFileName,
	parseTaleJsonImport,
} from "../services/taleJsonTransfer";

type TaleEditorFileTransferContextValue = {
	exportTale: () => void;
	openImportDialog: () => void;
};

const TaleEditorFileTransferContext =
	createContext<TaleEditorFileTransferContextValue | null>(null);

/**
 * Provides editor-wide import and export actions for the active tale document.
 *
 * @param props - Provider props.
 * @param props.children - Editor subtree that can access file transfer actions.
 * @returns Provider with a hidden JSON file input mounted in the editor DOM.
 *
 * @example
 * <TaleEditorFileTransferProvider><TaleEditorWorkspace /></TaleEditorFileTransferProvider>
 */
export function TaleEditorFileTransferProvider({
	children,
}: PropsWithChildren): React.JSX.Element {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));

	/**
	 * Downloads the current editor tale document as JSON.
	 *
	 * @returns Nothing.
	 */
	const exportTale = (): void => {
		const exportedAt = new Date();
		const exportData = createTaleJsonExport(tale, exportedAt);
		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = getTaleJsonExportFileName(tale, exportedAt);
		link.click();
		URL.revokeObjectURL(url);
	};

	/**
	 * Opens the hidden JSON import file picker.
	 *
	 * @returns Nothing.
	 */
	const openImportDialog = (): void => {
		inputRef.current?.click();
	};

	/**
	 * Imports one selected JSON file into the local editor document.
	 *
	 * @param file - Selected JSON file.
	 * @returns Nothing.
	 */
	const importTale = async (file: File): Promise<void> => {
		try {
			const importedTale = parseTaleJsonImport(await file.text());
			setTale(importedTale, {
				invalidation: "measurement",
				reason: "tale-json-imported",
			});
		} catch (error) {
			window.alert(
				error instanceof Error
					? error.message
					: "The selected file could not be imported.",
			);
		}
	};

	return (
		<TaleEditorFileTransferContext.Provider
			value={{ exportTale, openImportDialog }}
		>
			<input
				ref={inputRef}
				aria-label="Import tale JSON"
				className="hidden"
				accept="application/json,.json"
				type="file"
				onChange={(event) => {
					const file = event.currentTarget.files?.[0];
					event.currentTarget.value = "";
					if (file) void importTale(file);
				}}
			/>
			{children}
		</TaleEditorFileTransferContext.Provider>
	);
}

/**
 * Reads editor-wide tale file import and export actions.
 *
 * @returns Import/export actions for the active editor document.
 *
 * @example
 * const { exportTale, openImportDialog } = useTaleEditorFileTransfer();
 */
export function useTaleEditorFileTransfer(): TaleEditorFileTransferContextValue {
	const context = useContext(TaleEditorFileTransferContext);
	if (!context) {
		throw new Error(
			"useTaleEditorFileTransfer must be used inside TaleEditorFileTransferProvider.",
		);
	}
	return context;
}
