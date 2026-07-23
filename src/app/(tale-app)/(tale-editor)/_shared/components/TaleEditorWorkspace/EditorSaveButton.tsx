import clsx from "clsx";
import { Save } from "lucide-react";
import { useEditorToolbarActions } from "./EditorToolbarActionsContext";

/**
 * Renders the editor save action and its current persistence status.
 *
 * @param props - Save button presentation options.
 * @param props.className - Additional classes applied to the button.
 * @param props.isMobile - Whether to use the compact mobile status treatment.
 * @returns Editor save button.
 *
 * @example
 * <EditorSaveButton className="w-full" />
 */
function EditorSaveButton({
	className,
	isMobile = false,
}: { className?: string; isMobile?: boolean }): React.JSX.Element {
	const { dirtyStatus, save, savePending } = useEditorToolbarActions();
	return (
		<button
			type="button"
			disabled={savePending}
			className={clsx(
				"flex h-9 min-w-9 items-center justify-center gap-2 rounded border border-primary/45 bg-primary/14 px-2 text-primary text-xs disabled:opacity-45",
				className,
			)}
			aria-label="Save tale"
			onClick={save}
		>
			<Save size={14} />
			{!isMobile && dirtyStatus === "Save" && "Save"}
			{dirtyStatus !== "Save" ? (
				<span
					className={clsx(
						"max-w-16 truncate",
						isMobile && "hidden min-[420px]:inline",
					)}
				>
					{dirtyStatus}
				</span>
			) : null}
		</button>
	);
}

export default EditorSaveButton;
