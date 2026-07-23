"use client";

import type { TalePath } from "~/app/(tale-app)/_shared/types";
import { useTaleEditorStoreShallow } from "../../hooks/useTaleEditorStore";
import type {
	EditorEdgeType,
	EditorGraphDirection,
	GraphFocusMode,
	PathVisibilityMode,
} from "../../store/editorStoreTypes";

type PathType = TalePath["type"];

const pathTypes: PathType[] = ["choice", "linear", "return", "teleport"];

/**
 * Renders graph settings controls used by the editor settings modal.
 *
 * @returns Editor graph settings form.
 *
 * @example
 * <EditorGraphSettings />
 */
export function EditorGraphSettings(): React.JSX.Element {
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
	} = useTaleEditorStoreShallow((state) => state.editorGraph);

	return (
		<div
			data-reader-component="EditorGraphSettings"
			data-reader-role="settings"
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
				<label
					key={type}
					className="flex items-center justify-between rounded border border-foreground/10 bg-foreground/[0.03] px-3 py-2 text-foreground/70 text-xs"
				>
					<span className="capitalize">{type}</span>
					<input
						type="checkbox"
						checked={visiblePathTypes.has(type)}
						onChange={(event) => {
							const next = new Set(visiblePathTypes);
							if (event.target.checked) next.add(type);
							else next.delete(type);
							onVisiblePathTypesChange(next);
						}}
					/>
				</label>
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
		<label className="mt-4 block text-foreground/62 text-xs first:mt-0">
			{label}
			<select
				className="mt-1 h-10 w-full rounded border border-foreground/12 bg-foreground/[0.04] px-3 text-foreground text-sm outline-none focus:border-primary/60"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			>
				{options.map(([optionValue, optionLabel]) => (
					<option key={optionValue} value={optionValue}>
						{optionLabel}
					</option>
				))}
			</select>
		</label>
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
		<label className="text-foreground/62 text-xs">
			<span className="flex justify-between gap-2">
				{label}
				<span>{Math.round(value * 100)}%</span>
			</span>
			<input
				className="mt-2 w-full accent-[#d9b56f]"
				max="1"
				min="0"
				step="0.01"
				type="range"
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
		</label>
	);
}
