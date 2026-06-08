"use client";

import { useState } from "react";
import { useReaderStoreShallow } from "../../../../contexts/ReaderStoreContext";
import type { ResolvedTaleBlock } from "../../../../types";
import {
	DebugCard,
	Setting,
	settingClassName,
} from "../../../ReaderUi/TaleDebug/DebugPrimitives";
import { FlowSettings, MotionNumber } from "./MotionControls";
import type { BlockChangeHandler } from "./blockMotionTypes";

/**
 * Edits transition templates, flow geometry, lengths, and snapping.
 *
 * @param props - Component props.
 * @param props.block - Current resolved block.
 * @param props.onChange - Applies a block update.
 * @returns Transition controls.
 */
export function BlockTransitionSettings({
	block,
	onChange,
}: {
	block: ResolvedTaleBlock;
	onChange: BlockChangeHandler;
}): React.JSX.Element {
	const { animationPresetsById, transitionPresets } = useReaderStoreShallow(
		(state) => ({
			animationPresetsById: state.tale.data.indexMap.animationPresetsById,
			transitionPresets: state.tale.data.structure.transitionPresets,
		}),
	);
	const [transitionPresetId, setTransitionPresetId] = useState(
		transitionPresets[0]?.id ?? "",
	);

	return (
		<DebugCard title="Transition">
			<div className="col-span-2 grid grid-cols-[1fr_auto] gap-2">
				<select
					aria-label="Official transition template"
					className={settingClassName}
					value={transitionPresetId}
					onChange={(event) => setTransitionPresetId(event.target.value)}
				>
					{transitionPresets.map((preset) => (
						<option key={preset.id} value={preset.id}>
							{preset.name}
						</option>
					))}
				</select>
				<button
					type="button"
					className="rounded border border-white/12 px-3 text-white/65 text-xs hover:bg-white/8 hover:text-white"
					onClick={() => {
						const preset = transitionPresets.find(
							(item) => item.id === transitionPresetId,
						);
						if (!preset) return;
						onChange((item) => ({
							...item,
							transition: {
								...item.transition,
								animations: {
									entering: {
										animations: preset.enteringAnimationPresetIds.flatMap(
											(id) => animationPresetsById[id]?.tracks ?? [],
										),
									},
									leaving: {
										animations: preset.leavingAnimationPresetIds.flatMap(
											(id) => animationPresetsById[id]?.tracks ?? [],
										),
									},
								},
								flow: structuredClone(preset.flow),
							},
						}));
					}}
				>
					Apply
				</button>
			</div>
			<FlowSettings
				flow={block.transition.flow}
				onChange={(flow) =>
					onChange((item) => ({
						...item,
						transition: { ...item.transition, flow },
					}))
				}
			/>
			<MotionNumber
				label="Entering length"
				value={block.transition.enteringLength}
				onChange={(enteringLength) =>
					onChange((item) => ({
						...item,
						transition: {
							...item.transition,
							enteringLength: enteringLength ?? 0,
						},
					}))
				}
			/>
			<MotionNumber
				label="Leaving length"
				value={block.transition.leavingLength}
				onChange={(leavingLength) =>
					onChange((item) => ({
						...item,
						transition: {
							...item.transition,
							leavingLength: leavingLength ?? 0,
							scrollLength: leavingLength ?? 0,
						},
					}))
				}
			/>
			<Setting label="Snap">
				<input
					className="h-9 w-5 accent-[#d9b56f]"
					type="checkbox"
					checked={block.snap}
					onChange={(event) =>
						onChange((item) => ({ ...item, snap: event.target.checked }))
					}
				/>
			</Setting>
		</DebugCard>
	);
}
