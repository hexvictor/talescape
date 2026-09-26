"use client";

import { Repeat2 } from "lucide-react";
import {
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type { AmbientAnimationSelection } from "~/app/(tale-app)/_shared/types";
import { AnimationSelectionEditor } from "./AnimationSelectionEditor";

export function LoopingAnimationsGroup({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	return (
		<section
			className="space-y-3 border-foreground/15 border-t pt-3"
			data-reader-component="LoopingAnimationsGroup"
			data-reader-role="looping-hover-animation-settings"
		>
			<p className="font-black text-[10px] text-foreground/45 uppercase">
				Looping and hover animations
			</p>
			{children}
		</section>
	);
}

/**
 * Edits continuously repeating tracks with timing owned by each track.
 *
 * @param props - Looping animation selection and update callback.
 * @returns Track editor configured for repeating animation timing.
 *
 * @example
 * <LoopingAnimationEditor selection={looping} onChange={setLooping} />
 */
export function LoopingAnimationEditor({
	icon,
	frameOptions,
	onChange,
	selection,
	title = "General looping",
}: {
	icon?: React.ReactNode;
	frameOptions?: Array<{ id: string; label: string }>;
	onChange: (selection: AmbientAnimationSelection) => void;
	selection: AmbientAnimationSelection;
	title?: string;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="LoopingAnimationEditor"
			data-reader-role="looping-animation-settings"
		>
			<AnimationSelectionEditor
				icon={icon ?? <Repeat2 size={15} />}
				title={title}
				selection={selection}
				timingMode="loop"
				onChange={(animations) =>
					onChange({
						...animations,
						cycleDurationMs: selection.cycleDurationMs,
						endFrameId: selection.endFrameId,
						playback: selection.playback,
						startFrameId: selection.startFrameId,
					})
				}
			>
				{frameOptions?.length ? (
					<div className="grid grid-cols-2 gap-2 border border-foreground/10 bg-background/35 p-2">
						<Setting label="Starts at Frame">
							<select
								className={settingClassName}
								value={selection.startFrameId ?? ""}
								onChange={(event) =>
									onChange({
										...selection,
										startFrameId: event.target.value || null,
									})
								}
							>
								<option value="">First Frame</option>
								{frameOptions.map((frame) => (
									<option key={frame.id} value={frame.id}>
										{frame.label}
									</option>
								))}
							</select>
						</Setting>
						<Setting label="Ends at Frame">
							<select
								className={settingClassName}
								value={selection.endFrameId ?? ""}
								onChange={(event) =>
									onChange({
										...selection,
										endFrameId: event.target.value || null,
									})
								}
							>
								<option value="">Last Frame</option>
								{frameOptions.map((frame) => (
									<option key={frame.id} value={frame.id}>
										{frame.label}
									</option>
								))}
							</select>
						</Setting>
					</div>
				) : null}
			</AnimationSelectionEditor>
		</div>
	);
}
