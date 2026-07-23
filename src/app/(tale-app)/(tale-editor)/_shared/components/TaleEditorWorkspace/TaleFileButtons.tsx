"use client";

import clsx from "clsx";
import { Download, Upload } from "lucide-react";
import { useTaleEditorFileTransfer } from "~/app/(tale-app)/(tale-editor)/_shared/contexts/TaleEditorFileTransferContext";

const taleFileButtonClassName =
	"flex h-9 items-center justify-center gap-2 rounded border border-foreground/12 px-2.5 font-semibold text-foreground/68 text-xs hover:bg-foreground/8 hover:text-foreground";

/**
 * Downloads the current editor tale document as a JSON file.
 *
 * @param props - Button display options.
 * @param props.className - Optional extra class names for the button.
 * @returns Tale export button.
 *
 * @example
 * <ExportTaleButton />
 */
export function ExportTaleButton({
	className,
}: {
	className?: string;
}): React.JSX.Element {
	const { exportTale } = useTaleEditorFileTransfer();

	return (
		<button
			type="button"
			className={clsx(taleFileButtonClassName, className)}
			onClick={exportTale}
		>
			<Download size={14} />
			<span>Export</span>
		</button>
	);
}

/**
 * Opens the tale JSON import file picker for the active editor document.
 *
 * @param props - Button display options.
 * @param props.className - Optional extra class names for the button.
 * @returns Tale import button.
 *
 * @example
 * <ImportTaleButton />
 */
export function ImportTaleButton({
	className,
}: {
	className?: string;
}): React.JSX.Element {
	const { openImportDialog } = useTaleEditorFileTransfer();

	return (
		<button
			type="button"
			className={clsx(taleFileButtonClassName, className)}
			onClick={openImportDialog}
		>
			<Upload size={14} />
			<span>Import</span>
		</button>
	);
}
