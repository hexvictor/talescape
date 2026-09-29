"use client";

import { Redo2, RotateCcw, Undo2 } from "lucide-react";
import { useTaleStudio } from "../../contexts/TaleStudioProvider";

/**
 * Renders local draft undo, redo, discard, and recovery status controls.
 *
 * @returns Compact Studio draft history controls.
 */
export function TaleStudioDraftHistoryControls(): React.JSX.Element {
	const {
		dialogs,
		recovery,
		toolbar: { savePending },
	} = useTaleStudio();
	return (
		<div
			data-reader-component="TaleStudioDraftHistoryControls"
			data-reader-role="draft-history-controls"
			data-studio-component="TaleStudioDraftHistoryControls"
			data-studio-role="draft-history-controls"
			className="flex min-w-0 items-center gap-1"
		>
			<HistoryButton
				disabled={!recovery.canUndo || savePending}
				label="Undo draft change"
				onClick={recovery.undo}
			>
				<Undo2 size={15} />
			</HistoryButton>
			<HistoryButton
				disabled={!recovery.canRedo || savePending}
				label="Redo draft change"
				onClick={recovery.redo}
			>
				<Redo2 size={15} />
			</HistoryButton>
			<HistoryButton
				disabled={savePending}
				label="Discard unsaved changes"
				onClick={() =>
					dialogs.confirm({
						title: "Discard unsaved changes?",
						description:
							"Return to the last saved tale and clear local draft history.",
						confirmLabel: "Discard",
						onConfirm: recovery.discard,
					})
				}
			>
				<RotateCcw size={15} />
			</HistoryButton>
			{recovery.error ? (
				<output
					className="ml-1 hidden max-w-[18rem] truncate border border-amber-500/45 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-700 sm:block dark:text-amber-200"
					title={recovery.error}
				>
					{recovery.error}
				</output>
			) : null}
		</div>
	);
}

function HistoryButton({
	children,
	disabled,
	label,
	onClick,
}: {
	children: React.ReactNode;
	disabled: boolean;
	label: string;
	onClick: () => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			aria-label={label}
			className="hover:-translate-y-0.5 grid h-9 w-9 place-items-center border-2 border-foreground bg-card text-foreground shadow-[2px_2px_0_var(--comic-ink)] transition hover:bg-accent disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35"
			disabled={disabled}
			title={label}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
