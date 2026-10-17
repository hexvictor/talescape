import { Setting } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import Input from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

export function InspectorSelect({
	isDisabled = false,
	label,
	onChange,
	options,
	value,
}: {
	isDisabled?: boolean;
	label: string;
	onChange: (value: string) => void;
	options: readonly { label: string; value: string }[];
	value: string;
}): React.JSX.Element {
	return (
		<Select
			aria-label={label}
			isDisabled={isDisabled}
			value={value}
			onValueChange={onChange}
		>
			<SelectTrigger
				data-reader-component="InspectorSelect"
				data-reader-role="inspector-select"
				data-studio-component="InspectorSelect"
				data-studio-role="inspector-select"
				className="w-full"
				density="compact"
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

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
			<Input
				aria-label={label}
				density="compact"
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
	max,
	min,
	onChange,
	placeholder = "none",
	step,
	value,
}: {
	label: string;
	max?: number;
	min?: number;
	onChange: (value: number | undefined) => void;
	placeholder?: string;
	step?: number;
	value?: number;
}): React.JSX.Element {
	return (
		<Setting label={label}>
			<Input
				aria-label={label}
				density="compact"
				max={max}
				min={min}
				placeholder={placeholder}
				step={step}
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
				<Input
					aria-label={label}
					className="w-full"
					density="compact"
					min={0}
					step={unit === "px" ? 25 : 0.25}
					type="number"
					value={value}
					onChange={(event) => onChange(Number(event.target.value), unit)}
				/>
				<Select
					aria-label={`${label} unit`}
					value={unit}
					onValueChange={(nextUnit) =>
						onChange(value, nextUnit as "px" | "viewport")
					}
				>
					<SelectTrigger className="w-full" density="compact">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="viewport">Viewport</SelectItem>
						<SelectItem value="px">Pixels</SelectItem>
					</SelectContent>
				</Select>
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
				<Input
					aria-label={label}
					className="w-full"
					density="compact"
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
				<Select
					aria-label={`${label} unit`}
					isDisabled={value === undefined}
					value={resolvedUnit}
					onValueChange={(nextUnit) =>
						onChange(value, nextUnit as "px" | "viewport")
					}
				>
					<SelectTrigger className="w-full" density="compact">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="viewport">Viewport</SelectItem>
						<SelectItem value="px">Pixels</SelectItem>
					</SelectContent>
				</Select>
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
			<Input
				aria-label={label}
				density="compact"
				placeholder={placeholder}
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</Setting>
	);
}
