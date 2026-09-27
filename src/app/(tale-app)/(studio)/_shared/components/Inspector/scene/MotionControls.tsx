"use client";

import { Setting } from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type {
	Direction,
	SceneCameraPath,
	SceneFlow,
	StackPlacementPosition,
} from "~/app/(tale-app)/_shared/types";
import Input from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

/**
 * Edits physical scene placement independently from camera framing.
 *
 * @param props - Component props.
 * @param props.flow - Current scene flow.
 * @param props.onChange - Receives the next flow.
 * @returns Flow controls.
 */
export function FlowSettings({
	flow,
	onChange,
}: {
	flow: SceneFlow;
	onChange: (flow: SceneFlow) => void;
}): React.JSX.Element {
	return (
		<>
			<Setting
				componentName="FlowSettings"
				label="Scene placement"
				readerRole="flow-mode-setting"
			>
				<SceneSettingSelect
					label="Scene placement"
					value={flow.type}
					options={[
						{ label: "Adjacent", value: "linear" },
						{ label: "Stacked", value: "stack" },
					]}
					onChange={(value) =>
						onChange(
							value === "stack"
								? {
										horizontalPlacement: "center",
										placement: "blockEdge",
										type: "stack",
										verticalPlacement: "center",
									}
								: {
										alignment: "center",
										direction: "right",
										type: "linear",
									},
						)
					}
				/>
			</Setting>
			{flow.type === "linear" ? (
				<>
					<Setting label="Placement direction">
						<SceneSettingSelect
							label="Placement direction"
							value={flow.direction}
							options={directions.map((direction) => ({
								label: direction,
								value: direction,
							}))}
							onChange={(value) =>
								onChange({
									...flow,
									direction: value as Direction,
								})
							}
						/>
					</Setting>
					<Setting label="Cross-axis alignment">
						<SceneSettingSelect
							label="Cross-axis alignment"
							value={flow.alignment ?? "center"}
							options={[
								{ label: "Start edge", value: "start" },
								{ label: "Center", value: "center" },
								{ label: "End edge", value: "end" },
							]}
							onChange={(value) =>
								onChange({
									...flow,
									alignment: value as "center" | "end" | "start",
								})
							}
						/>
					</Setting>
					<Setting label="Placement reference">
						<SceneSettingSelect
							label="Placement reference"
							value={flow.placement ?? "blockEdge"}
							options={[
								{ label: "Previous scene edge", value: "blockEdge" },
								{
									label: "Scene edge + camera alignment",
									value: "blockEdgeWithViewportAlignment",
								},
								{ label: "Smart group edge", value: "groupEdge" },
								{ label: "Previous camera viewport", value: "cameraEdge" },
							]}
							onChange={(value) =>
								onChange({
									...flow,
									placement: value as
										| "blockEdge"
										| "blockEdgeWithViewportAlignment"
										| "cameraEdge"
										| "groupEdge",
								})
							}
						/>
					</Setting>
					{flow.placement === "groupEdge" ? (
						<Setting label="Panel horizontal alignment">
							<SceneSettingSelect
								label="Panel horizontal alignment"
								value={flow.groupHorizontalAlignment ?? "center"}
								options={[
									{ label: "Left", value: "start" },
									{ label: "Center", value: "center" },
									{ label: "Right", value: "end" },
								]}
								onChange={(value) =>
									onChange({
										...flow,
										groupHorizontalAlignment: value as
											| "center"
											| "end"
											| "start",
									})
								}
							/>
						</Setting>
					) : null}
					<MotionNumber
						label="Scene spacing"
						value={flow.spacing?.value ?? 0}
						onChange={(value) =>
							onChange({
								...flow,
								spacing: {
									unit: flow.spacing?.unit ?? "px",
									value: value ?? 0,
								},
							})
						}
					/>
					<Setting label="Spacing unit">
						<SceneSettingSelect
							label="Spacing unit"
							value={flow.spacing?.unit ?? "px"}
							options={[
								{ label: "Pixels", value: "px" },
								{ label: "Viewport spans", value: "viewport" },
							]}
							onChange={(value) =>
								onChange({
									...flow,
									spacing: {
										unit: value as "px" | "viewport",
										value: flow.spacing?.value ?? 0,
									},
								})
							}
						/>
					</Setting>
				</>
			) : (
				<>
					<Setting label="Stack preset">
						<SceneSettingSelect
							label="Stack preset"
							value={getStackPreset(flow)}
							options={[
								{ label: "Top left", value: "top-left" },
								{ label: "Top center", value: "top-center" },
								{ label: "Top right", value: "top-right" },
								{ label: "Center left", value: "center-left" },
								{ label: "Center", value: "center" },
								{ label: "Center right", value: "center-right" },
								{ label: "Bottom left", value: "bottom-left" },
								{ label: "Bottom center", value: "bottom-center" },
								{ label: "Bottom right", value: "bottom-right" },
								{ label: "Custom percent", value: "custom" },
							]}
							onChange={(value) =>
								onChange({
									...flow,
									...getStackPresetFlow(value),
								})
							}
						/>
					</Setting>
					<Setting label="Horizontal alignment">
						<SceneSettingSelect
							label="Horizontal alignment"
							value={getStackAxisPlacement(
								flow.horizontalPosition,
								flow.horizontalPlacement,
								flow.alignment,
							)}
							options={[
								{ label: "Left", value: "start" },
								{ label: "Center", value: "center" },
								{ label: "Right", value: "end" },
								{ label: "Custom percent", value: "custom" },
							]}
							onChange={(value) => {
								const placement = value as StackPlacementPosition | "custom";
								onChange(
									placement === "custom"
										? {
												...flow,
												horizontalPlacement: undefined,
												horizontalPosition: getStackAxisPosition(
													flow.horizontalPosition,
													flow.horizontalPlacement,
													flow.alignment,
												),
											}
										: {
												...flow,
												horizontalPlacement: placement,
												horizontalPosition: undefined,
											},
								);
							}}
						/>
					</Setting>
					<Setting label="Vertical alignment">
						<SceneSettingSelect
							label="Vertical alignment"
							value={getStackAxisPlacement(
								flow.verticalPosition,
								flow.verticalPlacement,
								flow.alignment,
							)}
							options={[
								{ label: "Top", value: "start" },
								{ label: "Center", value: "center" },
								{ label: "Bottom", value: "end" },
								{ label: "Custom percent", value: "custom" },
							]}
							onChange={(value) => {
								const placement = value as StackPlacementPosition | "custom";
								onChange(
									placement === "custom"
										? {
												...flow,
												verticalPlacement: undefined,
												verticalPosition: getStackAxisPosition(
													flow.verticalPosition,
													flow.verticalPlacement,
													flow.alignment,
												),
											}
										: {
												...flow,
												verticalPlacement: placement,
												verticalPosition: undefined,
											},
								);
							}}
						/>
					</Setting>
					<Setting label="Horizontal position">
						<Input
							aria-label="Horizontal position"
							density="compact"
							max="1"
							min="0"
							step="0.05"
							type="number"
							value={getStackAxisPosition(
								flow.horizontalPosition,
								flow.horizontalPlacement,
								flow.alignment,
							)}
							onChange={(event) =>
								onChange({
									...flow,
									horizontalPlacement: undefined,
									horizontalPosition: Number(event.target.value),
								})
							}
						/>
					</Setting>
					<Setting label="Vertical position">
						<Input
							aria-label="Vertical position"
							density="compact"
							max="1"
							min="0"
							step="0.05"
							type="number"
							value={getStackAxisPosition(
								flow.verticalPosition,
								flow.verticalPlacement,
								flow.alignment,
							)}
							onChange={(event) =>
								onChange({
									...flow,
									verticalPlacement: undefined,
									verticalPosition: Number(event.target.value),
								})
							}
						/>
					</Setting>
					<Setting label="Placement reference">
						<SceneSettingSelect
							label="Placement reference"
							value={flow.placement ?? "blockEdge"}
							options={[
								{ label: "Previous scene", value: "blockEdge" },
								{
									label: "Previous camera viewpoint",
									value: "blockEdgeWithViewportAlignment",
								},
								{ label: "Previous camera viewport", value: "cameraEdge" },
							]}
							onChange={(value) =>
								onChange({
									...flow,
									placement: value as
										| "blockEdge"
										| "blockEdgeWithViewportAlignment"
										| "cameraEdge",
								})
							}
						/>
					</Setting>
				</>
			)}
		</>
	);
}

