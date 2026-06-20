import type { ReaderStyle } from "~/app/(tale-app)/_shared/types";
import {
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import { TextSetting } from "../InspectorValueFields";

export type StyleChangeHandler = (style: ReaderStyle) => void;

/**
 * Renders row and column gap fields shared by flex and grid containers.
 *
 * @param props - Gap editor props.
 * @param props.onChange - Receives the next style object.
 * @param props.style - Current style values.
 * @returns Gap fields.
 *
 * @example
 * <GapSettings style={style} onChange={setStyle} />
 */
export function GapSettings({
	onChange,
	style,
}: {
	onChange: StyleChangeHandler;
	style: ReaderStyle;
}): React.JSX.Element {
	return (
		<>
			<TextSetting
				label="Column gap"
				placeholder="16px"
				value={String(style.columnGap ?? "")}
				onChange={(value) =>
					onChange({ ...style, columnGap: value || undefined })
				}
			/>
			<TextSetting
				label="Row gap"
				placeholder="16px"
				value={String(style.rowGap ?? "")}
				onChange={(value) => onChange({ ...style, rowGap: value || undefined })}
			/>
		</>
	);
}

/**
 * Renders a typed select for a CSS option set.
 *
 * @param props - Select props.
 * @param props.label - User-facing field label.
 * @param props.onChange - Receives the selected value.
 * @param props.options - Allowed values.
 * @param props.value - Current value.
 * @returns Typed style select.
 *
 * @example
 * <StyleSelect label="Direction" value="row" options={["row"]} onChange={setDirection} />
 */
export function StyleSelect<Value extends string>({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: Value) => void;
	options: readonly Value[];
	value: Value;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<select
				className={settingClassName}
				value={value}
				onChange={(event) => onChange(event.target.value as Value)}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</Setting>
	);
}
