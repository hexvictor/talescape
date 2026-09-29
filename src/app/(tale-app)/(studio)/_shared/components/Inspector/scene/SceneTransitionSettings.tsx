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
	ResolvedTaleScene,
	TaleSceneSnapApproach,
	TaleSceneSnapBehavior,
	TaleSceneSnapMode,
	TaleSceneSnapSettings,
	TaleSceneSnapStrategy,
} from "~/app/(tale-app)/_shared/types";
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
				</button>
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
				<Setting label="Animate previous scenes">
					<input
						type="checkbox"
						checked={
							scene.transition.previousScenesDuringEnter ===
							"customAllVisiblePrevious"
						}
						onChange={(event) =>
							onChange((item) => ({
								...item,
								transition: {
									...item.transition,
									previousScenesDuringEnter: event.target.checked
										? "customAllVisiblePrevious"
										: "keep",
								},
							}))
						}
					/>
				</Setting>
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
					<select
						className={settingClassName}
						value={firstSceneTransitionMode}
						onChange={(event) => {
							setTale({
								...tale,
								firstSceneTransitionMode: event.target.value as
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
				<select
					className={settingClassName}
					value={behavior.mode}
					onChange={(event) =>
						onChange({
							...behavior,
							mode: event.target.value as TaleSceneSnapMode,
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
