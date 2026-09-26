"use client";

import { Trash2 } from "lucide-react";
import { Setting } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type {
	AnimationEasing,
	AnimationTrack,
} from "~/app/(tale-app)/_shared/types";
import { Button } from "~/components/ui/button";
import Input from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import Textarea from "~/components/ui/textarea";

export function AnimationTrackFields({
	lockFromValues = false,
	onChange,
	onRemove,
	timingMode,
	track,
}: {
	lockFromValues?: boolean;
	onChange: (track: AnimationTrack) => void;
	onRemove: () => void;
	timingMode: "hover" | "loop" | "timeline";
	track: AnimationTrack;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="AnimationTrackEditor"
			data-reader-role="animation-track-settings"
			className="col-span-2 space-y-3 rounded border border-foreground/8 bg-foreground/[0.025] p-3"
		>
			<div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
				<TrackSelect
					label="Property"
					options={[
						["opacity", "Opacity"],
						["translate", "Translate"],
						["scale", "Scale"],
						["rotate", "Rotate"],
						["blur", "Blur"],
						["motionPath", "Motion path"],
					]}
					value={track.property}
					onChange={(property) =>
						onChange(
							changeTrackProperty(
								track,
								property as AnimationTrack["property"],
								timingMode,
							),
						)
					}
				/>
				<Button
					type="button"
					aria-label="Remove animation track"
					className="size-9 text-destructive"
					motion="flat"
					size="icon"
					variant="ghost"
					onClick={onRemove}
				>
					<Trash2 size={14} />
				</Button>
			</div>
			{timingMode !== "hover" ? (
				<TrackFieldSection
					title={timingMode === "timeline" ? "Timing" : "Loop"}
				>
					{timingMode === "timeline" ? (
						<>
							<TrackSelect
								label="Playback"
								options={[
									["scrub", "Follow scroll"],
									["commitOnComplete", "Keep completed state"],
								]}
								value={track.playback ?? "scrub"}
								onChange={(playback) =>
									onChange({
										...track,
										playback: playback as AnimationTrack["playback"],
									})
								}
							/>
							<TrackPercent
								label="Start"
								value={track.start}
								onChange={(start) => onChange({ ...track, start })}
							/>
							<TrackPercent
								label="End"
								value={track.end}
								onChange={(end) => onChange({ ...track, end })}
							/>
						</>
					) : (
						<>
							<TrackNumber
								label="Duration (seconds)"
								value={track.loopDurationSeconds ?? 2.4}
								onChange={(loopDurationSeconds) =>
									onChange({
										...track,
										loopDurationSeconds: Math.max(loopDurationSeconds, 0.1),
									})
								}
							/>
							<TrackSelect
								label="Direction"
								options={[
									["alternate", "Alternate"],
									["restart", "Restart"],
								]}
								value={track.loopPlayback ?? "alternate"}
								onChange={(loopPlayback) =>
									onChange({
										...track,
										loopPlayback: loopPlayback as "alternate" | "restart",
									})
								}
							/>
						</>
					)}
				</TrackFieldSection>
			) : null}
			{timingMode !== "hover" ? (
				<TrackFieldSection title="Visibility">
					<TrackPercent
						label="Visible from"
						value={track.visibleRange?.start ?? 0}
						onChange={(start) =>
							onChange({
								...track,
								visibleRange: {
									end: Math.max(start, track.visibleRange?.end ?? 1),
									start,
								},
							})
						}
					/>
					<TrackPercent
						label="Visible until"
						value={track.visibleRange?.end ?? 1}
						onChange={(end) =>
							onChange({
								...track,
								visibleRange: {
									end,
									start: Math.min(end, track.visibleRange?.start ?? 0),
								},
							})
						}
					/>
				</TrackFieldSection>
			) : null}
			<TrackFieldSection title="Values">
				{track.property === "translate" ? (
					<>
						<TrackSelect
							label="Axes"
							options={[
								["x", "X"],
								["y", "Y"],
								["xy", "X and Y"],
								["xyz", "X, Y and Z"],
							]}
							value={track.axis}
							onChange={(axis) =>
								onChange({
									...track,
									axis: axis as "x" | "xy" | "xyz" | "y",
								})
							}
						/>
						<TrackSelect
							label="Unit"
							options={[
								["px", "Pixels"],
								["viewport", "Viewport spans"],
							]}
							value={track.unit ?? "px"}
							onChange={(unit) =>
								onChange({
									...track,
									unit: unit as "px" | "viewport",
								})
							}
						/>
					</>
				) : null}
				{"from" in track ? (
					<>
						{track.property === "opacity" ? (
							<TrackPercent
								disabled={lockFromValues}
								label={lockFromValues ? "From previous phase" : "From opacity"}
								value={track.from}
								onChange={(from) => onChange({ ...track, from })}
							/>
						) : (
							<TrackNumber
								disabled={lockFromValues}
								label={
									track.property === "translate"
										? track.axis === "y"
											? "From Y"
											: "From X"
										: "From"
								}
								value={track.from}
								onChange={(from) => onChange({ ...track, from })}
							/>
						)}
						{track.property === "opacity" ? (
							<TrackPercent
								label="To opacity"
								value={track.to}
								onChange={(to) => onChange({ ...track, to })}
							/>
						) : (
							<TrackNumber
								label={
									track.property === "translate"
										? track.axis === "y"
											? "To Y"
											: "To X"
										: "To"
								}
								value={track.to}
								onChange={(to) => onChange({ ...track, to })}
							/>
						)}
					</>
				) : (
					<TrackNumber
						label="Strength"
						value={track.strength}
						onChange={(strength) => onChange({ ...track, strength })}
					/>
				)}
				{track.property === "translate" &&
				(track.axis === "xy" || track.axis === "xyz") ? (
					<>
						<TrackNumber
							disabled={lockFromValues}
							label="From Y"
							value={track.fromY ?? 0}
							onChange={(fromY) => onChange({ ...track, fromY })}
						/>
						<TrackNumber
							label="To Y"
							value={track.toY ?? 0}
							onChange={(toY) => onChange({ ...track, toY })}
						/>
					</>
				) : null}
				{track.property === "translate" && track.axis === "xyz" ? (
					<>
						<TrackNumber
							disabled={lockFromValues}
							label="From Z"
							value={track.fromZ ?? 0}
							onChange={(fromZ) => onChange({ ...track, fromZ })}
						/>
						<TrackNumber
							label="To Z"
							value={track.toZ ?? 0}
							onChange={(toZ) => onChange({ ...track, toZ })}
						/>
					</>
				) : null}
				{track.property === "motionPath" ? (
					<div className="@min-[28rem]/track-section:col-span-2">
						<Setting label="SVG path">
							<Textarea
								aria-label="SVG path"
								density="compact"
								value={track.path}
								onChange={(event) =>
									onChange({ ...track, path: event.target.value })
								}
							/>
						</Setting>
					</div>
				) : null}
			</TrackFieldSection>
			<TrackFieldSection title="Curve">
				<TrackSelect
					label="Easing"
					options={[
						["linear", "Linear"],
						["power1.in", "Power 1 in"],
						["power1.out", "Power 1 out"],
						["power1.inOut", "Power 1 in/out"],
						["power2.in", "Power 2 in"],
						["power2.out", "Power 2 out"],
						["power2.inOut", "Power 2 in/out"],
						["power3.in", "Power 3 in"],
						["power3.out", "Power 3 out"],
						["power3.inOut", "Power 3 in/out"],
						["back.out", "Back out"],
						["elastic.out", "Elastic out"],
						["bounce.out", "Bounce out"],
					]}
					value={track.easing ?? "power2.out"}
					onChange={(easing) =>
						onChange({ ...track, easing: easing as AnimationEasing })
					}
				/>
			</TrackFieldSection>
		</div>
	);
}

