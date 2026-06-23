"use client";

import {
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type {
	BlockCameraPath,
	BlockFlow,
	Direction,
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
								? { type: "stack" }
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
										| "cameraEdge",
								})
							}
						>
							<option value="blockEdge">Previous block edge</option>
							<option value="blockEdgeWithViewportAlignment">
								Block edge + camera alignment
							</option>
							<option value="cameraEdge">Previous camera viewport</option>
						</select>
					</Setting>
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
			) : null}
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
			className="col-span-2 grid grid-cols-2 gap-2"
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
