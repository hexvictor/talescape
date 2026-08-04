"use client";

import {
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type {
	BlockCameraPath,
	BlockFlow,
	Direction,
	StackPlacementPosition,
} from "~/app/(tale-app)/_shared/types";

/**
 * Edits physical block placement independently from camera framing.
 *
 * @param props - Component props.
 * @param props.flow - Current block flow.
 * @param props.onChange - Receives the next flow.
 * @returns Flow controls.
 */
export function FlowSettings({
	flow,
	onChange,
}: {
	flow: BlockFlow;
	onChange: (flow: BlockFlow) => void;
}): React.JSX.Element {
	return (
		<>
			<Setting
				componentName="FlowSettings"
				label="Block placement"
				readerRole="flow-mode-setting"
			>
				<select
					className={settingClassName}
					value={flow.type}
					onChange={(event) =>
						onChange(
							event.target.value === "stack"
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
				>
					<option value="linear">Adjacent</option>
					<option value="stack">Stacked</option>
				</select>
			</Setting>
			{flow.type === "linear" ? (
				<>
					<Setting label="Placement direction">
						<select
							className={settingClassName}
							value={flow.direction}
							onChange={(event) =>
								onChange({
									...flow,
									direction: event.target.value as Direction,
								})
							}
						>
							{directions.map((direction) => (
								<option key={direction} value={direction}>
									{direction}
								</option>
							))}
						</select>
					</Setting>
					<Setting label="Cross-axis alignment">
						<select
							className={settingClassName}
							value={flow.alignment ?? "center"}
							onChange={(event) =>
								onChange({
									...flow,
									alignment: event.target.value as "center" | "end" | "start",
								})
							}
						>
							<option value="start">Start edge</option>
							<option value="center">Center</option>
							<option value="end">End edge</option>
						</select>
					</Setting>
					<Setting label="Placement reference">
						<select
							className={settingClassName}
							value={flow.placement ?? "blockEdge"}
							onChange={(event) =>
								onChange({
									...flow,
									placement: event.target.value as
										| "blockEdge"
										| "blockEdgeWithViewportAlignment"
										| "cameraEdge"
										| "groupEdge",
								})
							}
						>
							<option value="blockEdge">Previous block edge</option>
							<option value="blockEdgeWithViewportAlignment">
								Block edge + camera alignment
							</option>
							<option value="groupEdge">Smart group edge</option>
							<option value="cameraEdge">Previous camera viewport</option>
						</select>
					</Setting>
					{flow.placement === "groupEdge" ? (
						<Setting label="Smart horizontal alignment">
							<select
								className={settingClassName}
								value={flow.groupHorizontalAlignment ?? "center"}
								onChange={(event) =>
									onChange({
										...flow,
										groupHorizontalAlignment: event.target.value as
											| "center"
											| "end"
											| "start",
									})
								}
							>
								<option value="start">Left</option>
								<option value="center">Center</option>
								<option value="end">Right</option>
							</select>
						</Setting>
					) : null}
					<MotionNumber
						label="Block spacing"
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
						<select
							className={settingClassName}
							value={flow.spacing?.unit ?? "px"}
							onChange={(event) =>
								onChange({
									...flow,
									spacing: {
										unit: event.target.value as "px" | "viewport",
										value: flow.spacing?.value ?? 0,
									},
								})
							}
						>
							<option value="px">Pixels</option>
							<option value="viewport">Viewport spans</option>
						</select>
					</Setting>
				</>
			) : (
				<>
					<Setting label="Stack preset">
						<select
							className={settingClassName}
							value={getStackPreset(flow)}
							onChange={(event) =>
								onChange({
									...flow,
									...getStackPresetFlow(event.target.value),
								})
							}
						>
							<option value="top-left">Top left</option>
							<option value="top-center">Top center</option>
							<option value="top-right">Top right</option>
							<option value="center-left">Center left</option>
							<option value="center">Center</option>
							<option value="center-right">Center right</option>
							<option value="bottom-left">Bottom left</option>
							<option value="bottom-center">Bottom center</option>
							<option value="bottom-right">Bottom right</option>
							<option value="custom">Custom percent</option>
						</select>
					</Setting>
					<Setting label="Horizontal alignment">
						<select
							className={settingClassName}
							value={getStackAxisPlacement(
								flow.horizontalPosition,
								flow.horizontalPlacement,
								flow.alignment,
							)}
							onChange={(event) => {
								const placement = event.target.value as
									| StackPlacementPosition
									| "custom";
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
						>
							<option value="start">Left</option>
							<option value="center">Center</option>
							<option value="end">Right</option>
							<option value="custom">Custom percent</option>
						</select>
					</Setting>
					<Setting label="Vertical alignment">
						<select
							className={settingClassName}
							value={getStackAxisPlacement(
								flow.verticalPosition,
								flow.verticalPlacement,
								flow.alignment,
							)}
							onChange={(event) => {
								const placement = event.target.value as
									| StackPlacementPosition
									| "custom";
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
						>
							<option value="start">Top</option>
							<option value="center">Center</option>
							<option value="end">Bottom</option>
							<option value="custom">Custom percent</option>
						</select>
					</Setting>
					<Setting label="Horizontal position">
						<input
							className={settingClassName}
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
						<input
							className={settingClassName}
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
						<select
							className={settingClassName}
							value={flow.placement ?? "blockEdge"}
							onChange={(event) =>
								onChange({
									...flow,
									placement: event.target.value as
										| "blockEdge"
										| "blockEdgeWithViewportAlignment"
										| "cameraEdge",
								})
							}
						>
							<option value="blockEdge">Previous block</option>
							<option value="blockEdgeWithViewportAlignment">
								Previous camera viewpoint
							</option>
							<option value="cameraEdge">Previous camera viewport</option>
						</select>
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
	onChange: (path: BlockCameraPath) => void;
	path: BlockCameraPath;
}): React.JSX.Element {
	return (
		<div
			data-reader-component="CameraPathSettings"
			data-reader-role="camera-path-settings"
			className="@container/inspector-group col-span-2 grid min-w-0 @min-[32rem]/inspector-group:grid-cols-2 grid-cols-1 gap-2"
		>
			<Setting label="Camera path">
				<select
					className={settingClassName}
					value={path.mode}
					onChange={(event) => {
						const mode = event.target.value as BlockCameraPath["mode"];
						onChange(
							mode === "straight"
								? { direction: "down", mode }
								: mode === "custom"
									? { mode, points: [{ x: 0, y: 0 }] }
									: { mode },
						);
					}}
				>
					<option value="auto">Auto</option>
					<option value="reverse-flow">Reverse flow</option>
					<option value="straight">Straight</option>
					<option value="custom">Custom</option>
				</select>
			</Setting>
			{path.mode === "straight" ? (
				<Setting label="Direction">
					<select
						className={settingClassName}
						value={path.direction}
						onChange={(event) =>
							onChange({
								...path,
								direction: event.target.value as Direction,
							})
						}
					>
						{directions.map((direction) => (
							<option key={direction} value={direction}>
								{direction}
							</option>
						))}
					</select>
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
			<input
				className={settingClassName}
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
	flow: Extract<BlockFlow, { type: "stack" }>,
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
): Partial<Extract<BlockFlow, { type: "stack" }>> {
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
