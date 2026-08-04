"use client";

import type { AmbientAnimationSelection } from "~/app/(tale-app)/_shared/types";
import { AnimationSelectionEditor } from "./AnimationSelectionEditor";

/**
 * Edits continuously repeating tracks with timing owned by each track.
 *
 * @param props - Looping animation selection and update callback.
 * @returns Track editor configured for repeating animation timing.
 *
 * @example
 * <LoopingAnimationEditor selection={looping} onChange={setLooping} />
 */
export function LoopingAnimationEditor({
	onChange,
	selection,
}: {
	onChange: (selection: AmbientAnimationSelection) => void;
	selection: AmbientAnimationSelection;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="LoopingAnimationEditor"
			data-reader-role="looping-animation-settings"
		>
			<AnimationSelectionEditor
				title="Looping animations"
				selection={selection}
				timingMode="loop"
				onChange={(animations) =>
					onChange({
						...animations,
						cycleDurationMs: selection.cycleDurationMs,
						playback: selection.playback,
					})
				}
			/>
		</div>
	);
}
