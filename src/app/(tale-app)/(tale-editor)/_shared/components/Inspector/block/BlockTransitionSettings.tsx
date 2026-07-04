"use client";

import { useState } from "react";
import {
	DebugCard,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type {
	ResolvedTaleBlock,
	TaleBlockSnapMode,
	TaleBlockSnapSettings,
} from "~/app/(tale-app)/_shared/types";
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
									previousVisible: item.transition.animations.previousVisible,
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
			<BlockSnapSettings block={block} onChange={onChange} />
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

/**
 * Edits the block snap mode and optional timing/capture overrides.
 *
 * @param props - Current block and update callback.
 * @returns Snap mode and override controls.
 *
 * @example
 * <BlockSnapSettings block={block} onChange={commitBlockChange} />
 */
function BlockSnapSettings({
	block,
	onChange,
}: {
	block: ResolvedTaleBlock;
	onChange: BlockChangeHandler;
}): React.JSX.Element {
	const updateSnapSettings = (
		key: keyof TaleBlockSnapSettings,
		value: number | null,
	): void => {
		onChange((item) => ({
			...item,
			snap: {
				...item.snap,
				settings: {
					...(item.snap.settings ?? {}),
					[key]: value,
				},
			},
		}));
	};

	return (
		<div
			data-reader-component="BlockSnapSettings"
			data-reader-role="block-snap-settings"
			className="col-span-2 grid grid-cols-2 gap-2 rounded border border-foreground/8 bg-foreground/[0.025] p-2"
		>
			<Setting label="Snap mode">
				<select
					className={settingClassName}
					value={block.snap.mode}
					onChange={(event) =>
						onChange((item) => ({
							...item,
							snap: {
								...item.snap,
								mode: event.target.value as TaleBlockSnapMode,
							},
						}))
					}
				>
					<option value="scroll-snap">Scroll snap</option>
					<option value="snap">Snap</option>
					<option value="snap-off">Snap off</option>
				</select>
			</Setting>
			<div className="rounded border border-foreground/8 bg-background/30 p-2 text-[0.68rem] text-foreground/45 leading-4">
				{block.snap.mode === "scroll-snap"
					? "Captures nearby block starts and ends after free scrolling."
					: block.snap.mode === "snap"
						? "Free inside the block, then snaps at transition boundaries."
						: "This block does not create snap targets."}
			</div>
			<SnapOverrideNumber
				label="Capture px"
				value={block.snap.settings?.captureDistancePx ?? null}
				onChange={(value) => updateSnapSettings("captureDistancePx", value)}
			/>
			<SnapOverrideNumber
				label="Min viewport fraction"
				step={0.01}
				value={block.snap.settings?.minViewportFraction ?? null}
				onChange={(value) => updateSnapSettings("minViewportFraction", value)}
			/>
			<SnapOverrideNumber
				label="Delay ms"
				value={block.snap.settings?.delayMs ?? null}
				onChange={(value) => updateSnapSettings("delayMs", value)}
			/>
			<SnapOverrideNumber
				label="Duration seconds"
				step={0.01}
				value={block.snap.settings?.durationSeconds ?? null}
				onChange={(value) => updateSnapSettings("durationSeconds", value)}
			/>
		</div>
	);
}

/**
 * Renders one optional numeric block snap override.
 *
 * @param props - Label, numeric value, step, and update callback.
 * @returns Optional number input that stores null when empty.
 *
 * @example
 * <SnapOverrideNumber label="Delay" value={null} onChange={setDelay} />
 */
function SnapOverrideNumber({
	label,
	onChange,
	step = 1,
	value,
}: {
	label: string;
	onChange: (value: number | null) => void;
	step?: number;
	value: number | null;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<input
				className={settingClassName}
				min={0}
				placeholder="Global"
				step={step}
				type="number"
				value={value ?? ""}
				onChange={(event) => {
					if (event.target.value === "") {
						onChange(null);
						return;
					}
					const nextValue = Number(event.target.value);
					if (Number.isFinite(nextValue)) onChange(nextValue);
				}}
			/>
		</Setting>
	);
}
