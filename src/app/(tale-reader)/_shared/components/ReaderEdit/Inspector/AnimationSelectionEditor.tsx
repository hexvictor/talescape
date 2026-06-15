"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useReaderStoreShallow } from "../../../contexts/ReaderStoreContext";
import type {
	AnimationEasing,
	AnimationSelection,
	AnimationTrack,
} from "../../../types";
import {
	DebugCard,
	Setting,
	settingClassName,
} from "../../ReaderUi/TaleDebug/DebugPrimitives";

/**
 * Edits one entity-owned animation track collection and can copy official templates into it.
 *
 * @param props - Component props.
 * @param props.onChange - Receives the next animation selection.
 * @param props.selection - Current entity-owned animation selection.
 * @param props.title - Card title.
 * @returns Animation template and track controls.
 *
 * @example
 * <AnimationSelectionEditor title="Entering" selection={selection} onChange={setSelection} />
 */
export function AnimationSelectionEditor({
	onChange,
	selection,
	timingMode = "timeline",
	title,
}: {
	onChange: (selection: AnimationSelection) => void;
	selection: AnimationSelection;
	timingMode?: "loop" | "timeline";
	title: string;
}): React.JSX.Element {
	const presets = useReaderStoreShallow(
		(state) => state.tale.data.structure.animationPresets,
	);
	const [presetId, setPresetId] = useState(presets[0]?.id ?? "");

	const appendTracks = (tracks: AnimationTrack[]): void => {
		onChange({
			animations: [
				...selection.animations,
				...structuredClone(tracks).map((track) =>
					timingMode === "loop"
						? {
								...track,
								id: track.id ?? createAnimationTrackId(),
								end: 1,
								loopDurationSeconds: track.loopDurationSeconds ?? 2.4,
								loopPlayback: track.loopPlayback ?? "alternate",
								start: 0,
								visibleRange: track.visibleRange ?? { end: 1, start: 0 },
							}
						: {
								...track,
								id: track.id ?? createAnimationTrackId(),
								playback: track.playback ?? "scrub",
								visibleRange: track.visibleRange ?? { end: 1, start: 0 },
							},
				),
			],
		});
	};

	return (
		<DebugCard
			componentName="AnimationSelectionEditor"
			readerRole="animation-selection"
			title={title}
		>
			<div className="col-span-2 grid grid-cols-[1fr_auto] gap-2">
				<select
					aria-label={`${title} official animation`}
					className={settingClassName}
					value={presetId}
					onChange={(event) => setPresetId(event.target.value)}
				>
					{presets.map((preset) => (
						<option key={preset.id} value={preset.id}>
							{preset.name}
						</option>
					))}
				</select>
				<button
					type="button"
					className="grid h-9 w-9 place-items-center rounded border border-white/12 text-white/62 hover:bg-white/8 hover:text-white"
					title="Copy official animation tracks"
					onClick={() => {
						const preset = presets.find((item) => item.id === presetId);
						if (preset) appendTracks(preset.tracks);
					}}
				>
					<Plus size={14} />
				</button>
			</div>
			{selection.animations.map((track, index) => (
				<AnimationTrackFields
					key={`${track.property}-${index}`}
					timingMode={timingMode}
					track={track}
					onChange={(nextTrack) =>
						onChange({
							animations: selection.animations.map((item, itemIndex) =>
								itemIndex === index ? nextTrack : item,
							),
						})
					}
					onRemove={() =>
						onChange({
							animations: selection.animations.filter(
								(_, itemIndex) => itemIndex !== index,
							),
						})
					}
				/>
			))}
			<button
				type="button"
				className="col-span-2 flex h-9 items-center justify-center gap-2 rounded border border-white/14 border-dashed text-white/52 text-xs hover:border-white/25 hover:text-white"
				onClick={() =>
					appendTracks([
						{ end: 1, from: 0, property: "opacity", start: 0, to: 1 },
					])
				}
			>
				<Plus size={13} />
				Add custom track
			</button>
		</DebugCard>
	);
}

/**
 * Edits one animation track.
 *
 * @param props - Component props.
 * @param props.onChange - Receives the updated track.
 * @param props.onRemove - Removes the track.
 * @param props.track - Current animation track.
 * @returns Track controls.
 */
