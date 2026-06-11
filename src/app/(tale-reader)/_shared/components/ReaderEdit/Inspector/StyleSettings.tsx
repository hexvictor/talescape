import type { ReaderStyle } from "../../../types";
import {
	DebugCard,
	Setting,
	settingClassName,
} from "../../ReaderUi/TaleDebug/DebugPrimitives";
import { NumberSetting, TextSetting } from "./InspectorValueFields";

/**
 * Edits common safe style properties with advanced layout fields in a disclosure.
 *
 * @param props - Component props.
 * @param props.className - Optional wrapper class.
 * @param props.onChange - Receives the next style.
 * @param props.style - Current style.
 * @param props.title - Card title.
 * @returns Style controls.
 */
export function StyleSettings({
	className,
	onChange,
	style,
	title,
}: {
	className?: string;
	onChange: (style: ReaderStyle) => void;
	style?: ReaderStyle;
	title: string;
}): React.JSX.Element {
	const current = style ?? {};
	const setText = (key: keyof ReaderStyle, value: string): void => {
		onChange({ ...current, [key]: value || undefined });
	};
	return (
		<section
			data-reader-component="StyleSettings"
			data-reader-role="style-settings"
			className={className}
		>
			<DebugCard title={title}>
				<TextSetting
					label="Background"
					value={current.backgroundCss ?? current.background ?? ""}
					onChange={(value) => setText("backgroundCss", value)}
				/>
				<TextSetting
					label="Background image"
					value={current.backgroundImage ?? ""}
					onChange={(value) => setText("backgroundImage", value)}
				/>
				<TextSetting
					label="Text color"
					value={current.color ?? ""}
					onChange={(value) => setText("color", value)}
				/>
				<TextSetting
					label="Border"
					value={current.border ?? ""}
					onChange={(value) => setText("border", value)}
				/>
				<NumberSetting
					label="Border radius"
					value={current.borderRadius ?? 0}
					onChange={(borderRadius) => onChange({ ...current, borderRadius })}
				/>
				<TextSetting
					label="Padding"
					value={String(current.padding ?? "")}
					onChange={(value) => setText("padding", value)}
				/>
				<Setting label="Text alignment">
					<select
						className={settingClassName}
						value={current.textAlign ?? "left"}
						onChange={(event) =>
							onChange({
								...current,
								textAlign: event.target.value as ReaderStyle["textAlign"],
							})
						}
					>
						<option value="left">Left</option>
						<option value="center">Center</option>
						<option value="right">Right</option>
						<option value="justify">Justify</option>
					</select>
				</Setting>
				<details className="col-span-2 rounded border border-white/8 p-2">
					<summary className="cursor-pointer font-semibold text-[10px] text-white/52 uppercase">
						Advanced layout and CSS
					</summary>
					<div className="mt-3 grid grid-cols-2 gap-2">
						<TextSetting
							label="Width"
							value={String(current.width ?? "")}
							onChange={(value) => setText("width", value)}
						/>
						<TextSetting
							label="Height"
							value={String(current.height ?? "")}
							onChange={(value) => setText("height", value)}
						/>
						<TextSetting
							label="Minimum width"
							value={String(current.minWidth ?? "")}
							onChange={(value) => setText("minWidth", value)}
						/>
						<TextSetting
							label="Minimum height"
							value={String(current.minHeight ?? "")}
							onChange={(value) => setText("minHeight", value)}
						/>
						<TextSetting
							label="Maximum width"
							value={String(current.maxWidth ?? "")}
							onChange={(value) => setText("maxWidth", value)}
						/>
						<TextSetting
							label="Maximum height"
							value={String(current.maxHeight ?? "")}
							onChange={(value) => setText("maxHeight", value)}
						/>
						<TextSetting
							label="Margin"
							value={String(current.margin ?? "")}
							onChange={(value) => setText("margin", value)}
						/>
						<TextSetting
							label="Box shadow"
							value={current.boxShadow ?? ""}
							onChange={(value) => setText("boxShadow", value)}
						/>
						<TextSetting
							label="Grid area"
							value={current.gridArea ?? ""}
							onChange={(value) => setText("gridArea", value)}
						/>
						<TextSetting
							label="Grid column"
							value={current.gridColumn ?? ""}
							onChange={(value) => setText("gridColumn", value)}
						/>
						<TextSetting
							label="Grid row"
							value={current.gridRow ?? ""}
							onChange={(value) => setText("gridRow", value)}
						/>
						<TextSetting
							label="Custom CSS"
							value={current.cssText ?? ""}
							onChange={(value) => setText("cssText", value)}
						/>
					</div>
				</details>
			</DebugCard>
		</section>
	);
}
