"use client";

import type { ResolvedTaleFragment } from "../../../../types";

export function SoundCueFragment({
	fragment,
}: {
	fragment: ResolvedTaleFragment;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="SoundCueFragment"
			data-reader-role="sound-cue-content"
			data-reader-fragment-id={fragment.id}
			className="rounded-lg border border-[#9fbf8f]/35 bg-[#9fbf8f]/12 p-4 shadow-xl backdrop-blur-md"
		>
			<p className="font-black text-[#c7dfb9] text-xs uppercase tracking-[0.2em]">
				{fragment.label ?? "Sound cue"}
			</p>
			<p className="mt-2 text-foreground/66 text-sm italic">{fragment.mood}</p>
		</div>
	);
}
