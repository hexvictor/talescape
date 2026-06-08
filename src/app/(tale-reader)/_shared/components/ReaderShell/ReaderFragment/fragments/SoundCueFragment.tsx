"use client";

import type { ResolvedTaleFragment } from "../../../../types";

export function SoundCueFragment({
	fragment,
}: {
	fragment: ResolvedTaleFragment;
}) {
	return (
		<div className="rounded-lg border border-[#9fbf8f]/35 bg-[#9fbf8f]/12 p-4 shadow-xl backdrop-blur-md">
			<p className="font-black text-[#c7dfb9] text-xs uppercase tracking-[0.2em]">
				{fragment.label ?? "Sound cue"}
			</p>
			<p className="mt-2 text-sm text-white/66 italic">{fragment.mood}</p>
		</div>
	);
}
