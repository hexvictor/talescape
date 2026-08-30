"use client";

import type { ResolvedTaleBlock } from "~/app/(tale-app)/_shared/types";
import { BlockAnimationSettings } from "./BlockAnimationSettings";
import { BlockReadingSettings } from "./BlockReadingSettings";
import { BlockTransitionSettings } from "./BlockTransitionSettings";
import type { BlockChangeHandler } from "./blockMotionTypes";

/**
 * Groups the reading, transition, and animation controls for a block.
 *
 * @param props - Component props.
 * @param props.block - Current resolved block.
 * @param props.onChange - Applies a block update.
 * @returns Block motion controls.
 */
export function BlockMotionSettings({
	block,
	onChange,
}: {
	block: ResolvedTaleBlock;
	onChange: BlockChangeHandler;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="BlockMotionSettings"
			data-reader-role="block-motion-settings"
			className="space-y-3"
		>
			<BlockReadingSettings block={block} onChange={onChange} />
			<BlockTransitionSettings block={block} onChange={onChange} />
			<BlockAnimationSettings block={block} onChange={onChange} />
		</div>
	);
}
