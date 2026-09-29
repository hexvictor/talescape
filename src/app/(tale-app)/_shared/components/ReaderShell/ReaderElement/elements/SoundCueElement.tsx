"use client";

import type { ResolvedTaleElement } from "../../../../types";

export function SoundCueElement({
	element,
}: {
	element: ResolvedTaleElement;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="SoundCueElement"
			data-reader-role="sound-cue-content"
			data-reader-element-id={element.id}
			className="rounded-lg border border-[#9fbf8f]/35 bg-[#9fbf8f]/12 p-4 shadow-xl backdrop-blur-md"
		>
			<p className="font-black text-[#c7dfb9] text-xs uppercase tracking-[0.2em]">
				{element.label ?? "Sound cue"}
			</p>
			<p className="mt-2 text-foreground/66 text-sm italic">{element.mood}</p>
		</div>
	);
}
