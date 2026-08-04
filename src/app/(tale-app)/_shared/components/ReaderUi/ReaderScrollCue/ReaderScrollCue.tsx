"use client";

import { ArrowDown } from "lucide-react";
import { useTaleReaderStoreShallow } from "../../../contexts/TaleReaderStoreContext";
import type { Direction } from "../../../types";

export function ReaderScrollCue(): React.JSX.Element | null {
	const { direction, visible } = useTaleReaderStoreShallow((state) => ({
		direction: state.scroll.cue,
		visible: state.ui.visibilityMode !== "hidden",
	}));

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
	if (!visible || !direction) return null;
	return (
		<div
			data-reader-component="ReaderScrollCue"
			data-reader-role="scroll-direction-cue"
			className="pointer-events-none absolute inset-x-0 bottom-14 z-50 flex justify-center"
		>
			<div className="rounded-full border border-primary/35 bg-background/70 p-3 text-primary shadow-2xl backdrop-blur-md">
				<ArrowDown
					className="animate-pulse"
					size={22}
					style={{ transform: `rotate(${rotations[direction]}deg)` }}
				/>
			</div>
		</div>
	);
}
