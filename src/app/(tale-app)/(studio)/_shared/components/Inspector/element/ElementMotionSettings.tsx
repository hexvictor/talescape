"use client";

import {
	ArrowDownToLine,
	ArrowLeftRight,
	ArrowUpFromLine,
	Eye,
	MousePointer2,
	Repeat,
} from "lucide-react";
import {
	DebugCard,
	Setting,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type {
	ResolvedTaleElement,
	TaleElement,
	TaleFrame,
} from "~/app/(tale-app)/_shared/types";
import { AnimationSelectionEditor } from "../AnimationSelectionEditor";
import { HoverAnimationEditor } from "../HoverAnimationEditor";
import {
	LoopingAnimationEditor,
	LoopingAnimationsGroup,
} from "../LoopingAnimationEditor";

/**
 * Edits element visibility, playback behavior, and entity-owned animation tracks.
 *
 * @param props - Component props.
 * @param props.element - Current resolved element.
 * @param props.onChange - Applies a element update.
 * @returns Element motion controls.
 */
export function ElementMotionSettings({
	defaultState,
	element,
	onChange,
	onDefaultStateChange,
	parentFrame,
	phaseFrame,
}: {
	defaultState: "active" | "inactive";
	element: ResolvedTaleElement;
	onChange: (update: (item: ResolvedTaleElement) => TaleElement) => void;
	onDefaultStateChange: (state: "active" | "inactive") => void;
	parentFrame?: TaleFrame;
	phaseFrame?: TaleFrame;
}): React.JSX.Element {
	const parentAllowsSceneIntro =
		parentFrame?.visibleDuringSceneIntro === true ||
		parentFrame?.visibleBeforeIntro === true;
	const parentAllowsSceneOutro = parentFrame?.visibleDuringSceneOutro === true;
	const parentAllowsPreviousBridge =
		parentFrame?.visibleDuringPreviousBridge === true;
	const parentAllowsNextBridge = parentFrame?.visibleDuringNextBridge === true;
	const parentAllowsFrameIntro = phaseFrame?.transition?.introEnabled === true;
	const parentAllowsFrameOutro = phaseFrame?.transition?.outroEnabled === true;
	const parentAllowsPreviousFrameBridge =
		phaseFrame?.transition?.previousBridgeEnabled === true;
	const parentAllowsNextFrameBridge =
		phaseFrame?.transition?.nextBridgeEnabled === true;
	return (
		<div
			data-reader-component="ElementMotionSettings"
			data-reader-role="element-motion-settings"
			className="space-y-3"
		>
			<DebugCard icon={<Eye size={15} />} title="Overall visibility">
				<RangeField
					label="Base opacity"
					value={element.style?.opacity ?? 1}
					onChange={(opacity) =>
						onChange((item) => ({
							...item,
							style: { ...item.style, opacity },
						}))
					}
				/>
				<RangeField
					label="Visible from"
					value={element.visibleRange?.start ?? 0}
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
					value={element.visibleRange?.end ?? 1}
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
				<label className="col-span-2 grid gap-1 font-bold text-[9px] text-foreground/48 uppercase">
					Default state
					<select
						className="h-8 min-w-0 border border-foreground bg-background px-2 text-foreground text-xs"
						value={defaultState}
						onChange={(event) =>
							onDefaultStateChange(event.target.value as "active" | "inactive")
						}
					>
						<option value="inactive">Inactive</option>
						<option value="active">Active</option>
					</select>
				</label>
			</DebugCard>
			{parentAllowsFrameIntro ? (
				<PhaseVisibilityToggle
					checked={element.visibleDuringFrameIntro ?? false}
					label="Show during Frame intro transition"
					onChange={(visibleDuringFrameIntro) =>
						onChange((item) => ({ ...item, visibleDuringFrameIntro }))
					}
				/>
			) : null}
			{parentAllowsFrameIntro && element.visibleDuringFrameIntro ? (
				<AnimationSelectionEditor
					icon={<ArrowDownToLine size={15} />}
					title="Frame intro transitions"
					selection={element.animations.frameIntro ?? { animations: [] }}
					onChange={(frameIntro) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, frameIntro },
						}))
					}
				/>
			) : null}
			{parentAllowsPreviousFrameBridge ? (
				<PhaseVisibilityToggle
					checked={element.visibleDuringPreviousFrameBridge ?? false}
					label="Show during previous Frame bridge"
					onChange={(visibleDuringPreviousFrameBridge) =>
						onChange((item) => ({
							...item,
							visibleDuringPreviousFrameBridge,
						}))
					}
				/>
			) : null}
			{parentAllowsPreviousFrameBridge &&
			element.visibleDuringPreviousFrameBridge ? (
				<AnimationSelectionEditor
					icon={<ArrowLeftRight size={15} />}
					title="Previous Frame bridge transitions"
					selection={
						element.animations.previousFrameBridge ?? { animations: [] }
					}
					onChange={(previousFrameBridge) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, previousFrameBridge },
						}))
					}
				/>
			) : null}
			{parentAllowsFrameOutro ? (
				<PhaseVisibilityToggle
					checked={element.visibleDuringFrameOutro ?? false}
					label="Show during Frame outro transition"
					onChange={(visibleDuringFrameOutro) =>
						onChange((item) => ({ ...item, visibleDuringFrameOutro }))
					}
				/>
			) : null}
			{parentAllowsFrameOutro && element.visibleDuringFrameOutro ? (
				<AnimationSelectionEditor
					icon={<ArrowUpFromLine size={15} />}
					title="Frame outro transitions"
					selection={element.animations.frameOutro ?? { animations: [] }}
					onChange={(frameOutro) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, frameOutro },
						}))
					}
				/>
			) : null}
			{parentAllowsNextFrameBridge ? (
				<PhaseVisibilityToggle
					checked={element.visibleDuringNextFrameBridge ?? false}
					label="Show during next Frame bridge"
					onChange={(visibleDuringNextFrameBridge) =>
						onChange((item) => ({
							...item,
							visibleDuringNextFrameBridge,
						}))
					}
				/>
			) : null}
			{parentAllowsNextFrameBridge && element.visibleDuringNextFrameBridge ? (
				<AnimationSelectionEditor
					icon={<ArrowLeftRight size={15} />}
					title="Next Frame bridge transitions"
					selection={element.animations.nextFrameBridge ?? { animations: [] }}
					onChange={(nextFrameBridge) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, nextFrameBridge },
						}))
					}
				/>
			) : null}
			{parentAllowsSceneIntro ? (
				<label className="flex items-center justify-between gap-3 border border-foreground/20 p-3 text-xs">
					Show during opening transition
					<input
						type="checkbox"
						checked={element.visibleDuringSceneIntro ?? false}
						onChange={(event) =>
							onChange((item) => ({
								...item,
								visibleDuringSceneIntro: event.target.checked,
							}))
						}
					/>
				</label>
			) : null}
			{parentAllowsPreviousBridge ? (
				<label className="flex items-center justify-between gap-3 border border-foreground/20 p-3 text-xs">
					Show during previous Scene bridge transition
					<input
						type="checkbox"
						checked={element.visibleDuringPreviousBridge ?? false}
						onChange={(event) =>
							onChange((item) => ({
								...item,
								visibleDuringPreviousBridge: event.target.checked,
							}))
						}
					/>
				</label>
			) : null}
			{parentAllowsPreviousBridge && element.visibleDuringPreviousBridge ? (
				<AnimationSelectionEditor
					icon={<ArrowLeftRight size={15} />}
					title="Previous Scene bridge transitions"
					selection={element.animations.previousBridge ?? { animations: [] }}
					onChange={(previousBridge) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, previousBridge },
						}))
					}
				/>
			) : null}
			{parentAllowsSceneIntro && element.visibleDuringSceneIntro ? (
				<AnimationSelectionEditor
					icon={<ArrowDownToLine size={15} />}
					title="Opening transitions"
					selection={element.animations.sceneIntro ?? { animations: [] }}
					onChange={(sceneIntro) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, sceneIntro },
						}))
					}
				/>
			) : null}
			{parentAllowsSceneOutro ? (
				<label className="flex items-center justify-between gap-3 border border-foreground/20 p-3 text-xs">
					Show during Scene outro transition
					<input
						type="checkbox"
						checked={element.visibleDuringSceneOutro ?? false}
						onChange={(event) =>
							onChange((item) => ({
								...item,
								visibleDuringSceneOutro: event.target.checked,
							}))
						}
					/>
				</label>
			) : null}
			{parentAllowsSceneOutro && element.visibleDuringSceneOutro ? (
				<AnimationSelectionEditor
					icon={<ArrowUpFromLine size={15} />}
					title="Scene outro transitions"
					selection={element.animations.sceneOutro ?? { animations: [] }}
					onChange={(sceneOutro) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, sceneOutro },
						}))
					}
				/>
			) : null}
			{parentAllowsNextBridge ? (
				<label className="flex items-center justify-between gap-3 border border-foreground/20 p-3 text-xs">
					Show during next Scene bridge transition
					<input
						type="checkbox"
						checked={element.visibleDuringNextBridge ?? false}
						onChange={(event) =>
							onChange((item) => ({
								...item,
								visibleDuringNextBridge: event.target.checked,
							}))
						}
					/>
				</label>
			) : null}
			{parentAllowsNextBridge && element.visibleDuringNextBridge ? (
				<AnimationSelectionEditor
					icon={<ArrowLeftRight size={15} />}
					title="Next Scene bridge transitions"
					selection={element.animations.nextBridge ?? { animations: [] }}
					onChange={(nextBridge) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, nextBridge },
						}))
					}
				/>
			) : null}
			<AnimationSelectionEditor
				icon={<ArrowDownToLine size={15} />}
				title="Intro transitions"
				selection={element.animations.intro}
				onChange={(intro) =>
					onChange((item) => ({
						...item,
						animations: { ...item.animations, intro },
					}))
				}
			/>
			<AnimationSelectionEditor
				icon={<MousePointer2 size={15} />}
				inheritsPreviousState={
					element.animations.intro.carryEndStateForward ?? false
				}
				title="Active transitions"
				selection={element.animations.active}
				onChange={(active) =>
					onChange((item) => ({
						...item,
						animations: { ...item.animations, active },
					}))
				}
			/>
			<AnimationSelectionEditor
				icon={<ArrowUpFromLine size={15} />}
				inheritsPreviousState={
					element.animations.active.carryEndStateForward ?? false
				}
				title="Outro transitions"
				selection={element.animations.outro}
				onChange={(outro) =>
					onChange((item) => ({
						...item,
						animations: { ...item.animations, outro },
					}))
				}
			/>
			<LoopingAnimationsGroup>
				<LoopingAnimationEditor
					title="General looping animation"
					selection={element.animations.ambient}
					onChange={(ambient) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, ambient },
						}))
					}
				/>
				{parentAllowsPreviousFrameBridge &&
				element.visibleDuringPreviousFrameBridge ? (
					<LoopingAnimationEditor
						icon={<ArrowLeftRight size={15} />}
						title="Previous Frame bridge looping animation"
						selection={
							element.animations.previousFrameBridgeLoop ?? emptyLoop()
						}
						onChange={(previousFrameBridgeLoop) =>
							onChange((item) => ({
								...item,
								animations: {
									...item.animations,
									previousFrameBridgeLoop,
								},
							}))
						}
					/>
				) : null}
				{parentAllowsPreviousBridge && element.visibleDuringPreviousBridge ? (
					<LoopingAnimationEditor
						icon={<ArrowLeftRight size={15} />}
						title="Previous Scene bridge looping animation"
						selection={element.animations.previousBridgeLoop ?? emptyLoop()}
						onChange={(previousBridgeLoop) =>
							onChange((item) => ({
								...item,
								animations: { ...item.animations, previousBridgeLoop },
							}))
						}
					/>
				) : null}
				<LoopingAnimationEditor
					icon={<ArrowDownToLine size={15} />}
					title="Intro looping animation"
					selection={element.animations.introLoop ?? emptyLoop()}
					onChange={(introLoop) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, introLoop },
						}))
					}
				/>
				{parentAllowsNextFrameBridge && element.visibleDuringNextFrameBridge ? (
					<LoopingAnimationEditor
						icon={<ArrowLeftRight size={15} />}
						title="Next Frame bridge looping animation"
						selection={element.animations.nextFrameBridgeLoop ?? emptyLoop()}
						onChange={(nextFrameBridgeLoop) =>
							onChange((item) => ({
								...item,
								animations: {
									...item.animations,
									nextFrameBridgeLoop,
								},
							}))
						}
					/>
				) : null}
				{parentAllowsNextBridge && element.visibleDuringNextBridge ? (
					<LoopingAnimationEditor
						icon={<ArrowLeftRight size={15} />}
						title="Next Scene bridge looping animation"
						selection={element.animations.nextBridgeLoop ?? emptyLoop()}
						onChange={(nextBridgeLoop) =>
							onChange((item) => ({
								...item,
								animations: { ...item.animations, nextBridgeLoop },
							}))
						}
					/>
				) : null}
				<LoopingAnimationEditor
					icon={<Repeat size={15} />}
					title="Active looping animation"
					selection={element.animations.activeLoop ?? emptyLoop()}
					onChange={(activeLoop) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, activeLoop },
						}))
					}
				/>
				<LoopingAnimationEditor
					icon={<ArrowUpFromLine size={15} />}
					title="Outro looping animation"
					selection={element.animations.outroLoop ?? emptyLoop()}
					onChange={(outroLoop) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, outroLoop },
						}))
					}
				/>
				<HoverAnimationEditor
					selection={
						element.animations.hover ?? { animations: [], durationSeconds: 0.2 }
					}
					onChange={(hover) =>
						onChange((item) => ({
							...item,
							animations: { ...item.animations, hover },
						}))
					}
				/>
			</LoopingAnimationsGroup>
		</div>
	);
}

function PhaseVisibilityToggle({
	checked,
	label,
	onChange,
}: {
	checked: boolean;
	label: string;
	onChange: (checked: boolean) => void;
}): React.JSX.Element {
	return (
		<label className="flex items-center justify-between gap-3 border border-foreground/20 p-3 text-xs">
			{label}
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
			/>
		</label>
	);
}

function emptyLoop() {
	return {
		animations: [],
		cycleDurationMs: 2400,
		playback: "alternate" as const,
	};
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
			<div className="flex h-9 items-center gap-2 border border-foreground/12 bg-background px-2">
				<input
					aria-label={label}
					className="min-w-0 flex-1 accent-primary"
					max="100"
					min="0"
					step="1"
					type="range"
					value={Math.round(value * 100)}
					onChange={(event) => onChange(Number(event.target.value) / 100)}
				/>
				<output className="w-10 text-right font-semibold text-[10px] text-foreground/55">
					{Math.round(value * 100)}%
				</output>
			</div>
		</Setting>
	);
}
