"use client";

import { useState } from "react";
import {
	DebugCard,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type { ResolvedTaleBlock } from "~/app/(tale-app)/_shared/types";
import { AnimationSelectionEditor } from "../AnimationSelectionEditor";
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
	const {
		animationPresetsById,
		setTale,
		tale,
		firstBlockTransitionMode,
		transitionFirstBlock,
		transitionPresets,
	} = useTaleAppStoreShallow((state) => ({
		animationPresetsById: state.document.tale.indexMap.animationPresetsById,
		setTale: state.document.setTale,
		tale: state.document.tale,
		firstBlockTransitionMode: state.document.tale.firstBlockTransitionMode,
		transitionFirstBlock: state.document.tale.transitionFirstBlock,
		transitionPresets: state.document.tale.structure.transitionPresets,
	}));
	const [transitionPresetId, setTransitionPresetId] = useState(
		transitionPresets[0]?.id ?? "",
	);

	return (
		<DebugCard
			componentName="BlockTransitionSettings"
			readerRole="block-transition-settings"
			title="Transition"
		>
			<div className="col-span-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
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
					className="rounded border border-foreground/12 px-3 text-foreground/65 text-xs hover:bg-foreground/8 hover:text-foreground"
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
									previousVisible:
										item.transition.animations.previousVisible,
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
				label="Entering length (auto if empty)"
				value={block.transition.enteringLength}
				onChange={(enteringLength) =>
					onChange((item) => ({
						...item,
						transition: {
							...item.transition,
							enteringLength,
						},
					}))
				}
			/>
			<MotionNumber
				label="Leaving length (auto if empty)"
				value={block.transition.leavingLength}
				onChange={(leavingLength) =>
					onChange((item) => ({
						...item,
						transition: {
							...item.transition,
							leavingLength,
							scrollLength: null,
						},
					}))
				}
			/>
			<div className="col-span-2 grid min-w-0 gap-2 rounded border border-foreground/8 bg-foreground/[0.025] p-2">
				<Setting label="Previous blocks during enter">
					<select
						className={settingClassName}
						value={
							block.transition.previousBlocksDuringEnter ===
							"customAllVisiblePrevious"
								? "customAllVisiblePrevious"
								: "keep"
						}
						onChange={(event) =>
							onChange((item) => ({
								...item,
								transition: {
									...item.transition,
									previousBlocksDuringEnter: event.target.value as
										| "customAllVisiblePrevious"
										| "keep",
								},
							}))
						}
					>
						<option value="keep">None</option>
						<option value="customAllVisiblePrevious">
							All previous blocks
						</option>
					</select>
				</Setting>
				{block.transition.previousBlocksDuringEnter ===
				"customAllVisiblePrevious" ? (
					<AnimationSelectionEditor
						title="Previous block takeover transition"
						selection={block.transition.animations.previousVisible}
						onChange={(previousVisible) =>
							onChange((item) => ({
								...item,
								transition: {
									...item.transition,
									animations: {
										...item.transition.animations,
										previousVisible,
									},
								},
							}))
						}
					/>
				) : null}
			</div>
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
			{block.position.isFirst ? (
				<Setting label="Transition first block">
					<input
						className="h-9 w-5 accent-[#d9b56f]"
						type="checkbox"
						checked={transitionFirstBlock}
						onChange={(event) => {
							setTale({
								...tale,
								transitionFirstBlock: event.target.checked,
							});
						}}
					/>
				</Setting>
			) : null}
			{block.position.isFirst && transitionFirstBlock ? (
				<Setting label="First block entrance">
					<select
						className={settingClassName}
						value={firstBlockTransitionMode}
						onChange={(event) => {
							setTale({
								...tale,
								firstBlockTransitionMode: event.target.value as
									| "fromPlacement"
									| "inPlace",
							});
						}}
					>
						<option value="fromPlacement">Move from placement direction</option>
						<option value="inPlace">Animate in place</option>
					</select>
				</Setting>
			) : null}
		</DebugCard>
	);
}
