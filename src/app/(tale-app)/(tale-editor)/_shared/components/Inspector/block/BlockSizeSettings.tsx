import {
	DebugCard,
	Setting,
	settingClassName,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type { BlockSize } from "~/app/(tale-app)/_shared/types";
import {
	OptionalUnitNumberSetting,
	UnitNumberSetting,
} from "../InspectorValueFields";

/**
 * Edits block sizing and camera framing.
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
		<DebugCard
			componentName="BlockSizeSettings"
			contentClassName="grid-cols-1"
			readerRole="block-size-settings"
			title="Size and placement"
		>
			<div className="rounded border border-foreground/8 bg-background/15 p-3">
				<Setting label="Sizing mode">
					<select
						className={settingClassName}
						value={size.mode}
						onChange={(event) => {
							const mode = event.target.value as BlockSize["mode"];
							onChange(createSizeForMode(mode, size));
						}}
					>
						<option value="content">Content responsive</option>
						<option value="manual">Explicit dimensions</option>
					</select>
				</Setting>
			</div>
			<SizeSettingsSection title="Dimensions">
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
			</SizeSettingsSection>
			<SizeSettingsSection title="Camera framing">
				<AlignmentSetting
					label="Horizontal"
					options={["auto", "left", "center", "right"]}
					value={size.horizontalAlignment}
					onChange={(horizontalAlignment) =>
						onChange({ ...size, horizontalAlignment })
					}
				/>
				<AlignmentSetting
					label="Vertical"
					options={["auto", "top", "center", "bottom"]}
					value={size.verticalAlignment}
					onChange={(verticalAlignment) =>
						onChange({ ...size, verticalAlignment })
					}
				/>
			</SizeSettingsSection>
		</DebugCard>
	);
}

/**
 * Creates a size config when switching between sizing modes.
 *
 * @param mode - Target sizing mode.
 * @param previous - Previous size config used to preserve camera framing.
 * @returns New size config for the target mode.
 *
 * @example
 * const size = createSizeForMode("manual", previous);
 */
function createSizeForMode(
	mode: BlockSize["mode"],
	previous: BlockSize,
): BlockSize {
	if (mode === "manual") {
		return {
			height: "height" in previous ? previous.height : 1,
			heightUnit: "heightUnit" in previous ? previous.heightUnit : "viewport",
			horizontalAlignment: previous.horizontalAlignment,
			mode,
			verticalAlignment: previous.verticalAlignment,
			width: "width" in previous ? previous.width : 1,
			widthUnit: "widthUnit" in previous ? previous.widthUnit : "viewport",
		};
	}
	return {
		horizontalAlignment: previous.horizontalAlignment,
		mode,
		verticalAlignment: previous.verticalAlignment,
	};
}

/**
 * Groups related block size controls into a responsive inspector section.
 *
 * @param props - Section props.
 * @param props.children - Size controls rendered in the section.
 * @param props.title - Section heading.
 * @returns Grouped size settings.
 */
function SizeSettingsSection({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}): React.JSX.Element {
	return (
		<section className="rounded border border-foreground/8 bg-background/15 p-3">
			<h4 className="mb-2 font-bold text-[10px] text-foreground/42 uppercase">
				{title}
			</h4>
			<div className="grid grid-cols-1 gap-3 xl:grid-cols-2">{children}</div>
		</section>
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
		<Setting
			componentName="AlignmentSetting"
			label={label}
			readerRole="alignment-setting"
		>
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
