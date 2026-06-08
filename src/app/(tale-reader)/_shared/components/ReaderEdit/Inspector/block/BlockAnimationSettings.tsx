"use client";

import type { ResolvedTaleBlock } from "../../../../types";
import { AnimationSelectionEditor } from "../AnimationSelectionEditor";
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
				title="Reading entering"
				selection={block.reading.animations.entering}
				onChange={(entering) =>
					onChange((item) => ({
						...item,
						reading: {
							...item.reading,
							animations: { ...item.reading.animations, entering },
						},
					}))
				}
			/>
			<AnimationSelectionEditor
				title="Reading scrolling"
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
			<AnimationSelectionEditor
				title="Reading leaving"
				selection={block.reading.animations.leaving}
				onChange={(leaving) =>
					onChange((item) => ({
						...item,
						reading: {
							...item.reading,
							animations: { ...item.reading.animations, leaving },
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
