"use client";

import {
	DebugCard,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type {
	ResolvedTaleElement,
	TaleElement,
} from "~/app/(tale-app)/_shared/types";
import { ImageUploadSetting } from "../ImageUploadSetting";

/**
 * Edits the authored content fields for one element type.
 *
 * @param props - Content settings props.
 * @param props.element - Element whose authored content is being edited.
 * @param props.onChange - Applies the edited raw element fields.
 * @returns Content-focused element controls.
 *
 * @example
 * <ElementContentSettings element={element} onChange={updateFragment} />
 */
export function ElementContentSettings({
	element,
	onChange,
}: {
	element: ResolvedTaleElement;
	onChange: (update: (element: ResolvedTaleElement) => TaleElement) => void;
}): React.JSX.Element {
	return (
		<DebugCard
			componentName="ElementContentSettings"
			contentClassName="grid-cols-1"
			readerRole="element-content-settings"
			title="Content"
		>
			<InputSetting
				label="Element name"
				value={element.label ?? ""}
				onChange={(label) => onChange((item) => ({ ...item, label }))}
			/>
			{element.type === "text" || element.type === "quote" ? (
				<>
					<TextAreaSetting
						label={element.type === "quote" ? "Quote text" : "Text"}
						value={element.text ?? ""}
						onChange={(text) => onChange((item) => ({ ...item, text }))}
					/>
					{element.type === "quote" ? (
						<InputSetting
							label="Attribution"
							value={element.attribution ?? ""}
							onChange={(attribution) =>
								onChange((item) => ({ ...item, attribution }))
							}
						/>
					) : null}
				</>
			) : null}

			{element.type === "image" ? (
				<>
					<ImageUploadSetting
						label="Image URL"
						value={element.src ?? ""}
						onChange={(src) => onChange((item) => ({ ...item, src }))}
					/>
					<InputSetting
						label="Fallback URL"
						value={element.fallbackSrc ?? ""}
						onChange={(fallbackSrc) =>
							onChange((item) => ({ ...item, fallbackSrc }))
						}
					/>
					<InputSetting
						label="Alt text"
						value={element.alt ?? ""}
						onChange={(alt) => onChange((item) => ({ ...item, alt }))}
					/>
					<TextAreaSetting
						label="Caption"
						value={element.caption ?? ""}
						onChange={(caption) => onChange((item) => ({ ...item, caption }))}
					/>
				</>
			) : null}

			{element.type === "choiceButton" ? (
				<>
					<InputSetting
						label="Label"
						value={element.label ?? ""}
						onChange={(label) => onChange((item) => ({ ...item, label }))}
					/>
					<TextAreaSetting
						label="Description"
						value={element.text ?? ""}
						onChange={(text) => onChange((item) => ({ ...item, text }))}
					/>
					<InputSetting
						label="Path ID"
						value={element.pathId ?? ""}
						onChange={(pathId) => onChange((item) => ({ ...item, pathId }))}
					/>
				</>
			) : null}

			{element.type === "codexEntry" ? (
				<>
					<InputSetting
						label="Label"
						value={element.label ?? ""}
						onChange={(label) => onChange((item) => ({ ...item, label }))}
					/>
					<TextAreaSetting
						label="Description"
						value={element.text ?? ""}
						onChange={(text) => onChange((item) => ({ ...item, text }))}
					/>
				</>
			) : null}

			{element.type === "soundCue" ? (
				<>
					<InputSetting
						label="Label"
						value={element.label ?? ""}
						onChange={(label) => onChange((item) => ({ ...item, label }))}
					/>
					<InputSetting
						label="Mood"
						value={element.mood ?? ""}
						onChange={(mood) => onChange((item) => ({ ...item, mood }))}
					/>
					<InputSetting
						label="Sound URL"
						value={element.src ?? ""}
						onChange={(src) => onChange((item) => ({ ...item, src }))}
					/>
				</>
			) : null}

			{element.type === "audio" || element.type === "video" ? (
				<>
					<InputSetting
						label={element.type === "audio" ? "Audio URL" : "Video URL"}
						value={element.src ?? ""}
						onChange={(src) => onChange((item) => ({ ...item, src }))}
					/>
					<Setting label="Playback behavior">
						<select
							className={settingClassName}
							value={element.mediaPlayback?.mode ?? "controls"}
							onChange={(event) =>
								onChange((item) => ({
									...item,
									mediaPlayback: {
										loop: item.mediaPlayback?.loop ?? false,
										maxVolume: item.mediaPlayback?.maxVolume ?? 1,
										mode: event.target.value as NonNullable<
											TaleElement["mediaPlayback"]
										>["mode"],
										scope: item.mediaPlayback?.scope ?? "scene",
									},
								}))
							}
						>
							<option value="controls">Visible controls</option>
							<option value="click">Play on click</option>
							<option value="onEnter">Play when visible</option>
							<option value="scrollVolume">Volume follows visibility</option>
						</select>
					</Setting>
					<Setting label="Activation scope">
						<select
							className={settingClassName}
							value={element.mediaPlayback?.scope ?? "scene"}
							onChange={(event) =>
								onChange((item) => ({
									...item,
									mediaPlayback: {
										loop: item.mediaPlayback?.loop ?? false,
										maxVolume: item.mediaPlayback?.maxVolume ?? 1,
										mode: item.mediaPlayback?.mode ?? "onEnter",
										scope: event.target.value as NonNullable<
											TaleElement["mediaPlayback"]
										>["scope"],
									},
								}))
							}
						>
							<option value="scene">Whole Scene</option>
							<option value="frame">Specific Frame</option>
							<option value="element">Element position</option>
						</select>
					</Setting>
					<Setting label="Maximum volume">
						<input
							className={settingClassName}
							max={1}
							min={0}
							step={0.05}
							type="number"
							value={element.mediaPlayback?.maxVolume ?? 1}
							onChange={(event) =>
								onChange((item) => ({
									...item,
									mediaPlayback: {
										loop: item.mediaPlayback?.loop ?? false,
										maxVolume: Number(event.target.value),
										mode: item.mediaPlayback?.mode ?? "controls",
										scope: item.mediaPlayback?.scope ?? "scene",
									},
								}))
							}
						/>
					</Setting>
					<label className="flex items-center gap-2 text-foreground/68 text-xs">
						<input
							checked={element.mediaPlayback?.loop ?? false}
							type="checkbox"
							onChange={(event) =>
								onChange((item) => ({
									...item,
									mediaPlayback: {
										loop: event.target.checked,
										maxVolume: item.mediaPlayback?.maxVolume ?? 1,
										mode: item.mediaPlayback?.mode ?? "controls",
										scope: item.mediaPlayback?.scope ?? "scene",
									},
								}))
							}
						/>
						Loop media
					</label>
				</>
			) : null}
		</DebugCard>
	);
}

/**
 * Renders a single-line element content input.
 *
 * @param props - Input props.
 * @param props.label - Field label.
 * @param props.onChange - Receives the updated text.
 * @param props.value - Current text value.
 * @returns Labeled text input.
 */
function InputSetting({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<input
				className={settingClassName}
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</Setting>
	);
}

/**
 * Renders a multiline element content editor.
 *
 * @param props - Textarea props.
 * @param props.label - Field label.
 * @param props.onChange - Receives the updated text.
 * @param props.value - Current textarea value.
 * @returns Labeled textarea control.
 */
function TextAreaSetting({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<textarea
				className={`${settingClassName} min-h-28 resize-y py-2`}
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</Setting>
	);
}
