"use client";

import { Download, Upload } from "lucide-react";
import { useTaleStudio } from "~/app/(tale-app)/(studio)/_shared/contexts/TaleStudioProvider";
import cn from "~/lib/utils/cn";

const taleFileButtonClassName =
	"flex h-9 items-center justify-center gap-2 rounded border border-foreground/12 px-2.5 font-semibold text-foreground/68 text-xs hover:bg-foreground/8 hover:text-foreground";

/**
 * Downloads the current Tale Studio document as a JSON file.
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
	const { exportTale } = useTaleStudio().document;

	return (
		<button
			type="button"
			className={cn(taleFileButtonClassName, className)}
			onClick={exportTale}
		>
			<Download size={14} />
			<span>Export</span>
		</button>
	);
}

/**
 * Opens the tale JSON import file picker for the active Studio document.
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
	const { openImportDialog } = useTaleStudio().document;

	return (
		<button
			type="button"
			className={cn(taleFileButtonClassName, className)}
			onClick={openImportDialog}
		>
			<Upload size={14} />
			<span>Import</span>
		</button>
	);
}
