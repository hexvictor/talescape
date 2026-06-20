"use client";

import { ArrowDown } from "lucide-react";
import type { Direction } from "../../../types";

export function ReaderScrollCue({
	direction,
}: {
	direction: Direction;
}): React.JSX.Element {
	const rotations: Record<Direction, number> = {
		down: 0,
		"down-left": 45,
		"down-right": -45,
		left: 90,
		right: -90,
		up: 180,
		"up-left": 135,
		"up-right": -135,
	};
	return (
		<div
			data-reader-component="ReaderScrollCue"
			data-reader-role="scroll-direction-cue"
			className="pointer-events-none absolute inset-x-0 bottom-14 z-50 flex justify-center"
		>
			<div className="rounded-full border border-[#d9b56f]/35 bg-black/70 p-3 text-[#d9b56f] shadow-2xl backdrop-blur-md">
				<ArrowDown
					className="animate-pulse"
					size={22}
					style={{ transform: `rotate(${rotations[direction]}deg)` }}
				/>
			</div>
		</div>
	);
}