/**
 * Groups related animation controls under a compact section heading.
 *
 * @param props - Component props.
 * @param props.children - Controls rendered in the section grid.
 * @param props.title - Visible section heading.
 * @returns Grouped animation controls.
 */
function TrackFieldSection({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}): React.JSX.Element {
	return (
		<fieldset className="@container/track-section grid min-w-0 @min-[28rem]/track-section:grid-cols-2 grid-cols-1 gap-2 rounded border border-foreground/7 p-2">
			<legend className="px-1 font-medium text-[10px] text-foreground/42 uppercase tracking-wide">
				{title}
			</legend>
			{children}
		</fieldset>
	);
}

function TrackSelect({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	options: Array<readonly [string, string]>;
	value: string;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<Select aria-label={label} value={value} onValueChange={onChange}>
				<SelectTrigger className="w-full" density="compact">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map(([optionValue, optionLabel]) => (
						<SelectItem key={optionValue} value={optionValue}>
							{optionLabel}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</Setting>
	);
}

/**
 * Renders a numeric track field.
 *
 * @param props - Component props.
 * @param props.label - Field label.
 * @param props.onChange - Receives the numeric value.
 * @param props.value - Current value.
 * @returns Numeric track input.
 */
function TrackNumber({
	disabled = false,
	label,
	max,
	min,
	onChange,
	value,
}: {
	disabled?: boolean;
	label: string;
	max?: number;
	min?: number;
	onChange: (value: number) => void;
	value: number;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<Input
				aria-label={label}
				density="compact"
				disabled={disabled}
				max={max}
				min={min}
				step="0.05"
				type="number"
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
		</Setting>
	);
}

function TrackPercent({
	disabled = false,
	label,
	onChange,
	value,
}: {
	disabled?: boolean;
	label: string;
	onChange: (value: number) => void;
	value: number;
}): React.JSX.Element {
	return (
		<Slider
			density="compact"
			formatOptions={{ style: "percent" }}
			isDisabled={disabled}
			label={label}
			maxValue={1}
			minValue={0}
			step={0.01}
			value={value}
			onChange={onChange}
		/>
	);
}

/**
 * Creates a valid default track for the selected animation property.
 *
 * @param property - Animation property.
 * @returns A default editable track.
 */
function createTrack(property: AnimationTrack["property"]): AnimationTrack {
	if (property === "translate") {
		return {
			axis: "y",
			easing: "power2.out",
			end: 1,
			from: 40,
			property,
			start: 0,
			to: 0,
			unit: "px",
		};
	}
	if (property === "motionPath") {
		return {
			easing: "power2.out",
			end: 1,
			from: 0,
			path: "M 0 0 C 100 0 100 100 200 100",
			property,
			start: 0,
			to: 1,
		};
	}
	if (property === "blur") {
		return {
			easing: "power2.out",
			end: 1,
			property,
			start: 0,
			strength: 10,
		};
	}
	return {
		easing: "power2.out",
		end: 1,
		from: property === "scale" ? 0.8 : 0,
		property,
		start: 0,
		to: property === "scale" ? 1 : 1,
	};
}

/**
 * Changes a track property while retaining its identity and timing behavior.
 *
 * @param track - Existing animation track.
 * @param property - Next animation property.
 * @param timingMode - Timeline or repeating editor mode.
 * @returns Property-compatible animation track with preserved metadata.
 */
function changeTrackProperty(
	track: AnimationTrack,
	property: AnimationTrack["property"],
	timingMode: "hover" | "loop" | "timeline",
): AnimationTrack {
	const next = createTrack(property);
	return {
		...next,
		easing: track.easing,
		end: timingMode === "loop" ? 1 : track.end,
		id: track.id ?? createAnimationTrackId(),
		loopDurationSeconds: track.loopDurationSeconds,
		loopPlayback: track.loopPlayback,
		playback:
			timingMode === "timeline" ? (track.playback ?? "scrub") : undefined,
		start: timingMode === "timeline" ? track.start : 0,
		visibleRange:
			timingMode === "hover"
				? undefined
				: (track.visibleRange ?? { end: 1, start: 0 }),
	} as AnimationTrack;
}

/**
 * Creates a stable client-side identifier for one authored animation track.
 *
 * @returns Unique animation track identifier.
 */
export function createAnimationTrackId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `animation-${Date.now()}`;
}
