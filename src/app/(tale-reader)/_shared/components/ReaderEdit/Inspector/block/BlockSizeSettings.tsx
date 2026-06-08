import type { BlockSize } from "../../../../types";
import {
	DebugCard,
	Setting,
	settingClassName,
} from "../../../ReaderUi/TaleDebug/DebugPrimitives";
import {
	OptionalUnitNumberSetting,
	UnitNumberSetting,
} from "../InspectorValueFields";

/**
 * Edits block sizing and viewport placement.
 *
 * @param props - Component props.
 * @param props.onChange - Receives the next size configuration.
 * @param props.size - Current block size.
 * @returns Block size controls.
 */
export function BlockSizeSettings({
	onChange,
	size,
}: {
	onChange: (size: BlockSize) => void;
	size: BlockSize;
}): React.JSX.Element {
	return (
		<DebugCard title="Size and placement">
			<Setting label="Sizing mode">
				<select
					className={settingClassName}
					value={size.mode}
					onChange={(event) =>
						onChange(
							event.target.value === "manual"
								? {
										height: 1,
										heightUnit: "viewport",
										horizontalAlignment: size.horizontalAlignment,
										mode: "manual",
										verticalAlignment: size.verticalAlignment,
										width: 1,
										widthUnit: "viewport",
									}
								: {
										horizontalAlignment: size.horizontalAlignment,
										mode: "content",
										verticalAlignment: size.verticalAlignment,
									},
						)
					}
				>
					<option value="content">Content responsive</option>
					<option value="manual">Explicit dimensions</option>
				</select>
			</Setting>
			{size.mode === "manual" ? (
				<>
					<UnitNumberSetting
						label="Width"
						unit={size.widthUnit}
						value={size.width}
						onChange={(width, widthUnit) =>
							onChange({ ...size, width, widthUnit })
						}
					/>
					<UnitNumberSetting
						label="Height"
						unit={size.heightUnit}
						value={size.height}
						onChange={(height, heightUnit) =>
							onChange({ ...size, height, heightUnit })
						}
					/>
				</>
			) : (
				<>
					<OptionalUnitNumberSetting
						label="Minimum width"
						unit={size.minWidthUnit}
						value={size.minWidth}
						onChange={(minWidth, minWidthUnit) =>
							onChange({ ...size, minWidth, minWidthUnit })
						}
					/>
					<OptionalUnitNumberSetting
						label="Minimum height"
						unit={size.minHeightUnit}
						value={size.minHeight}
						onChange={(minHeight, minHeightUnit) =>
							onChange({ ...size, minHeight, minHeightUnit })
						}
					/>
					<OptionalUnitNumberSetting
						label="Maximum width"
						unit={size.maxWidthUnit}
						value={size.maxWidth}
						onChange={(maxWidth, maxWidthUnit) =>
							onChange({ ...size, maxWidth, maxWidthUnit })
						}
					/>
					<OptionalUnitNumberSetting
						label="Maximum height"
						unit={size.maxHeightUnit}
						value={size.maxHeight}
						onChange={(maxHeight, maxHeightUnit) =>
							onChange({ ...size, maxHeight, maxHeightUnit })
						}
					/>
				</>
			)}
			<AlignmentSetting
				label="Horizontal placement"
				options={["left", "center", "right"]}
				value={size.horizontalAlignment}
				onChange={(horizontalAlignment) =>
					onChange({ ...size, horizontalAlignment })
				}
			/>
			<AlignmentSetting
				label="Vertical placement"
				options={["top", "center", "bottom"]}
				value={size.verticalAlignment}
				onChange={(verticalAlignment) =>
					onChange({ ...size, verticalAlignment })
				}
			/>
		</DebugCard>
	);
}

/**
 * Renders an alignment select.
 *
 * @param props - Component props.
 * @param props.label - Field label.
 * @param props.onChange - Receives a selected option.
 * @param props.options - Available alignment values.
 * @param props.value - Current alignment.
 * @returns Alignment select.
 */
function AlignmentSetting<Value extends string>({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: Value) => void;
	options: Value[];
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
