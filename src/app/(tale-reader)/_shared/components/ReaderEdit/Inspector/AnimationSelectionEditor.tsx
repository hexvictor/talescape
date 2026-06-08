"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useReaderStoreShallow } from "../../../contexts/ReaderStoreContext";
import type { AnimationSelection, AnimationTrack } from "../../../types";
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
	title,
}: {
	onChange: (selection: AnimationSelection) => void;
	selection: AnimationSelection;
	title: string;
}): React.JSX.Element {
	const presets = useReaderStoreShallow(
		(state) => state.tale.data.structure.animationPresets,
	);
	const [presetId, setPresetId] = useState(presets[0]?.id ?? "");

	const appendTracks = (tracks: AnimationTrack[]): void => {
		onChange({
			animations: [...selection.animations, ...structuredClone(tracks)],
		});
	};

	return (
		<DebugCard title={title}>
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
	track,
}: {
	onChange: (track: AnimationTrack) => void;
	onRemove: () => void;
	track: AnimationTrack;
}): React.JSX.Element {
	return (
		<div className="col-span-2 grid grid-cols-2 gap-2 rounded border border-white/8 bg-white/[0.025] p-2">
			<Setting label="Property">
				<select
					className={settingClassName}
					value={track.property}
					onChange={(event) =>
						onChange(
							createTrack(event.target.value as AnimationTrack["property"]),
						)
					}
				>
					<option value="opacity">Opacity</option>
					<option value="translate">Translate</option>
					<option value="scale">Scale</option>
					<option value="rotate">Rotate</option>
					<option value="blur">Blur</option>
					<option value="glitch">Glitch</option>
				</select>
			</Setting>
			<button
				type="button"
				aria-label="Remove animation track"
				className="ml-auto grid h-9 w-9 place-items-center rounded text-red-300/65 hover:bg-red-500/10 hover:text-red-200"
				onClick={onRemove}
			>
				<Trash2 size={14} />
			</button>
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
			{"from" in track ? (
				<>
					<TrackNumber
						label="From"
						value={track.from}
						onChange={(from) => onChange({ ...track, from })}
					/>
					<TrackNumber
						label="To"
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
			{track.property === "translate" ? (
				<Setting label="Axis">
					<select
						className={settingClassName}
						value={track.axis}
						onChange={(event) =>
							onChange({ ...track, axis: event.target.value as "x" | "y" })
						}
					>
						<option value="x">X</option>
						<option value="y">Y</option>
					</select>
				</Setting>
			) : null}
		</div>
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
			end: 1,
			from: 40,
			property,
			start: 0,
			to: 0,
		};
	}
	if (property === "blur" || property === "glitch") {
		return { end: 1, property, start: 0, strength: 10 };
	}
	return {
		end: 1,
		from: property === "scale" ? 0.8 : 0,
		property,
		start: 0,
		to: property === "scale" ? 1 : 1,
	};
}
