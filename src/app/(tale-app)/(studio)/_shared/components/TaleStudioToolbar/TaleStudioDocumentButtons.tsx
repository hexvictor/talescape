"use client";

import { Download, Upload } from "lucide-react";
import { useTaleStudio } from "~/app/(tale-app)/(studio)/_shared/contexts/TaleStudioProvider";
import { Button } from "~/components/ui/button";
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
		<Button
			className={cn(taleFileButtonClassName, className)}
			motion="flat"
			size="sm"
			variant="outline"
			onPress={exportTale}
		>
			<Download size={14} />
			<span>Export</span>
		</Button>
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
		<Button
			className={cn(taleFileButtonClassName, className)}
			motion="flat"
			size="sm"
			variant="outline"
			onPress={openImportDialog}
		>
			<Upload size={14} />
			<span>Import</span>
		</Button>
	);
}