/**
 * Edits a camera path mode and straight direction.
 *
 * @param props - Component props.
 * @param props.onChange - Receives the next path.
 * @param props.path - Current camera path.
 * @returns Camera path controls.
 */
export function CameraPathSettings({
	onChange,
	path,
}: {
	onChange: (path: SceneCameraPath) => void;
	path: SceneCameraPath;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="CameraPathSettings"
			data-reader-role="camera-path-settings"
			data-studio-component="CameraPathSettings"
			data-studio-role="camera-path-settings"
			className="@container/inspector-group col-span-2 grid min-w-0 @min-[32rem]/inspector-group:grid-cols-2 grid-cols-1 gap-2"
		>
			<Setting label="Camera path">
				<SceneSettingSelect
					label="Camera path"
					value={path.mode}
					options={[
						{ label: "Auto", value: "auto" },
						{ label: "Reverse flow", value: "reverse-flow" },
						{ label: "Straight", value: "straight" },
						{ label: "Custom", value: "custom" },
					]}
					onChange={(value) => {
						const mode = value as SceneCameraPath["mode"];
						onChange(
							mode === "straight"
								? { direction: "down", mode }
								: mode === "custom"
									? { mode, points: [{ x: 0, y: 0 }] }
									: { mode },
						);
					}}
				/>
			</Setting>
			{path.mode === "straight" ? (
				<Setting label="Direction">
					<SceneSettingSelect
						label="Direction"
						value={path.direction}
						options={directions.map((direction) => ({
							label: direction,
							value: direction,
						}))}
						onChange={(value) =>
							onChange({
								...path,
								direction: value as Direction,
							})
						}
					/>
				</Setting>
			) : null}
		</div>
	);
}

