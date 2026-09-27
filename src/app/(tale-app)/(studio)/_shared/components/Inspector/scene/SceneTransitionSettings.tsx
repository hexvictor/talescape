"use client";

import { ArrowLeftRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
	DebugCard,
	Setting,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { useTaleAppStoreShallow } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { getTaleTransitionPresets } from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	ResolvedTaleScene,
	TaleSceneSnapApproach,
	TaleSceneSnapBehavior,
	TaleSceneSnapMode,
	TaleSceneSnapSettings,
	TaleSceneSnapStrategy,
} from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import Input from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { AnimationSelectionEditor } from "../AnimationSelectionEditor";
import {
	CameraPathSettings,
	FlowSettings,
	MotionNumber,
} from "./MotionControls";
import type { BlockChangeHandler } from "./sceneMotionTypes";

/**
 * Edits transition templates, flow geometry, lengths, and snapping.
 *
 * @param props - Component props.
 * @param props.scene - Current resolved scene.
 * @param props.onChange - Applies a scene update.
 * @returns Transition controls.
 */
export function SceneTransitionSettings({
	scene,
	onChange,
}: {
	scene: ResolvedTaleScene;
	onChange: BlockChangeHandler;
}): React.JSX.Element {
	const { setTale, tale } = useTaleAppStoreShallow((state) => ({
		setTale: state.document.setTale,
		tale: state.document.tale,
	}));
	const { animationPresetsById, firstSceneTransitionMode, transitionPresets } =
		useMemo(
			() => ({
				animationPresetsById: tale.indexMap.animationPresetsById,
				firstSceneTransitionMode: tale.firstSceneTransitionMode,
				transitionPresets: getTaleTransitionPresets(tale),
			}),
			[tale],
		);
	const [transitionPresetId, setTransitionPresetId] = useState(
		transitionPresets[0]?.id ?? "",
	);

	return (
		<DebugCard
			componentName="SceneTransitionSettings"
			icon={<ArrowLeftRight size={15} />}
			readerRole="scene-transition-settings"
			title="Size and placement"
		>
			<div className="col-span-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
				<SceneTransitionSelect
					label="Official transition template"
					value={transitionPresetId}
					options={transitionPresets.map((preset) => ({
						label: preset.name,
						value: preset.id,
					}))}
					onChange={setTransitionPresetId}
				/>
				<Button
					className="h-9 px-3"
					motion="flat"
					size="sm"
					variant="outline"
					onPress={() => {
						const preset = transitionPresets.find(
							(item) => item.id === transitionPresetId,
						);
						if (!preset) return;
						onChange((item) => ({
							...item,
							transition: {
								...item.transition,
								animations: {
									intro: {
										animations: preset.enteringAnimationPresetIds.flatMap(
											(id) => animationPresetsById[id]?.tracks ?? [],
										),
									},
									outro: {
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
				</Button>
			</div>
			<FlowSettings
				flow={scene.transition.flow}
				onChange={(flow) =>
					onChange((item) => ({
						...item,
						transition: { ...item.transition, flow },
					}))
				}
			/>
			<CameraPathSettings
				path={scene.reading.cameraPath ?? { mode: "auto" }}
				onChange={(cameraPath) =>
					onChange((item) => ({
						...item,
						reading: { ...item.reading, cameraPath },
					}))
				}
			/>
			<div className="col-span-2 grid min-w-0 gap-2 rounded border border-foreground/8 bg-foreground/[0.025] p-2">
				<Checkbox
					density="compact"
					isSelected={
						scene.transition.previousScenesDuringEnter ===
						"customAllVisiblePrevious"
					}
					onChange={(isSelected) =>
						onChange((item) => ({
							...item,
							transition: {
								...item.transition,
								previousScenesDuringEnter: isSelected
									? "customAllVisiblePrevious"
									: "keep",
							},
						}))
					}
				>
					Animate previous scenes
				</Checkbox>
				{scene.transition.previousScenesDuringEnter ===
				"customAllVisiblePrevious" ? (
					<AnimationSelectionEditor
						title="Previous scene takeover transition"
						selection={scene.transition.animations.previousVisible}
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
			{scene.position.isFirst ? (
				<Setting label="Opening scene movement">
					<SceneTransitionSelect
						label="Opening scene movement"
						value={firstSceneTransitionMode ?? "fromPlacement"}
						options={[
							{
								label: "Move from placement direction",
								value: "fromPlacement",
							},
							{ label: "Animate in place", value: "inPlace" },
						]}
						onChange={(value) => {
							setTale({
								...tale,
								firstSceneTransitionMode: value as "fromPlacement" | "inPlace",
							});
						}}
					/>
				</Setting>
			) : null}
		</DebugCard>
	);
}

/**
 * Edits the scene snap mode and optional timing/capture overrides.
 *
 * @param props - Current scene and update callback.
 * @returns Snap mode and override controls.
 *
 * @example
 * <SceneSnapSettings scene={scene} onChange={commitSceneChange} />
 */
export function SceneSnapSettings({
	scene,
	onChange,
}: {
	scene: ResolvedTaleScene;
	onChange: BlockChangeHandler;
}): React.JSX.Element {
	const strategy = scene.snap.strategy ?? "shared";
	const setStrategy = (nextStrategy: TaleSceneSnapStrategy): void => {
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
		approach: TaleSceneSnapApproach | null,
		behavior: TaleSceneSnapBehavior,
	): void => {
		onChange((item) => ({
			...item,
			snap:
				approach === null
					? { ...item.snap, ...behavior, strategy: "shared" }
					: { ...item.snap, [approach]: behavior, strategy: "separate" },
		}));
	};
	const sharedBehavior: TaleSceneSnapBehavior = {
		mode: scene.snap.mode,
		settings: scene.snap.settings ?? null,
	};

	return (
		<div
			data-reader-component="SceneSnapSettings"
			data-reader-role="scene-snap-settings"
			data-studio-component="SceneSnapSettings"
			data-studio-role="scene-snap-settings"
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
					<Button
						key={value}
						aria-pressed={strategy === value}
						className="h-8 min-h-8 w-full border-0 px-2 shadow-none"
						motion="flat"
						size="sm"
						variant={strategy === value ? "default" : "ghost"}
						onPress={() => setStrategy(value)}
					>
						{value === "shared" ? "Both directions" : "Set separately"}
					</Button>
				))}
			</div>
			{strategy === "shared" ? (
				<SnapBehaviorFields
					behavior={sharedBehavior}
					description="Applied when intro this scene from either side."
					title="Shared behavior"
					onChange={(behavior) => updateBehavior(null, behavior)}
				/>
			) : (
				<div className="grid min-w-0 @xl:grid-cols-2 gap-3">
					<SnapBehaviorFields
						behavior={scene.snap.forward ?? sharedBehavior}
						description="Previous scene to this scene."
						title="Forward entry"
						onChange={(behavior) => updateBehavior("forward", behavior)}
					/>
					<SnapBehaviorFields
						behavior={scene.snap.backward ?? sharedBehavior}
						description="Next scene back to this scene."
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
	behavior: TaleSceneSnapBehavior;
	description: string;
	onChange: (behavior: TaleSceneSnapBehavior) => void;
	title: string;
}): React.JSX.Element {
	const updateSetting = (
		key: keyof TaleSceneSnapSettings,
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
				<SceneTransitionSelect
					label="Mode"
					value={behavior.mode}
					options={[
						{ label: "Scroll snap", value: "scroll-snap" },
						{ label: "Snap", value: "snap" },
						{ label: "Off", value: "snap-off" },
					]}
					onChange={(value) =>
						onChange({
							...behavior,
							mode: value as TaleSceneSnapMode,
						})
					}
				/>
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
 * Renders one optional numeric scene snap override.
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
			<Input
				aria-label={label}
				density="compact"
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

function SceneTransitionSelect({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	options: readonly { label: string; value: string }[];
	value: string;
}): React.JSX.Element {
	return (
		<Select aria-label={label} value={value} onValueChange={onChange}>
			<SelectTrigger className="w-full" density="compact">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
