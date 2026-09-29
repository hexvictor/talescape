"use client";

import type { TalePath } from "~/app/(tale-app)/_shared/types";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import { useTaleStudioStoreShallow } from "../../hooks/useTaleStudioStore";
import type {
	EditorEdgeType,
	EditorGraphDirection,
	GraphFocusMode,
	PathVisibilityMode,
} from "../../store/editorGraphTypes";

type PathType = TalePath["type"];

const pathTypes: PathType[] = ["choice", "linear", "return", "teleport"];

/**
 * Renders graph settings controls used by Tale Studio settings.
 *
 * @returns Tale Studio graph settings form.
 *
 * @example
 * <TaleStudioGraphSettings />
 */
export function TaleStudioGraphSettings(): React.JSX.Element {
	const {
		edgeType,
		focusMode,
		graphDirection,
		pathVisibilityMode,
		setEdgeType,
		setFocusMode,
		setGraphDirection,
		setPathVisibilityMode,
		setUnfocusedEdgeOpacity,
		setUnfocusedNodeOpacity,
		setVisiblePathTypes,
		unfocusedEdgeOpacity,
		unfocusedNodeOpacity,
		visiblePathTypes,
	} = useTaleStudioStoreShallow((state) => state.editorGraph);

	return (
		<div
			data-reader-component="TaleStudioGraphSettings"
			data-reader-role="settings"
			data-studio-component="TaleStudioGraphSettings"
			data-studio-role="graph-settings"
		>
			<SettingsSelect
				label="Hover focus"
				value={focusMode}
				options={[
					["direct", "Direct connections"],
					["ancestry", "Parent ancestry"],
					["off", "Disabled"],
				]}
				onChange={(value) => setFocusMode(value as GraphFocusMode)}
			/>
			{focusMode !== "off" ? (
				<div className="mt-4 grid grid-cols-2 gap-3">
					<OpacityField
						label="Other nodes"
						value={unfocusedNodeOpacity}
						onChange={setUnfocusedNodeOpacity}
					/>
					<OpacityField
						label="Other edges"
						value={unfocusedEdgeOpacity}
						onChange={setUnfocusedEdgeOpacity}
					/>
				</div>
			) : null}
			<SettingsSelect
				label="Path edge style"
				value={edgeType}
				options={[
					["smoothstep", "Curved"],
					["step", "Sharp"],
					["straight", "Straight"],
					["default", "Default"],
				]}
				onChange={(value) => setEdgeType(value as EditorEdgeType)}
			/>
			<SettingsSelect
				label="Graph direction"
				value={graphDirection}
				options={[
					["horizontal", "Horizontal tree"],
					["vertical", "Vertical tree"],
				]}
				onChange={(value) => setGraphDirection(value as EditorGraphDirection)}
			/>
			<SettingsSelect
				label="Path visibility"
				value={pathVisibilityMode}
				options={[
					["all", "Show all"],
					["linear", "Linear paths"],
					["return", "Return paths"],
					["teleport", "Teleport paths"],
					["custom", "Show custom"],
				]}
				onChange={(value) => {
					const mode = value as PathVisibilityMode;
					setPathVisibilityMode(mode);
					if (mode === "all") setVisiblePathTypes(new Set(pathTypes));
					if (mode === "linear") {
						setVisiblePathTypes(new Set(["choice", "linear"]));
					}
					if (mode === "return") setVisiblePathTypes(new Set(["return"]));
					if (mode === "teleport") {
						setVisiblePathTypes(new Set(["teleport"]));
					}
				}}
			/>
			{pathVisibilityMode === "custom" ? (
				<CustomPathVisibilitySettings
					visiblePathTypes={visiblePathTypes}
					onVisiblePathTypesChange={setVisiblePathTypes}
				/>
			) : null}
		</div>
	);
}

/**
 * Renders custom path type visibility toggles.
 *
 * @param props - Path visibility state and update callback.
 * @param props.onVisiblePathTypesChange - Receives selected path types.
 * @param props.visiblePathTypes - Currently visible path types.
 * @returns Custom path visibility checkboxes.
 *
 * @example
 * <CustomPathVisibilitySettings visiblePathTypes={types} onVisiblePathTypesChange={setTypes} />
 */
function CustomPathVisibilitySettings({
	onVisiblePathTypesChange,
	visiblePathTypes,
}: {
	onVisiblePathTypesChange: (types: Set<PathType>) => void;
	visiblePathTypes: Set<PathType>;
}): React.JSX.Element {
	return (
		<div className="mt-3 grid gap-2">
			{pathTypes.map((type) => (
				<Checkbox
					key={type}
					className="flex-row-reverse justify-between border border-foreground/10 bg-foreground/[0.03] px-3 py-2 text-foreground/70"
					density="compact"
					isSelected={visiblePathTypes.has(type)}
					onChange={(isSelected) => {
						const next = new Set(visiblePathTypes);
						if (isSelected) next.add(type);
						else next.delete(type);
						onVisiblePathTypesChange(next);
					}}
				>
					<span className="capitalize">{type}</span>
				</Checkbox>
			))}
		</div>
	);
}

/**
 * Renders one select field in the settings modal.
 *
 * @param props - Select field props.
 * @param props.label - Field label.
 * @param props.onChange - Receives selected option value.
 * @param props.options - Select options as value-label pairs.
 * @param props.value - Current selected value.
 * @returns Labeled settings select.
 *
 * @example
 * <SettingsSelect label="Graph direction" value="horizontal" options={options} onChange={setValue} />
 */
function SettingsSelect({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	options: [string, string][];
	value: string;
}): React.JSX.Element {
	return (
		<Field className="mt-4 first:mt-0" label={label}>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger className="w-full" density="compact">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map(([optionValue, optionLabel]) => (
						<SelectItem key={optionValue} value={optionValue}>
							{optionLabel}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</Field>
	);
}

/**
 * Renders a normalized graph opacity control.
 *
 * @param props - Opacity field props.
 * @param props.label - Field label.
 * @param props.onChange - Receives opacity from 0 to 1.
 * @param props.value - Current opacity from 0 to 1.
 * @returns Labeled range control.
 *
 * @example
 * <OpacityField label="Other nodes" value={0.1} onChange={setOpacity} />
 */
function OpacityField({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: number) => void;
	value: number;
}): React.JSX.Element {
	return (
		<Slider
			density="compact"
			formatOptions={{ style: "percent" }}
			label={label}
			maxValue={1}
			minValue={0}
			step={0.01}
			value={value}
			onChange={onChange}
		/>
	);
}
