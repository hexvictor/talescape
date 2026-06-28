import {
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";

/**
 * Renders a required number input.
 *
 * @param props - Component props.
 * @param props.label - Field label.
 * @param props.min - Minimum value.
 * @param props.onChange - Receives the next value.
 * @param props.step - Input step.
 * @param props.value - Current value.
 * @returns Number input.
 */
export function NumberSetting({
	label,
	min = 0,
	onChange,
	step = 1,
	value,
}: {
	label: string;
	min?: number;
	onChange: (value: number) => void;
	step?: number;
	value: number;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<input
				className={settingClassName}
				min={min}
				step={step}
				type="number"
				value={Number.isFinite(value) ? value : 0}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
		</Setting>
	);
}

/**
 * Renders an optional number input.
 *
 * @param props - Component props.
 * @param props.label - Field label.
 * @param props.onChange - Receives number or undefined.
 * @param props.value - Current optional value.
 * @returns Optional number input.
 */
export function OptionalNumberSetting({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: number | undefined) => void;
	value?: number;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<input
				className={settingClassName}
				placeholder="none"
				type="number"
				value={value ?? ""}
				onChange={(event) =>
					onChange(
						event.target.value === "" ? undefined : Number(event.target.value),
					)
				}
			/>
		</Setting>
	);
}

/**
 * Renders a required number and unit pair.
 *
 * @param props - Component props.
 * @param props.label - Field label.
 * @param props.onChange - Receives the next value and unit.
 * @param props.unit - Current unit.
 * @param props.value - Current value.
 * @returns Number and unit controls.
 */
export function UnitNumberSetting({
	label,
	onChange,
	unit,
	value,
}: {
	label: string;
	onChange: (value: number, unit: "px" | "viewport") => void;
	unit: "px" | "viewport";
	value: number;
}): React.JSX.Element {
	return (
		<Setting
			componentName="DimensionSetting"
			label={label}
			readerRole="dimension-input"
		>
			<div className="grid min-w-0 @min-[18rem]/setting:grid-cols-[minmax(0,1fr)_7.5rem] grid-cols-1 gap-2">
				<input
					className={`${settingClassName} w-full`}
					min={0}
					step={unit === "px" ? 25 : 0.25}
					type="number"
					value={value}
					onChange={(event) => onChange(Number(event.target.value), unit)}
				/>
				<select
					aria-label={`${label} unit`}
					className={`${settingClassName} w-full`}
					value={unit}
					onChange={(event) =>
						onChange(value, event.target.value as "px" | "viewport")
					}
				>
					<option value="viewport">Viewport</option>
					<option value="px">Pixels</option>
				</select>
			</div>
		</Setting>
	);
}

/**
 * Renders an independently optional number and unit pair.
 *
 * @param props - Component props.
 * @param props.label - Field label.
 * @param props.onChange - Receives the next optional value and unit.
 * @param props.unit - Current unit.
 * @param props.value - Current optional value.
 * @returns Optional number and unit controls.
 */
export function OptionalUnitNumberSetting({
	label,
	onChange,
	unit,
	value,
}: {
	label: string;
	onChange: (
		value: number | undefined,
		unit: "px" | "viewport" | undefined,
	) => void;
	unit?: "px" | "viewport";
	value?: number;
}): React.JSX.Element {
	const resolvedUnit = unit ?? "viewport";
	return (
		<Setting
			componentName="OptionalDimensionSetting"
			label={label}
			readerRole="optional-dimension-input"
		>
			<div className="grid min-w-0 @min-[18rem]/setting:grid-cols-[minmax(0,1fr)_7.5rem] grid-cols-1 gap-2">
				<input
					className={`${settingClassName} w-full`}
					placeholder="No limit"
					step={resolvedUnit === "px" ? 25 : 0.25}
					type="number"
					value={value ?? ""}
					onChange={(event) => {
						const next =
							event.target.value === ""
								? undefined
								: Number(event.target.value);
						onChange(next, next === undefined ? undefined : resolvedUnit);
					}}
				/>
				<select
					aria-label={`${label} unit`}
					className={`${settingClassName} w-full`}
					disabled={value === undefined}
					value={resolvedUnit}
					onChange={(event) =>
						onChange(value, event.target.value as "px" | "viewport")
					}
				>
					<option value="viewport">Viewport</option>
					<option value="px">Pixels</option>
				</select>
			</div>
		</Setting>
	);
}

/**
 * Renders a text input.
 *
 * @param props - Component props.
 * @param props.label - Field label.
 * @param props.onChange - Receives the next string.
 * @param props.value - Current value.
 * @returns Text input.
 */
export function TextSetting({
	label,
	onChange,
	placeholder,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	placeholder?: string;
	value: string;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<input
				className={settingClassName}
				placeholder={placeholder}
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</Setting>
	);
}
