"use client";

import { Download, Upload } from "lucide-react";
import { useRef } from "react";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import {
	createTaleJsonExport,
	getTaleJsonExportFileName,
	parseTaleJsonImport,
} from "../../services/taleJsonTransfer";

/**
 * Renders editor controls for downloading and uploading tale JSON documents.
 *
 * Imported data updates the local editor document and still requires the user
 * to press Save before database persistence occurs.
 *
 * @returns Export and import buttons plus a hidden file input.
 *
 * @example
 * <TaleJsonTransferControls />
 */
export function TaleJsonTransferControls(): React.JSX.Element {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));

	/**
	 * Downloads the current tale document as a JSON export.
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
	 * Imports one selected tale JSON file into the local editor document.
	 *
	 * @param file - Uploaded JSON file.
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
		<div
			data-reader-component="TaleJsonTransferControls"
			data-reader-role="tale-json-transfer"
			className="flex min-w-0 items-center gap-1"
		>
			<button
				type="button"
				className="flex h-9 items-center justify-center gap-2 rounded border border-foreground/12 px-2.5 font-semibold text-foreground/68 text-xs hover:bg-foreground/8 hover:text-foreground"
				onClick={exportTale}
			>
				<Download size={14} />
				<span>Export</span>
			</button>
			<button
				type="button"
				className="flex h-9 items-center justify-center gap-2 rounded border border-foreground/12 px-2.5 font-semibold text-foreground/68 text-xs hover:bg-foreground/8 hover:text-foreground"
				onClick={() => inputRef.current?.click()}
			>
				<Upload size={14} />
				<span>Import</span>
			</button>
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
		</div>
	);
}
