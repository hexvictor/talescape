"use client";

import type {
	ResolvedTaleFragment,
	TaleFragment,
} from "~/app/(tale-app)/_shared/types";
import {
	DebugCard,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { AnimationSelectionEditor } from "../AnimationSelectionEditor";
import { LoopingAnimationEditor } from "../LoopingAnimationEditor";

/**
 * Edits fragment visibility, playback behavior, and entity-owned animation tracks.
 *
 * @param props - Component props.
 * @param props.fragment - Current resolved fragment.
 * @param props.onChange - Applies a fragment update.
 * @returns Fragment motion controls.
 */
export function FragmentMotionSettings({
	fragment,
	onChange,
}: {
	fragment: ResolvedTaleFragment;
	onChange: (update: (item: ResolvedTaleFragment) => TaleFragment) => void;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="FragmentMotionSettings"
			data-reader-role="fragment-motion-settings"
			className="space-y-3"
		>
			<DebugCard title="Overall visibility">
				<RangeField
					label="Base opacity"
					value={fragment.style?.opacity ?? 1}
					onChange={(opacity) =>
						onChange((item) => ({
							...item,
							style: { ...item.style, opacity },
						}))
					}
				/>
				<RangeField
					label="Visible from"
					value={fragment.visibleRange?.start ?? 0}
					onChange={(start) =>
						onChange((item) => ({
							...item,
							visibleRange: {
								end: item.visibleRange?.end ?? 1,
								start: Math.min(start, item.visibleRange?.end ?? 1),
							},
						}))
					}
				/>
				<RangeField
					label="Visible until"
					value={fragment.visibleRange?.end ?? 1}
					onChange={(end) =>
						onChange((item) => ({
							...item,
							visibleRange: {
								end: Math.max(end, item.visibleRange?.start ?? 0),
								start: item.visibleRange?.start ?? 0,
							},
						}))
					}
				/>
			</DebugCard>
			<AnimationSelectionEditor
				title="Entering"
				selection={fragment.animations.entering}
				onChange={(entering) =>
					onChange((item) => ({
						...item,
						animations: { ...item.animations, entering },
					}))
				}
			/>
			<AnimationSelectionEditor
				title="Scrolling"
				selection={fragment.animations.scrolling}
				onChange={(scrolling) =>
					onChange((item) => ({
						...item,
						animations: { ...item.animations, scrolling },
					}))
				}
			/>
			<AnimationSelectionEditor
				title="Leaving"
				selection={fragment.animations.leaving}
				onChange={(leaving) =>
					onChange((item) => ({
						...item,
						animations: { ...item.animations, leaving },
					}))
				}
			/>
			<LoopingAnimationEditor
				selection={fragment.animations.ambient}
				onChange={(ambient) =>
					onChange((item) => ({
						...item,
						animations: { ...item.animations, ambient },
					}))
				}
			/>
		</div>
	);
}

/**
 * Renders a normalized zero-to-one range field.
 *
 * @param props - Component props.
 * @param props.label - Field label.
 * @param props.onChange - Receives the next value.
 * @param props.value - Current value.
 * @returns Range number input.
 */
function RangeField({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: number) => void;
	value: number;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<input
				className={settingClassName}
				max="1"
				min="0"
				step="0.05"
				type="number"
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
		</Setting>
	);
}
