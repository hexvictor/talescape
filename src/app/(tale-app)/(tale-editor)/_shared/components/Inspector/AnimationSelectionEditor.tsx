"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import {
	DebugCard,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import type {
	AnimationSelection,
	AnimationTrack,
} from "~/app/(tale-app)/_shared/types";
import {
	AnimationTrackFields,
	createAnimationTrackId,
} from "./AnimationTrackFields";

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
	const presets = useTaleAppStore(
		(state) => state.document.tale.structure.animationPresets,
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
					className="grid h-9 w-9 place-items-center rounded border border-foreground/12 text-foreground/62 hover:bg-foreground/8 hover:text-foreground"
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
				className="col-span-2 flex h-9 items-center justify-center gap-2 rounded border border-foreground/14 border-dashed text-foreground/52 text-xs hover:border-foreground/25 hover:text-foreground"
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