function AnimationTrackFields({
	onChange,
	onRemove,
	timingMode,
	track,
}: {
	onChange: (track: AnimationTrack) => void;
	onRemove: () => void;
	timingMode: "loop" | "timeline";
	track: AnimationTrack;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="AnimationTrackEditor"
			data-reader-role="animation-track-settings"
			className="col-span-2 space-y-3 rounded border border-white/8 bg-white/[0.025] p-3"
		>
			<div className="grid grid-cols-[1fr_auto] items-end gap-2">
				<Setting label="Property">
					<select
						className={settingClassName}
						value={track.property}
						onChange={(event) =>
							onChange(
								changeTrackProperty(
									track,
									event.target.value as AnimationTrack["property"],
									timingMode,
								),
							)
						}
					>
						<option value="opacity">Opacity</option>
						<option value="translate">Translate</option>
						<option value="scale">Scale</option>
						<option value="rotate">Rotate</option>
						<option value="blur">Blur</option>
						<option value="motionPath">Motion path</option>
					</select>
				</Setting>
				<button
					type="button"
					aria-label="Remove animation track"
					className="grid h-9 w-9 place-items-center rounded text-red-300/65 hover:bg-red-500/10 hover:text-red-200"
					onClick={onRemove}
				>
					<Trash2 size={14} />
				</button>
			</div>
			<TrackFieldSection title={timingMode === "timeline" ? "Timing" : "Loop"}>
				{timingMode === "timeline" ? (
					<>
						<Setting label="Playback">
							<select
								className={settingClassName}
								value={track.playback ?? "scrub"}
								onChange={(event) =>
									onChange({
										...track,
										playback: event.target.value as AnimationTrack["playback"],
									})
								}
							>
								<option value="scrub">Follow scroll</option>
								<option value="commitOnComplete">Keep completed state</option>
							</select>
						</Setting>
						<TrackNumber
							label="Start"
							value={track.start}
							onChange={(start) => onChange({ ...track, start })}
						/>
						<TrackNumber
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
						<Setting label="Direction">
							<select
								className={settingClassName}
								value={track.loopPlayback ?? "alternate"}
								onChange={(event) =>
									onChange({
										...track,
										loopPlayback: event.target.value as "alternate" | "restart",
									})
								}
							>
								<option value="alternate">Alternate</option>
								<option value="restart">Restart</option>
							</select>
						</Setting>
					</>
				)}
			</TrackFieldSection>
			<TrackFieldSection title="Visibility">
				<TrackNumber
					label="Visible from"
					max={1}
					min={0}
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
				<TrackNumber
					label="Visible until"
					max={1}
					min={0}
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
			<TrackFieldSection title="Values">
				{track.property === "translate" ? (
					<>
						<Setting label="Axes">
							<select
								className={settingClassName}
								value={track.axis}
								onChange={(event) =>
									onChange({
										...track,
										axis: event.target.value as "x" | "xy" | "xyz" | "y",
									})
								}
							>
								<option value="x">X</option>
								<option value="y">Y</option>
								<option value="xy">X and Y</option>
								<option value="xyz">X, Y and Z</option>
							</select>
						</Setting>
						<Setting label="Unit">
							<select
								className={settingClassName}
								value={track.unit ?? "px"}
								onChange={(event) =>
									onChange({
										...track,
										unit: event.target.value as "px" | "viewport",
									})
								}
							>
								<option value="px">Pixels</option>
								<option value="viewport">Viewport spans</option>
							</select>
						</Setting>
					</>
				) : null}
				{"from" in track ? (
					<>
						<TrackNumber
							label={
								track.property === "opacity"
									? "From opacity"
									: track.property === "translate"
										? track.axis === "y"
											? "From Y"
											: "From X"
										: "From"
							}
							value={track.from}
							onChange={(from) => onChange({ ...track, from })}
						/>
						<TrackNumber
							label={
								track.property === "opacity"
									? "To opacity"
									: track.property === "translate"
										? track.axis === "y"
											? "To Y"
											: "To X"
										: "To"
							}
							value={track.to}
							onChange={(to) => onChange({ ...track, to })}
						/>
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
					<div className="col-span-2">
						<Setting label="SVG path">
							<textarea
								className={`${settingClassName} min-h-20 py-2`}
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
				<Setting label="Easing">
					<select
						className={settingClassName}
						value={track.easing ?? "power2.out"}
						onChange={(event) =>
							onChange({
								...track,
								easing: event.target.value as AnimationEasing,
							})
						}
					>
						<option value="linear">Linear</option>
						<option value="power1.in">Power 1 in</option>
						<option value="power1.out">Power 1 out</option>
						<option value="power1.inOut">Power 1 in/out</option>
						<option value="power2.in">Power 2 in</option>
						<option value="power2.out">Power 2 out</option>
						<option value="power2.inOut">Power 2 in/out</option>
						<option value="power3.in">Power 3 in</option>
						<option value="power3.out">Power 3 out</option>
						<option value="power3.inOut">Power 3 in/out</option>
						<option value="back.out">Back out</option>
						<option value="elastic.out">Elastic out</option>
						<option value="bounce.out">Bounce out</option>
					</select>
				</Setting>
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
		<fieldset className="grid grid-cols-2 gap-2 rounded border border-white/7 p-2">
			<legend className="px-1 font-medium text-[10px] text-white/42 uppercase tracking-wide">
				{title}
			</legend>
			{children}
		</fieldset>
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
	label,
	max,
	min,
	onChange,
	value,
}: {
	label: string;
	max?: number;
	min?: number;
	onChange: (value: number) => void;
	value: number;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<input
				className={settingClassName}
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
	timingMode: "loop" | "timeline",
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
		start: timingMode === "loop" ? 0 : track.start,
		visibleRange: track.visibleRange ?? { end: 1, start: 0 },
	} as AnimationTrack;
}

/**
 * Creates a stable client-side identifier for one authored animation track.
 *
 * @returns Unique animation track identifier.
 */
function createAnimationTrackId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `animation-${Date.now()}`;
}