/**
 * Renders an optional numeric motion field.
 *
 * @param props - Component props.
 * @param props.label - Field label.
 * @param props.onChange - Receives a number or null.
 * @param props.value - Current value.
 * @returns Numeric input.
 */
export function MotionNumber({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: number | null) => void;
	value: number | null;
}): React.JSX.Element {
	return (
		<Setting
			componentName="MotionNumber"
			label={label}
			readerRole="motion-number-setting"
		>
			<Input
				aria-label={label}
				density="compact"
				min="0"
				type="number"
				value={value ?? ""}
				onChange={(event) =>
					onChange(
						event.target.value === "" ? null : Number(event.target.value),
					)
				}
			/>
		</Setting>
	);
}

function SceneSettingSelect({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	options: readonly { label: string; value: string }[];
	value: string;
}): React.JSX.Element {
	return (
		<Select aria-label={label} value={value} onValueChange={onChange}>
			<SelectTrigger className="w-full" density="compact">
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

const directions: Direction[] = [
	"down",
	"down-left",
	"down-right",
	"left",
	"right",
	"up",
	"up-left",
	"up-right",
];

type StackPreset =
	| "bottom-center"
	| "bottom-left"
	| "bottom-right"
	| "center"
	| "center-left"
	| "center-right"
	| "custom"
	| "top-center"
	| "top-left"
	| "top-right";

/**
 * Resolves the selected stacked-position preset from a flow config.
 *
 * @param flow - Current stack flow.
 * @returns Matching preset id, or custom for arbitrary percentages.
 *
 * @example
 * const preset = getStackPreset(flow);
 */
function getStackPreset(
	flow: Extract<SceneFlow, { type: "stack" }>,
): StackPreset {
	const horizontal = getStackAxisPosition(
		flow.horizontalPosition,
		flow.horizontalPlacement,
		flow.alignment,
	);
	const vertical = getStackAxisPosition(
		flow.verticalPosition,
		flow.verticalPlacement,
		flow.alignment,
	);
	const preset = stackPresetEntries.find(
		(item) => item.horizontal === horizontal && item.vertical === vertical,
	);
	return preset?.id ?? "custom";
}

/**
 * Creates stack-flow placement fields from a preset id.
 *
 * @param presetId - Stack placement preset id.
 * @returns Flow fields for horizontal and vertical placement.
 *
 * @example
 * const fields = getStackPresetFlow("top-right");
 */
function getStackPresetFlow(
	presetId: string,
): Partial<Extract<SceneFlow, { type: "stack" }>> {
	const preset = stackPresetEntries.find((item) => item.id === presetId);
	if (!preset) {
		return {
			horizontalPlacement: undefined,
			horizontalPosition: 0.5,
			verticalPlacement: undefined,
			verticalPosition: 0.5,
		};
	}
	return {
		horizontalPlacement: positionToPlacement(preset.horizontal),
		horizontalPosition: undefined,
		verticalPlacement: positionToPlacement(preset.vertical),
		verticalPosition: undefined,
	};
}

/**
 * Resolves a stack axis placement to a normalized number.
 *
 * @param position - Explicit normalized position.
 * @param placement - Named placement.
 * @param fallback - Legacy single-axis placement.
 * @returns Normalized placement from 0 to 1.
 *
 * @example
 * const x = getStackAxisPosition(undefined, "end", "center");
 */
function getStackAxisPosition(
	position: number | undefined,
	placement: StackPlacementPosition | undefined,
	fallback: StackPlacementPosition | undefined,
): number {
	if (typeof position === "number" && Number.isFinite(position)) {
		return position;
	}
	const resolved = placement ?? fallback ?? "center";
	if (resolved === "start") return 0;
	if (resolved === "end") return 1;
	return 0.5;
}

/**
 * Resolves a stack axis select value from either explicit percentage or named
 * placement fields.
 *
 * @param position - Explicit normalized position.
 * @param placement - Named placement.
 * @param fallback - Legacy single-axis placement.
 * @returns Named placement or custom when the value is not a preset.
 *
 * @example
 * const value = getStackAxisPlacement(0.25, undefined, "center");
 */
function getStackAxisPlacement(
	position: number | undefined,
	placement: StackPlacementPosition | undefined,
	fallback: StackPlacementPosition | undefined,
): StackPlacementPosition | "custom" {
	if (typeof position === "number" && Number.isFinite(position)) {
		if (Math.abs(position - 0) < 0.001) return "start";
		if (Math.abs(position - 0.5) < 0.001) return "center";
		if (Math.abs(position - 1) < 0.001) return "end";
		return "custom";
	}
	return placement ?? fallback ?? "center";
}

/**
 * Converts a normalized preset position to a named placement field.
 *
 * @param position - Normalized preset value.
 * @returns Named stack placement.
 *
 * @example
 * const placement = positionToPlacement(1);
 */
function positionToPlacement(position: number): StackPlacementPosition {
	if (position <= 0) return "start";
	if (position >= 1) return "end";
	return "center";
}

const stackPresetEntries: Array<{
	horizontal: number;
	id: Exclude<StackPreset, "custom">;
	vertical: number;
}> = [
	{ horizontal: 0, id: "top-left", vertical: 0 },
	{ horizontal: 0.5, id: "top-center", vertical: 0 },
	{ horizontal: 1, id: "top-right", vertical: 0 },
	{ horizontal: 0, id: "center-left", vertical: 0.5 },
	{ horizontal: 0.5, id: "center", vertical: 0.5 },
	{ horizontal: 1, id: "center-right", vertical: 0.5 },
	{ horizontal: 0, id: "bottom-left", vertical: 1 },
	{ horizontal: 0.5, id: "bottom-center", vertical: 1 },
	{ horizontal: 1, id: "bottom-right", vertical: 1 },
];
