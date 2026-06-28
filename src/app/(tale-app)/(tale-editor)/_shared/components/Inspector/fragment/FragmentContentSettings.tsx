"use client";

import type {
	ResolvedTaleFragment,
	TaleFragment,
} from "~/app/(tale-app)/_shared/types";
import {
	DebugCard,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";

/**
 * Edits the authored content fields for one fragment type.
 *
 * @param props - Content settings props.
 * @param props.fragment - Fragment whose authored content is being edited.
 * @param props.onChange - Applies the edited raw fragment fields.
 * @returns Content-focused fragment controls.
 *
 * @example
 * <FragmentContentSettings fragment={fragment} onChange={updateFragment} />
 */
export function FragmentContentSettings({
	fragment,
	onChange,
}: {
	fragment: ResolvedTaleFragment;
	onChange: (update: (fragment: ResolvedTaleFragment) => TaleFragment) => void;
}): React.JSX.Element {
	return (
		<DebugCard
			componentName="FragmentContentSettings"
			contentClassName="grid-cols-1"
			readerRole="fragment-content-settings"
			title="Content"
		>
			{fragment.type === "text" || fragment.type === "quote" ? (
				<>
					<TextAreaSetting
						label={fragment.type === "quote" ? "Quote text" : "Text"}
						value={fragment.text ?? ""}
						onChange={(text) => onChange((item) => ({ ...item, text }))}
					/>
					{fragment.type === "quote" ? (
						<InputSetting
							label="Attribution"
							value={fragment.attribution ?? ""}
							onChange={(attribution) =>
								onChange((item) => ({ ...item, attribution }))
							}
						/>
					) : null}
				</>
			) : null}

			{fragment.type === "image" ? (
				<>
					<InputSetting
						label="Image URL"
						value={fragment.src ?? ""}
						onChange={(src) => onChange((item) => ({ ...item, src }))}
					/>
					<InputSetting
						label="Fallback URL"
						value={fragment.fallbackSrc ?? ""}
						onChange={(fallbackSrc) =>
							onChange((item) => ({ ...item, fallbackSrc }))
						}
					/>
					<InputSetting
						label="Alt text"
						value={fragment.alt ?? ""}
						onChange={(alt) => onChange((item) => ({ ...item, alt }))}
					/>
					<TextAreaSetting
						label="Caption"
						value={fragment.caption ?? ""}
						onChange={(caption) => onChange((item) => ({ ...item, caption }))}
					/>
				</>
			) : null}

			{fragment.type === "choiceButton" ? (
				<>
					<InputSetting
						label="Label"
						value={fragment.label ?? ""}
						onChange={(label) => onChange((item) => ({ ...item, label }))}
					/>
					<TextAreaSetting
						label="Description"
						value={fragment.text ?? ""}
						onChange={(text) => onChange((item) => ({ ...item, text }))}
					/>
					<InputSetting
						label="Path ID"
						value={fragment.pathId ?? ""}
						onChange={(pathId) => onChange((item) => ({ ...item, pathId }))}
					/>
				</>
			) : null}

			{fragment.type === "codexEntry" ? (
				<>
					<InputSetting
						label="Label"
						value={fragment.label ?? ""}
						onChange={(label) => onChange((item) => ({ ...item, label }))}
					/>
					<TextAreaSetting
						label="Description"
						value={fragment.text ?? ""}
						onChange={(text) => onChange((item) => ({ ...item, text }))}
					/>
				</>
			) : null}

			{fragment.type === "soundCue" ? (
				<>
					<InputSetting
						label="Label"
						value={fragment.label ?? ""}
						onChange={(label) => onChange((item) => ({ ...item, label }))}
					/>
					<InputSetting
						label="Mood"
						value={fragment.mood ?? ""}
						onChange={(mood) => onChange((item) => ({ ...item, mood }))}
					/>
					<InputSetting
						label="Sound URL"
						value={fragment.src ?? ""}
						onChange={(src) => onChange((item) => ({ ...item, src }))}
					/>
				</>
			) : null}
		</DebugCard>
	);
}

/**
 * Renders a single-line fragment content input.
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
 * Renders a multiline fragment content editor.
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
