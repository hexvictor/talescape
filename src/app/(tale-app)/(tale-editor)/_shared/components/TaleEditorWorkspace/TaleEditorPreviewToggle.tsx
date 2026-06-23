"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";

/**
 * Renders the control that toggles the editor live preview pane.
 *
 * @returns Editor preview visibility control.
 *
 * @example
 * <TaleEditorPreviewToggle />
 */
export function TaleEditorPreviewToggle(): React.JSX.Element {
	const { previewOpen, setPreviewOpen } = useTaleAppStoreShallow((state) => ({
		previewOpen: state.runtime.previewOpen,
		setPreviewOpen: state.runtime.setPreviewOpen,
	}));

	return (
		<button
			data-reader-component="TaleEditorPreviewToggle"
			data-reader-role="preview-toggle"
			type="button"
			className="absolute top-3 left-3 z-20 flex h-9 items-center gap-2 rounded border border-foreground/12 bg-background/70 px-3 text-foreground/70 text-xs hover:bg-foreground/8 hover:text-foreground"
			onClick={() => setPreviewOpen(!previewOpen)}
		>
			{previewOpen ? <EyeOff size={14} /> : <Eye size={14} />}
			Preview
		</button>
	);
}
