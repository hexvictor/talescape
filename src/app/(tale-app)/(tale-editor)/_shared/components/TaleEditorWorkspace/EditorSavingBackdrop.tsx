"use client";

/**
 * Blocks editor interaction while a tale save mutation is in flight.
 *
 * @returns Fullscreen saving backdrop.
 *
 * @example
 * <EditorSavingBackdrop />
 */
export function EditorSavingBackdrop(): React.JSX.Element {
	return (
		<div
			data-reader-component="EditorSavingBackdrop"
			data-reader-role="saving-blocker"
			className="fixed inset-0 z-[1400] grid place-items-center bg-background/72 text-foreground backdrop-blur-sm"
		>
			<div className="rounded-lg border border-foreground/12 bg-background/96 px-5 py-4 text-center shadow-2xl">
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
