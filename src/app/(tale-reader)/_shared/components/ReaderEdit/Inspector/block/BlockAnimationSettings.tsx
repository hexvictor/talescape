"use client";

import type { ResolvedTaleBlock } from "../../../../types";
import { AnimationSelectionEditor } from "../AnimationSelectionEditor";
import { LoopingAnimationEditor } from "../LoopingAnimationEditor";
import type { BlockChangeHandler } from "./blockMotionTypes";

/**
 * Edits the block's reading and transition animation tracks.
 *
 * @param props - Component props.
 * @param props.block - Current resolved block.
 * @param props.onChange - Applies a block update.
 * @returns Animation track editors.
 */
export function BlockAnimationSettings({
	block,
	onChange,
}: {
	block: ResolvedTaleBlock;
	onChange: BlockChangeHandler;
}): React.JSX.Element {
	return (
		<>
			<AnimationSelectionEditor
				title="Transition scrolling"
				selection={block.reading.animations.scrolling}
				onChange={(scrolling) =>
					onChange((item) => ({
						...item,
						reading: {
							...item.reading,
							animations: { ...item.reading.animations, scrolling },
						},
					}))
				}
			/>
			<LoopingAnimationEditor
				selection={block.reading.animations.ambient}
				onChange={(ambient) =>
					onChange((item) => ({
						...item,
						reading: {
							...item.reading,
							animations: { ...item.reading.animations, ambient },
						},
					}))
				}
			/>
			<AnimationSelectionEditor
				title="Transition entering"
				selection={block.transition.animations.entering}
				onChange={(entering) =>
					onChange((item) => ({
						...item,
						transition: {
							...item.transition,
							animations: { ...item.transition.animations, entering },
						},
					}))
				}
			/>
			<AnimationSelectionEditor
				title="Transition leaving"
				selection={block.transition.animations.leaving}
				onChange={(leaving) =>
					onChange((item) => ({
						...item,
						transition: {
							...item.transition,
							animations: { ...item.transition.animations, leaving },
						},
					}))
				}
			/>
		</>
	);
}
