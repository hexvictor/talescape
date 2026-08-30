import cn from "~/lib/utils/cn";

/** Displays a high-contrast reading progress track. */
export function ProgressBar({
	className,
	value,
}: {
	className?: string;
	value: number;
}): React.JSX.Element {
	const progress = Math.min(Math.max(value, 0), 100);
	return (
		<div
			aria-label={`${Math.round(progress)}% complete`}
			aria-valuemax={100}
			aria-valuemin={0}
			aria-valuenow={progress}
			role="progressbar"
			tabIndex={0}
			className={cn(
				"h-2.5 overflow-hidden border-2 border-[var(--comic-ink)] bg-[var(--comic-cream)]",
				className,
			)}
		>
			<span
				className="block h-full bg-[var(--comic-teal)]"
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
}
