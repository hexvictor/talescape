"use client";

import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
	DebugCard,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { useTaleAppStore } from "~/app/(tale-app)/_shared/contexts/TaleAppStoreContext";
import { getTaleAnimationPresets } from "~/app/(tale-app)/_shared/services/taleLookups";
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
	children,
	defaultOpen = false,
	icon,
	inheritsPreviousState = false,
	onChange,
	selection,
	timingMode = "timeline",
	title,
}: {
	children?: ReactNode;
	defaultOpen?: boolean;
	icon?: ReactNode;
	inheritsPreviousState?: boolean;
	onChange: (selection: AnimationSelection) => void;
	selection: AnimationSelection;
	timingMode?: "hover" | "loop" | "timeline";
	title: string;
}): React.JSX.Element {
	const tale = useTaleAppStore((state) => state.document.tale);
	const presets = useMemo(() => getTaleAnimationPresets(tale), [tale]);
	const [presetId, setPresetId] = useState(presets[0]?.id ?? "");
	const currentSelection = normalizeAnimationSelection(selection);

	const appendTracks = (tracks: AnimationTrack[]): void => {
		onChange({
			...currentSelection,
			animations: [
				...currentSelection.animations,
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
			defaultOpen={defaultOpen}
			icon={icon}
			componentName="AnimationSelectionEditor"
			readerRole="animation-selection"
			title={title}
		>
			{timingMode === "timeline" ? (
				<div className="col-span-2 grid gap-2 border-foreground/8 border-b pb-3">
					<label className="flex items-start gap-2 text-foreground/68 text-xs">
						<input
							checked={currentSelection.carryEndStateForward ?? false}
							className="mt-0.5 accent-primary"
							type="checkbox"
							onChange={(event) =>
								onChange({
									...currentSelection,
									carryEndStateForward: event.target.checked,
								})
							}
						/>
						<span>
							<span className="block font-semibold text-foreground">
								Carry end state into next phase
							</span>
							<span className="block text-[10px] text-foreground/45">
								The next animation starts from this phase's completed values.
							</span>
						</span>
					</label>
				</div>
			) : null}
			{timingMode === "hover" ? (
				<div className="col-span-2">
					<label className="grid gap-1 font-bold text-[10px] text-foreground/55 uppercase">
						Duration (seconds)
						<input
							className={settingClassName}
							min={0.05}
							step={0.05}
							type="number"
							value={currentSelection.durationSeconds ?? 0.2}
							onChange={(event) =>
								onChange({
									...currentSelection,
									durationSeconds: Math.max(0.05, Number(event.target.value)),
								})
							}
						/>
					</label>
				</div>
			) : null}
			{children ? <div className="col-span-2">{children}</div> : null}
			<div className="col-span-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
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
			{currentSelection.animations.map((track, index) => (
				<AnimationTrackFields
					key={`${track.property}-${index}`}
					timingMode={timingMode}
					lockFromValues={inheritsPreviousState}
					track={track}
					onChange={(nextTrack) =>
						onChange({
							...currentSelection,
							animations: currentSelection.animations.map((item, itemIndex) =>
								itemIndex === index ? nextTrack : item,
							),
						})
					}
					onRemove={() =>
						onChange({
							...currentSelection,
							animations: currentSelection.animations.filter(
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

function normalizeAnimationSelection(
	selection: AnimationSelection | undefined,
): AnimationSelection {
	const legacy = selection as
		| (Partial<AnimationSelection> & { tracks?: AnimationTrack[] })
		| undefined;
	return {
		...legacy,
		animations: legacy?.animations ?? legacy?.tracks ?? [],
	};
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
