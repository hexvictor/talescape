import {
	DebugCard,
	Setting,
} from "~/app/(tale-app)/_shared/components/ReaderUi/TaleDebug/DebugPrimitives";
import type { SceneSize } from "~/app/(tale-app)/_shared/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	InspectorSelect,
	OptionalUnitNumberSetting,
	UnitNumberSetting,
} from "../InspectorValueFields";

/**
 * Edits scene sizing and camera framing.
 *
 * @param props - Component props.
 * @param props.onChange - Receives the next size configuration.
 * @param props.size - Current scene size.
 * @returns Scene size controls.
 */
export function SceneSizeSettings({
	onChange,
	size,
}: {
	onChange: (size: SceneSize) => void;
	size: SceneSize;
}): React.JSX.Element {
	return (
		<DebugCard
			componentName="SceneSizeSettings"
			contentClassName="grid-cols-1"
			readerRole="scene-size-settings"
			title="Size and placement"
		>
			<div className="rounded border border-foreground/8 bg-background/15 p-3">
				<Setting label="Sizing mode">
					<SceneSizeSelect
						label="Sizing mode"
						value={size.mode}
						options={[
							{ label: "Content responsive", value: "content" },
							{ label: "Explicit dimensions", value: "manual" },
						]}
						onChange={(value) => {
							const mode = value as SceneSize["mode"];
							onChange(createSizeForMode(mode, size));
						}}
					/>
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
				) : null}
			</SizeSettingsSection>
			<SizeSettingsSection title="Size limits">
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
	mode: SceneSize["mode"],
	previous: SceneSize,
): SceneSize {
	if (mode === "manual") {
		return {
			...previous,
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
		...previous,
		horizontalAlignment: previous.horizontalAlignment,
		mode,
		verticalAlignment: previous.verticalAlignment,
	};
}

/**
 * Groups related scene size controls into a responsive inspector section.
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
		<section className="@container/size-section min-w-0 rounded border border-foreground/8 bg-background/15 p-3">
			<h4 className="mb-2 font-bold text-[10px] text-foreground/42 uppercase">
				{title}
			</h4>
			<div className="grid min-w-0 @min-[38rem]/size-section:grid-cols-2 grid-cols-1 gap-3">
				{children}
			</div>
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
			<SceneSizeSelect
				label={label}
				value={value}
				options={options.map((option) => ({ label: option, value: option }))}
				onChange={(nextValue) => onChange(nextValue as Value)}
			/>
		</Setting>
	);
}

const SceneSizeSelect = InspectorSelect;
