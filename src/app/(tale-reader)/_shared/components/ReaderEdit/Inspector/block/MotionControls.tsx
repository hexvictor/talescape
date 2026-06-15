"use client";

import type { BlockCameraPath, BlockFlow, Direction } from "../../../../types";
import {
	Setting,
	settingClassName,
} from "../../../ReaderUi/TaleDebug/DebugPrimitives";

/**
 * Edits directional block arrangement or switches to layered overlap.
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
				label="Flow mode"
				readerRole="flow-mode-setting"
			>
				<select
					className={settingClassName}
					value={flow.type}
					onChange={(event) =>
						onChange(
							event.target.value === "stack"
								? { type: "stack" }
								: { direction: "right", type: "linear" },
						)
					}
				>
					<option value="linear">Linear</option>
					<option value="stack">Stack</option>
				</select>
			</Setting>
			{flow.type === "linear" ? (
				<>
					<Setting label="Transition direction">
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
					<Setting label="Transition placement">
						<select
							className={settingClassName}
							value={flow.placement ?? "blockEdge"}
							onChange={(event) =>
								onChange({
									...flow,
									placement: event.target.value as "blockEdge" | "cameraEdge",
								})
							}
						>
							<option value="blockEdge">Block edge</option>
							<option value="cameraEdge">Camera endpoint</option>
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
