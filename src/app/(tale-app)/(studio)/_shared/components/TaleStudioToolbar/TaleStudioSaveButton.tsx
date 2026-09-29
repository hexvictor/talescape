import { Save } from "lucide-react";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import { useTaleStudio } from "../../contexts/TaleStudioProvider";

/**
 * Renders the Tale Studio save action and its persistence status.
 *
 * @param props - Save button presentation options.
 * @param props.className - Additional classes applied to the button.
 * @param props.isMobile - Whether to use the compact mobile status treatment.
 * @returns Tale Studio save button.
 *
 * @example
 * <TaleStudioSaveButton className="w-full" />
 */
export function TaleStudioSaveButton({
	className,
	isMobile = false,
}: { className?: string; isMobile?: boolean }): React.JSX.Element {
	const { dirtyStatus, save, savePending } = useTaleStudio().toolbar;
	return (
		<Button
			disabled={savePending}
			className={cn(
				"studio-save-control flex h-9 min-w-9 items-center justify-center gap-2 border-2 border-foreground bg-primary px-3 text-primary-foreground text-xs disabled:opacity-45",
				className,
			)}
			aria-label="Save tale"
			motion="flat"
			size="sm"
			onPress={save}
		>
			<Save size={14} />
			{!isMobile && dirtyStatus === "Save" && "Save"}
			{dirtyStatus !== "Save" ? (
				<span
					className={cn(
						"max-w-16 truncate",
						isMobile && "hidden min-[420px]:inline",
					)}
				>
					{dirtyStatus}
				</span>
			) : null}
		</Button>
	);
}
