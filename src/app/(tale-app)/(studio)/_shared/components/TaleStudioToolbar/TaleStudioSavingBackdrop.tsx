"use client";

/**
 * Blocks Tale Studio interaction while a save mutation is in flight.
 *
 * @returns Fullscreen saving backdrop.
 *
 * @example
 * <TaleStudioSavingBackdrop />
 */
export function TaleStudioSavingBackdrop(): React.JSX.Element {
	return (
		<div
			data-reader-component="TaleStudioSavingBackdrop"
			data-reader-role="saving-blocker"
			className="fixed inset-0 z-[1400] grid place-items-center bg-background/72 text-foreground backdrop-blur-sm"
		>
			<div className="border-[3px] border-foreground bg-card px-5 py-4 text-center shadow-[7px_7px_0_var(--comic-teal)]">
				<p className="font-black text-primary text-xs uppercase tracking-[0.18em]">
					Saving
				</p>
				<p className="mt-1 text-foreground/58 text-xs">
					Please wait while the tale is saved.
				</p>
			</div>
		</div>
	);
}
