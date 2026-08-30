"use client";

import { ArrowLeftRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
	DebugCard,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { getTaleTransitionPresets } from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	ResolvedTaleBlock,
	TaleBlockSnapApproach,
	TaleBlockSnapBehavior,
	TaleBlockSnapMode,
	TaleBlockSnapSettings,
	TaleBlockSnapStrategy,
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
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const { animationPresetsById, firstBlockTransitionMode, transitionPresets } =
		useMemo(
			() => ({
				animationPresetsById: tale.indexMap.animationPresetsById,
				firstBlockTransitionMode: tale.firstBlockTransitionMode,
				transitionPresets: getTaleTransitionPresets(tale),
			}),
			[tale],
		);
	const [transitionPresetId, setTransitionPresetId] = useState(
		transitionPresets[0]?.id ?? "",
	);

	return (
		<DebugCard
			componentName="BlockTransitionSettings"
			icon={<ArrowLeftRight size={15} />}
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
	const strategy = block.snap.strategy ?? "shared";
	const setStrategy = (nextStrategy: TaleBlockSnapStrategy): void => {
		onChange((item) => ({
			...item,
			snap: {
				...item.snap,
				backward:
					nextStrategy === "separate"
						? (item.snap.backward ?? {
								mode: item.snap.mode,
								settings: item.snap.settings ?? null,
							})
						: item.snap.backward,
				direction: undefined,
				forward:
					nextStrategy === "separate"
						? (item.snap.forward ?? {
								mode: item.snap.mode,
								settings: item.snap.settings ?? null,
							})
						: item.snap.forward,
				strategy: nextStrategy,
			},
		}));
	};
	const updateBehavior = (
		approach: TaleBlockSnapApproach | null,
		behavior: TaleBlockSnapBehavior,
	): void => {
		onChange((item) => ({
			...item,
			snap:
				approach === null
					? { ...item.snap, ...behavior, strategy: "shared" }
					: { ...item.snap, [approach]: behavior, strategy: "separate" },
		}));
	};
	const sharedBehavior: TaleBlockSnapBehavior = {
		mode: block.snap.mode,
		settings: block.snap.settings ?? null,
	};

	return (
		<div
			data-reader-component="BlockSnapSettings"
			data-reader-role="block-snap-settings"
			className="col-span-2 grid min-w-0 gap-3 border border-foreground/12 bg-background/45 p-3"
		>
			<div>
				<p className="font-semibold text-foreground/75 text-xs uppercase">
					Entry behavior
				</p>
				<p className="mt-1 text-[0.68rem] text-foreground/48 leading-4">
					Use one behavior in both directions or configure forward and backward
					entry independently.
				</p>
			</div>
			<div className="grid grid-cols-2 border border-foreground/15 p-0.5">
				{(["shared", "separate"] as const).map((value) => (
					<button
						key={value}
						type="button"
						aria-pressed={strategy === value}
						className={`min-h-8 px-2 font-semibold text-xs uppercase transition-colors ${
							strategy === value
								? "bg-primary text-primary-foreground"
								: "text-foreground/55 hover:bg-foreground/8 hover:text-foreground"
						}`}
						onClick={() => setStrategy(value)}
					>
						{value === "shared" ? "Both directions" : "Set separately"}
					</button>
				))}
			</div>
			{strategy === "shared" ? (
				<SnapBehaviorFields
					behavior={sharedBehavior}
					description="Applied when entering this block from either side."
					title="Shared behavior"
					onChange={(behavior) => updateBehavior(null, behavior)}
				/>
			) : (
				<div className="grid min-w-0 @xl:grid-cols-2 gap-3">
					<SnapBehaviorFields
						behavior={block.snap.forward ?? sharedBehavior}
						description="Previous block to this block."
						title="Forward entry"
						onChange={(behavior) => updateBehavior("forward", behavior)}
					/>
					<SnapBehaviorFields
						behavior={block.snap.backward ?? sharedBehavior}
						description="Next block back to this block."
						title="Backward entry"
						onChange={(behavior) => updateBehavior("backward", behavior)}
					/>
				</div>
			)}
		</div>
	);
}

function SnapBehaviorFields({
	behavior,
	description,
	onChange,
	title,
}: {
	behavior: TaleBlockSnapBehavior;
	description: string;
	onChange: (behavior: TaleBlockSnapBehavior) => void;
	title: string;
}): React.JSX.Element {
	const updateSetting = (
		key: keyof TaleBlockSnapSettings,
		value: number | null,
	): void => {
		onChange({
			...behavior,
			settings: { ...(behavior.settings ?? {}), [key]: value },
		});
	};

	return (
		<section className="grid min-w-0 grid-cols-2 gap-2 border border-foreground/10 bg-foreground/[0.025] p-2">
			<div className="col-span-2">
				<p className="font-semibold text-foreground/78 text-xs uppercase">
					{title}
				</p>
				<p className="mt-0.5 text-[0.65rem] text-foreground/45">
					{description}
				</p>
			</div>
			<Setting label="Mode">
				<select
					className={settingClassName}
					value={behavior.mode}
					onChange={(event) =>
						onChange({
							...behavior,
							mode: event.target.value as TaleBlockSnapMode,
						})
					}
				>
					<option value="scroll-snap">Scroll snap</option>
					<option value="snap">Snap</option>
					<option value="snap-off">Off</option>
				</select>
			</Setting>
			<div className="self-end pb-1 text-[0.62rem] text-foreground/42 leading-4">
				{behavior.mode === "scroll-snap"
					? "Settles after transition intent."
					: behavior.mode === "snap"
						? "Commits immediately at transition entry."
						: "Free movement in this direction."}
			</div>
			{behavior.mode === "scroll-snap" ? (
				<>
					<SnapOverrideNumber
						label="Capture px"
						value={behavior.settings?.captureDistancePx ?? null}
						onChange={(value) => updateSetting("captureDistancePx", value)}
					/>
					<SnapOverrideNumber
						label="Viewport fraction"
						step={0.01}
						value={behavior.settings?.minViewportFraction ?? null}
						onChange={(value) => updateSetting("minViewportFraction", value)}
					/>
				</>
			) : null}
			{behavior.mode !== "snap-off" ? (
				<>
					<SnapOverrideNumber
						label="Delay ms"
						value={behavior.settings?.delayMs ?? null}
						onChange={(value) => updateSetting("delayMs", value)}
					/>
					<SnapOverrideNumber
						label="Duration seconds"
						step={0.01}
						value={behavior.settings?.durationSeconds ?? null}
						onChange={(value) => updateSetting("durationSeconds", value)}
					/>
				</>
			) : null}
		</section>
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
