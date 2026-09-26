"use client";

import { Repeat2 } from "lucide-react";
import { Setting } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type { AmbientAnimationSelection } from "~/app/(tale-app)/_shared/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
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
							<Select
								aria-label="Starts at Frame"
								value={selection.startFrameId ?? "__first__"}
								onValueChange={(startFrameId) =>
									onChange({
										...selection,
										startFrameId:
											startFrameId === "__first__" ? null : startFrameId,
									})
								}
							>
								<SelectTrigger className="w-full" density="compact">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="__first__">First Frame</SelectItem>
									{frameOptions.map((frame) => (
										<SelectItem key={frame.id} value={frame.id}>
											{frame.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Setting>
						<Setting label="Ends at Frame">
							<Select
								aria-label="Ends at Frame"
								value={selection.endFrameId ?? "__last__"}
								onValueChange={(endFrameId) =>
									onChange({
										...selection,
										endFrameId: endFrameId === "__last__" ? null : endFrameId,
									})
								}
							>
								<SelectTrigger className="w-full" density="compact">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="__last__">Last Frame</SelectItem>
									{frameOptions.map((frame) => (
										<SelectItem key={frame.id} value={frame.id}>
											{frame.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Setting>
					</div>
				) : null}
			</AnimationSelectionEditor>
		</div>
	);
}
